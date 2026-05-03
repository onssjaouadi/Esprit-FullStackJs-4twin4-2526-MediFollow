import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// GET - Get responses for a questionnaire assignment
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get the assignment with all related data
    const assignment = await prisma.questionnaireAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        template: {
          include: {
            questions: {
              orderBy: { questionNumber: "asc" },
            },
          },
        },
        responses: {
          orderBy: {
            question: {
              questionNumber: "asc",
            },
          },
          include: {
            question: true,
          },
        },
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    if (user.role === "PATIENT") {
      // Patient can only view their own responses
      const patientRecord = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!patientRecord || assignment.patientId !== patientRecord.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (user.role === "DOCTOR") {
      // Doctor can only view responses from their own templates
      const template = await prisma.questionnaireTemplate.findUnique({
        where: { id: assignment.templateId },
        select: { doctorId: true },
      });

      if (!template || template.doctorId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Enrich responses with question details for easier rendering
    const enrichedResponses = assignment.template.questions.map((question) => {
      const response = assignment.responses.find(
        (r) => r.questionId === question.id
      );
      return {
        ...question,
        response: response || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        assignment: {
          id: assignment.id,
          status: assignment.status,
          completedAt: assignment.completedAt,
          assignedAt: assignment.assignedAt,
          dueDate: assignment.dueDate,
          patient: assignment.patient,
        },
        template: assignment.template,
        responses: enrichedResponses,
      },
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch responses",
      },
      { status: 500 }
    );
  }
}

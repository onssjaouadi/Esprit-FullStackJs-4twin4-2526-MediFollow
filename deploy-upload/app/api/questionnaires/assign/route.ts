import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// POST - Assign questionnaire template to patient(s)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only doctors can assign questionnaires" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { templateId, patientIds, dueDate } = body;

    if (!templateId || !patientIds || patientIds.length === 0) {
      return NextResponse.json(
        { error: "Template ID and patient IDs are required" },
        { status: 400 }
      );
    }

    // Verify template belongs to this doctor
    const template = await prisma.questionnaireTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || template.doctorId !== user.id) {
      return NextResponse.json(
        { error: "Template not found or access denied" },
        { status: 403 }
      );
    }

    // Create assignments
    const assignments = await prisma.questionnaireAssignment.createMany({
      data: patientIds.map((patientId: string) => ({
        templateId,
        patientId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: "PENDING",
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Questionnaire assigned to ${assignments.count} patient(s)`,
      count: assignments.count,
    });
  } catch (error) {
    console.error("Error assigning questionnaire:", error);
    return NextResponse.json(
      { error: "Failed to assign questionnaire" },
      { status: 500 }
    );
  }
}

// GET - Get patient's assignments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId") || undefined;
    const patientId = searchParams.get("patientId") || undefined;
    const status = searchParams.get("status") || undefined;

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: { patient: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If assignmentId is provided, fetch that specific assignment
    if (assignmentId) {
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
          responses: true,
        },
      });

      if (!assignment) {
        return NextResponse.json(
          { error: "Assignment not found" },
          { status: 404 }
        );
      }

      // Verify access: patients can only see their own, doctors can see patients they work with
      if (
        userRecord.role === "PATIENT" &&
        assignment.patientId !== userRecord.patient?.id
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        data: [assignment],
      });
    }

    // Verify access: patients can only see their own, doctors can see patients they work with
    let patientIdToUse = patientId;

    if (userRecord.role === "PATIENT") {
      if (!userRecord.patient?.id) {
        console.error(`Patient record not found for user ${user.id}`);
        return NextResponse.json(
          {
            error:
              "Patient profile not found. Please complete your patient profile first.",
          },
          { status: 404 }
        );
      }
      patientIdToUse = userRecord.patient.id;
    }

    const where: any = {
      patientId: patientIdToUse,
    };

    if (status) {
      where.status = status;
    }

    const assignments = await prisma.questionnaireAssignment.findMany({
      where,
      include: {
        template: {
          include: {
            questions: {
              orderBy: { questionNumber: "asc" },
            },
          },
        },
        responses: true,
      },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch assignments";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

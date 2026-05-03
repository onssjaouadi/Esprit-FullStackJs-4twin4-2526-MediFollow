import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { AssignmentStatus } from "@prisma/client";

// POST - Submit patient responses
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can submit responses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignmentId, responses } = body;

    if (!assignmentId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Assignment ID and responses array are required" },
        { status: 400 }
      );
    }

    // Fetch patient record
    const patientRecord = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patientRecord) {
      console.error(`Patient record not found for user ${user.id}`);
      return NextResponse.json(
        { error: "Patient record not found" },
        { status: 404 }
      );
    }

    // Verify assignment belongs to this patient
    const assignment = await prisma.questionnaireAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        template: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!assignment) {
      console.error(`Assignment ${assignmentId} not found`);
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.patientId !== patientRecord.id) {
      console.error(
        `Patient ${patientRecord.id} does not have access to assignment ${assignmentId}`
      );
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete existing responses for this assignment
    await prisma.questionnaireResponse.deleteMany({
      where: { assignmentId },
    });

    // Validate and create responses for each question
    const createdResponses = await Promise.all(
      responses.map((response: any) => {
        // Validate response data
        if (!response.questionId) {
          throw new Error("Each response must have a questionId");
        }

        // Ensure proper data types
        const data: any = {
          assignmentId,
          questionId: response.questionId,
        };

        // Set answer field - store as JSON string
        if (
          response.responseText !== undefined &&
          response.responseText !== null
        ) {
          data.answer = String(response.responseText);
        } else if (
          response.responseNumber !== undefined &&
          response.responseNumber !== null
        ) {
          data.answer = String(response.responseNumber);
        } else if (
          response.responseJson !== undefined &&
          response.responseJson !== null
        ) {
          data.answer = String(response.responseJson);
        } else {
          data.answer = null;
        }

        return prisma.questionnaireResponse.create({ data });
      })
    );

    // Update assignment status to COMPLETED
    const updatedAssignment = await prisma.questionnaireAssignment.update({
      where: { id: assignmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    console.log(
      `Successfully submitted ${createdResponses.length} responses for assignment ${assignmentId}`
    );

    return NextResponse.json({
      success: true,
      message: "Responses submitted successfully",
      data: {
        assignment: updatedAssignment,
        responseCount: createdResponses.length,
      },
    });
  } catch (error) {
    console.error("Error submitting responses:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to submit responses",
      },
      { status: 500 }
    );
  }
}

// GET - Get patient's response for a specific assignment
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

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: { patient: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assignment = await prisma.questionnaireAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify access
    if (
      userRecord.role === "PATIENT" &&
      assignment.patientId !== userRecord.patient?.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const responses = await prisma.questionnaireResponse.findMany({
      where: { assignmentId },
      include: {
        question: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: responses,
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}

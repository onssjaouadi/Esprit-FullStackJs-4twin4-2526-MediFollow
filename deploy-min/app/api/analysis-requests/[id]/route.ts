import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// PUT - Patient submits analysis results
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can submit analysis results" },
        { status: 403 }
      );
    }

    const requestId = params.id;
    const body = await request.json();
    const { submittedDocumentUrl, submittedDocumentName, patientNotes } = body;

    // Fetch patient record
    const patientRecord = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patientRecord) {
      return NextResponse.json(
        { error: "Patient record not found" },
        { status: 404 }
      );
    }

    // Fetch analysis request
    const analysisRequest = await prisma.analysisRequest.findUnique({
      where: { id: requestId },
    });

    if (!analysisRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify patient owns this request
    if (analysisRequest.patientId !== patientRecord.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the request with submitted results
    const updatedRequest = await prisma.analysisRequest.update({
      where: { id: requestId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        submittedDocumentUrl: submittedDocumentUrl || null,
        submittedDocumentName: submittedDocumentName || null,
        patientNotes: patientNotes || null,
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `Patient ${patientRecord.id} submitted analysis request ${requestId}`
    );

    return NextResponse.json({
      success: true,
      message: "Analysis results submitted successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error submitting analysis results:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to submit results",
      },
      { status: 500 }
    );
  }
}

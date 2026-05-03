import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// POST - Doctor creates/assigns analysis request
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only doctors can create analysis requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      patientIds,
      analysisType,
      testName,
      description,
      dueDate,
      documentUrl,
      documentName,
    } = body;

    if (!analysisType || !testName || !patientIds || patientIds.length === 0) {
      return NextResponse.json(
        { error: "Analysis type, test name, and patient IDs are required" },
        { status: 400 }
      );
    }

    // Create analysis requests for each patient
    const requests = await prisma.analysisRequest.createMany({
      data: patientIds.map((patientId: string) => {
        const requestData: any = {
          doctorId: user.id,
          patientId,
          analysisType,
          testName,
          status: "PENDING",
        };

        if (description) requestData.description = description;
        if (dueDate) requestData.dueDate = new Date(dueDate);
        if (documentUrl) requestData.documentUrl = documentUrl;
        if (documentName) requestData.documentName = documentName;

        return requestData;
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Analysis request created for ${requests.count} patient(s)`,
      count: requests.count,
    });
  } catch (error) {
    console.error("Error creating analysis request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create analysis request",
      },
      { status: 500 }
    );
  }
}

// GET - Get analysis requests
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const status = searchParams.get("status");

    // If requestId is provided, fetch that specific request
    if (requestId) {
      const analysisRequest = await prisma.analysisRequest.findUnique({
        where: { id: requestId },
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
              id: true,
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

      if (!analysisRequest) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
        );
      }

      // Verify access
      if (user.role === "PATIENT") {
        const patientRecord = await prisma.patient.findUnique({
          where: { userId: user.id },
        });
        if (!patientRecord || analysisRequest.patientId !== patientRecord.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
      } else if (user.role === "DOCTOR") {
        if (analysisRequest.doctorId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
      }

      return NextResponse.json({
        success: true,
        data: analysisRequest,
      });
    }

    // Get all requests for patient or doctor's patients
    let where: any = {};

    if (user.role === "PATIENT") {
      const patientRecord = await prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (!patientRecord) {
        return NextResponse.json(
          { error: "Patient profile not found" },
          { status: 404 }
        );
      }
      where.patientId = patientRecord.id;
    } else if (user.role === "DOCTOR") {
      where.doctorId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const requests = await prisma.analysisRequest.findMany({
      where,
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
            id: true,
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
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching analysis requests:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch requests",
      },
      { status: 500 }
    );
  }
}

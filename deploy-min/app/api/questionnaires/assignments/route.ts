import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only doctors can view assignments" },
        { status: 403 }
      );
    }

    // Get all assignments for templates created by this doctor
    const assignments = await prisma.questionnaireAssignment.findMany({
      where: {
        template: {
          doctorId: user.id,
        },
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            specialty: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    // Enrich with patient info
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const patient = await prisma.patient.findUnique({
          where: { id: assignment.patientId },
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        return {
          ...assignment,
          patient: patient?.user,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedAssignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

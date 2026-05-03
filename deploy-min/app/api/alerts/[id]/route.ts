import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: {
        id: alert.id,
        alertType: alert.alertType,
        severity: alert.severity,
        status: alert.status,
        message: alert.message,
        createdAt: alert.createdAt,
        acknowledgedAt: alert.acknowledgedAt,
        resolvedAt: alert.resolvedAt,
        resolution: alert.resolution,
        patientId: alert.patientId,
        patient: alert.patient,
        data: alert.data,
      },
    });
  } catch (error) {
    console.error("Get alert error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alert" },
      { status: 500 }
    );
  }
}

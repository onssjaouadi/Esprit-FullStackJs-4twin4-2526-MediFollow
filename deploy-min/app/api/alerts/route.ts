import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        NOT: {
          AND: [
            { alertType: "SYSTEM" },
            { severity: "LOW" },
            {
              message: { contains: "collection 'alerts'", mode: "insensitive" },
            },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        alertType: true,
        severity: true,
        status: true,
        message: true,
        patientId: true,
        createdAt: true,
        updatedAt: true,
        acknowledgedAt: true,
        resolvedAt: true,
      },
    });

    const mappedAlerts = alerts.map((alert: any) => ({
      id: String(alert.id),
      alertType: String(alert.alertType),
      severity: String(alert.severity),
      status: String(alert.status),
      message: alert.message ? String(alert.message) : "",
      patientId: String(alert.patientId),
      createdAt: alert.createdAt
        ? new Date(alert.createdAt).toISOString()
        : null,
      updatedAt: alert.updatedAt
        ? new Date(alert.updatedAt).toISOString()
        : null,
      acknowledgedAt: alert.acknowledgedAt
        ? new Date(alert.acknowledgedAt).toISOString()
        : null,
      resolvedAt: alert.resolvedAt
        ? new Date(alert.resolvedAt).toISOString()
        : null,
    }));

    return NextResponse.json({
      success: true,
      count: mappedAlerts.length,
      alerts: mappedAlerts,
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts", detail: message },
      { status: 500 }
    );
  }
}

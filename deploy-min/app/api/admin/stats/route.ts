import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const NON_DUMMY_ALERT_WHERE = {
  NOT: {
    AND: [
      { alertType: "SYSTEM" },
      { severity: "LOW" },
      {
        message: {
          contains: "collection 'alerts'",
          mode: "insensitive" as const,
        },
      },
    ] as any,
  },
} as any;

export async function GET() {
  try {
    const today = new Date();
    const dayStarts: Date[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      dayStarts.push(d);
    }

    const rangeStart = dayStarts[0];

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAlerts,
      criticalAlerts,
      openAlerts,
      resolvedAlerts,
      usersInRange,
      alertsInRange,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.alert.count({ where: NON_DUMMY_ALERT_WHERE }),
      prisma.alert.count({
        where: { ...NON_DUMMY_ALERT_WHERE, severity: "CRITICAL" },
      }),
      prisma.alert.count({
        where: { ...NON_DUMMY_ALERT_WHERE, status: "OPEN" },
      }),
      prisma.alert.count({
        where: { ...NON_DUMMY_ALERT_WHERE, status: "RESOLVED" },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
      prisma.alert.findMany({
        where: { ...NON_DUMMY_ALERT_WHERE, createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
    ]);

    const userCountsByDay = new Map<string, number>();
    const alertCountsByDay = new Map<string, number>();

    for (const start of dayStarts) {
      const key = start.toISOString().slice(0, 10);
      userCountsByDay.set(key, 0);
      alertCountsByDay.set(key, 0);
    }

    for (const user of usersInRange) {
      const key = user.createdAt.toISOString().slice(0, 10);
      if (userCountsByDay.has(key)) {
        userCountsByDay.set(key, (userCountsByDay.get(key) || 0) + 1);
      }
    }

    for (const alert of alertsInRange) {
      const key = alert.createdAt.toISOString().slice(0, 10);
      if (alertCountsByDay.has(key)) {
        alertCountsByDay.set(key, (alertCountsByDay.get(key) || 0) + 1);
      }
    }

    return NextResponse.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAlerts,
      criticalAlerts,
      openAlerts,
      resolvedAlerts,
      userTrend7d: dayStarts.map((start) => {
        const key = start.toISOString().slice(0, 10);
        return userCountsByDay.get(key) || 0;
      }),
      alertTrend7d: dayStarts.map((start) => {
        const key = start.toISOString().slice(0, 10);
        return alertCountsByDay.get(key) || 0;
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

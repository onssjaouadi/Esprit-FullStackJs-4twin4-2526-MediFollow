import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Period = "7days" | "30days" | "3months";

function getDays(period: Period) {
  if (period === "30days") return 30;
  if (period === "3months") return 90;
  return 7;
}

function makeDayLabels(days: number) {
  const labels: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    labels.push(d.toISOString().slice(0, 10));
  }
  return labels;
}

function formatDayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function toHourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export async function GET(request: NextRequest) {
  try {
    const periodParam = request.nextUrl.searchParams.get("period") as Period | null;
    const period: Period = periodParam === "30days" || periodParam === "3months" || periodParam === "7days"
      ? periodParam
      : "7days";

    const days = getDays(period);
    const labels = makeDayLabels(days);
    const fromDate = new Date(`${labels[0]}T00:00:00`);

    const [users, alerts, allUsersCount, alertCounts] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: fromDate } },
        select: { createdAt: true },
      }),
      prisma.alert.findMany({
        where: { createdAt: { gte: fromDate } },
        select: { createdAt: true, severity: true, status: true },
      }),
      prisma.user.count(),
      prisma.alert.count(),
    ]);

    const usersByDay = new Map<string, number>();
    const alertsByDay = new Map<string, number>();
    const alertsByHour = new Map<number, number>();

    for (const key of labels) {
      usersByDay.set(key, 0);
      alertsByDay.set(key, 0);
    }
    for (let hour = 0; hour < 24; hour++) {
      alertsByHour.set(hour, 0);
    }

    for (const user of users) {
      const key = user.createdAt.toISOString().slice(0, 10);
      if (usersByDay.has(key)) {
        usersByDay.set(key, (usersByDay.get(key) || 0) + 1);
      }
    }

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let resolved = 0;

    for (const alert of alerts) {
      const dayKey = alert.createdAt.toISOString().slice(0, 10);
      if (alertsByDay.has(dayKey)) {
        alertsByDay.set(dayKey, (alertsByDay.get(dayKey) || 0) + 1);
      }

      const hour = alert.createdAt.getHours();
      alertsByHour.set(hour, (alertsByHour.get(hour) || 0) + 1);

      if (alert.severity === "CRITICAL") critical += 1;
      else if (alert.severity === "HIGH") high += 1;
      else if (alert.severity === "MEDIUM") medium += 1;
      else low += 1;

      if (alert.status === "RESOLVED") resolved += 1;
    }

    const userData = labels.map((label) => ({
      date: formatDayLabel(label),
      count: usersByDay.get(label) || 0,
    }));

    const alertTrendData = labels.map((label) => ({
      date: formatDayLabel(label),
      count: alertsByDay.get(label) || 0,
    }));

    const activityData = Array.from({ length: 24 }, (_, hour) => ({
      time: toHourLabel(hour),
      alerts: alertsByHour.get(hour) || 0,
    }));

    const severityData = [
      { name: "Critical", value: critical, color: "#ef4444" },
      { name: "High", value: high, color: "#f97316" },
      { name: "Medium", value: medium, color: "#eab308" },
      { name: "Low", value: low, color: "#3b82f6" },
    ];

    return NextResponse.json({
      period,
      stats: {
        totalUsers: allUsersCount,
        totalAlerts: alertCounts,
        activeUsers: allUsersCount,
        resolutionRate: alerts.length > 0 ? Math.round((resolved / alerts.length) * 100) : 0,
      },
      userData,
      alertTrendData,
      activityData,
      severityData,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

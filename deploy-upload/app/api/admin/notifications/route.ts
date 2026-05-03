import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [alerts, signups] = await Promise.all([
      prisma.alert.findMany({
        where: {
          alertType: {
            not: "SYSTEM",
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          message: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      alerts: alerts.map((alert) => ({
        id: String(alert.id),
        title: "New alert",
        desc: alert.message,
        createdAt: alert.createdAt.toISOString(),
        target: `/admin/alerts/${alert.id}`,
      })),
      signups: signups.map((user) => ({
        id: String(user.id),
        title: "New sign up",
        desc: `${user.firstName} ${user.lastName} created an account.`,
        createdAt: user.createdAt.toISOString(),
        target: `/admin/users/${user.id}`,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load notifications",
        detail: message,
      },
      { status: 500 }
    );
  }
}

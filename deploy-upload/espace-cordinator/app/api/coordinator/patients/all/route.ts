import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { medicalRecordNumber: "asc" },
    });

    return NextResponse.json(
      { success: true, count: patients.length, patients },
      { status: 200 }
    );
  } catch (error: unknown) {
    const detail =
      process.env.NODE_ENV !== "production"
        ? String((error as Error)?.message ?? error)
        : undefined;
    return NextResponse.json(
      {
        success: false,
        error: "Impossible de charger tous les patients.",
        detail,
      },
      { status: 500 }
    );
  }
}


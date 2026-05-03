import { getCurrentUser } from "@/lib/actions/auth.actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "NURSE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId, doctorUserId } = await request.json();

    if (!patientId || !doctorUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify patient exists and get user ID
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, userId: true },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Verify doctor exists
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Create AccessGrant for doctor-patient relationship
    const accessGrant = await prisma.accessGrant.upsert({
      where: {
        patientId_doctorId: {
          patientId: patient.userId, // Use patient's user ID
          doctorId: doctorUserId,
        },
      },
      update: { isActive: true },
      create: {
        patientId: patient.userId, // Use patient's user ID
        doctorId: doctorUserId,
        isActive: true,
        durationDays: 365,
      },
    });

    console.log(
      `✅ [Nurse Assignment] Patient ${patientId} (User: ${patient.userId}) assigned to Doctor ${doctorUserId}`
    );
    console.log(`✅ [AccessGrant Created/Updated] ID: ${accessGrant.id}`);

    return NextResponse.json({
      success: true,
      message: "Patient assigned to doctor successfully",
      data: { accessGrant },
    });
  } catch (error) {
    console.error("Error assigning patient:", error);
    return NextResponse.json(
      { error: "Failed to assign patient" },
      { status: 500 }
    );
  }
}

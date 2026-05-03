import { getCurrentUserFromRequest } from "@/lib/auth-api";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("[Questionnaire API] Starting POST request");
    const user = await getCurrentUserFromRequest(req);
    console.log("[Questionnaire API] User retrieved:", user?.id || "null");

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "PATIENT") {
      return NextResponse.json(
        { error: `Invalid role: ${user.role}` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      hospital,
      department,
      specialty,
      height,
      weight,
      diabetes,
      hypertension,
      cardiacDisease,
      asthmaOuBpco,
      cancer,
      otherConditions,
      medications,
    } = body;

    // Find or create patient by user ID
    let patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    // If patient doesn't exist, create one
    if (!patient) {
      // Generate a unique medical record number
      const medicalRecordNumber = `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      patient = await prisma.patient.create({
        data: {
          userId: user.id,
          medicalRecordNumber,
          dateOfBirth: new Date(), // Will be updated with proper value in questionnaire
          gender: "OTHER", // Will be updated with proper value in questionnaire
          isActive: false, // Patient starts as pending - needs admin approval
        },
      });
    }

    // Update patient with medical information
    const updateData = {
      questionnaireCompleted: true,
      medicalProfile: {
        hospital: hospital || undefined,
        department: department || undefined,
        specialty: specialty || "GENERAL_MEDICINE",
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        medicalBackground: {
          diabetes: diabetes || false,
          hypertension: hypertension || false,
          cardiacDisease: cardiacDisease || false,
          asthmaOuBpco: asthmaOuBpco || false,
          cancer: cancer || false,
          otherConditions: otherConditions || undefined,
        },
      },
    };

    await prisma.patient.update({
      where: { id: patient.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Profil complété avec succès",
    });
  } catch (error) {
    console.error("Questionnaire error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du profil" },
      { status: 500 }
    );
  }
}

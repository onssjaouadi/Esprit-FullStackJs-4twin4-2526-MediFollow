"use server";

import { prisma } from "@/lib/prisma";

/**
 * Fix missing Patient records for PATIENT users
 * Creates Patient profiles for any PATIENT users that don't have one
 */
export async function fixMissingPatients() {
  try {
    // Find all PATIENT users without an associated Patient
    const patientUsersWithoutProfile = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        patient: null,
      },
    });

    if (patientUsersWithoutProfile.length === 0) {
      return {
        success: true,
        message: "Aucun patient manquant trouvé",
        fixed: 0,
      };
    }

    const results = [];

    // Create Patient profiles for these users
    for (const user of patientUsersWithoutProfile) {
      try {
        // Generate unique medical record number
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8);
        const medicalRecordNumber =
          `MRN${timestamp.slice(-8)}${random}`.toUpperCase();

        const patient = await prisma.patient.create({
          data: {
            userId: user.id,
            medicalRecordNumber,
            // Default date of birth: 18 years ago from today
            dateOfBirth: new Date(
              new Date().setFullYear(new Date().getFullYear() - 18)
            ),
            gender: "OTHER",
            isActive: true,
          },
        });

        results.push({
          userId: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          patientId: patient.id,
          medicalRecordNumber,
          success: true,
        });
      } catch (error) {
        results.push({
          userId: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          success: false,
          error: String(error),
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return {
      success: true,
      message: `${successCount} patient(s) créé(s) avec succès`,
      fixed: successCount,
      results,
    };
  } catch (error) {
    console.error("Error fixing missing patients:", error);
    return {
      success: false,
      error: "Erreur lors de la correction",
      fixed: 0,
    };
  }
}

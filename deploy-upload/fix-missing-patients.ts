#!/usr/bin/env node
/**
 * Script to fix missing Patient records
 * Usage: npm run fix:missing-patients
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMissingPatients() {
  try {
    console.log("🔍 Searching for PATIENT users without Patient profiles...");

    // Find all PATIENT users without an associated Patient
    const patientUsersWithoutProfile = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        patient: null,
      },
    });

    if (patientUsersWithoutProfile.length === 0) {
      console.log("✅ Aucun patient manquant trouvé!");
      return;
    }

    console.log(
      `\n⚠️  ${patientUsersWithoutProfile.length} patient(s) sans profil trouvé(s):`
    );
    patientUsersWithoutProfile.forEach((user) => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
    });

    console.log("\n📝 Création des profils patients manquants...\n");

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

        console.log(
          `✅ ${user.firstName} ${user.lastName} - MRN: ${medicalRecordNumber}`
        );
      } catch (error) {
        console.error(
          `❌ Erreur pour ${user.firstName} ${user.lastName}:`,
          error
        );
      }
    }

    console.log("\n✨ Correction terminée!");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingPatients();

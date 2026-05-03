#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier les AccessGrants et patients
 */

import prisma from "@/lib/prisma";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  🔍 Diagnostic AccessGrant & Patients");
  console.log("=".repeat(70) + "\n");

  try {
    // Find admin
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true },
    });

    if (!admin) {
      console.error("❌ Aucun admin trouvé\n");
      process.exit(1);
    }

    console.log(`👨‍💼 Admin: ${admin.email}\n`);

    // Check AccessGrants for this admin
    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        doctorId: admin.id,
        isActive: true,
      },
      select: {
        id: true,
        patientId: true,
        isActive: true,
        grantedAt: true,
      },
    });

    console.log(`📋 AccessGrants trouvés: ${accessGrants.length}`);
    if (accessGrants.length > 0) {
      console.log("   " + "─".repeat(65));
      for (const grant of accessGrants) {
        console.log(
          `   ✅ Patient ID: ${grant.patientId} | Active: ${grant.isActive}`
        );
      }
      console.log("   " + "─".repeat(65));
    } else {
      console.log("   ⚠️  AUCUN AccessGrant pour cet admin!\n");
    }

    // Check if patients exist for those grants
    if (accessGrants.length > 0) {
      const patientIds = accessGrants.map((g) => g.patientId);

      const patients = await prisma.patient.findMany({
        where: {
          id: { in: patientIds },
          isActive: true,
        },
        select: {
          id: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      console.log(`\n👥 Patients trouvés: ${patients.length}`);
      if (patients.length > 0) {
        console.log("   " + "─".repeat(65));
        for (const patient of patients) {
          console.log(
            `   ✅ ${patient.user.firstName} ${patient.user.lastName} (${patient.user.email})`
          );
        }
        console.log("   " + "─".repeat(65));
      }
    }

    // Check total cardio patients
    console.log("\n📊 Tous les patients CARDIO:");
    const allCardioPatients = await prisma.user.findMany({
      where: {
        email: { contains: "patient.cardiac" },
        role: "PATIENT",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log(`   Total trouvé: ${allCardioPatients.length}`);
    if (allCardioPatients.length > 0) {
      console.log("   " + "─".repeat(65));
      for (const user of allCardioPatients) {
        console.log(`   👤 ${user.firstName} ${user.lastName} (${user.email})`);
      }
      console.log("   " + "─".repeat(65));
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ Diagnostic terminé\n");
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

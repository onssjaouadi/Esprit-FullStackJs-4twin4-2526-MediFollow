#!/usr/bin/env node

/**
 * Script pour créer des AccessGrants pour les docteurs
 * Résout le problème: patients n'apparaissent pas car AccessGrants étaient pour ADMIN, pas DOCTOR
 */

import prisma from "@/lib/prisma";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  🔗 Doctor AccessGrant Creator");
  console.log("=".repeat(70) + "\n");

  try {
    // Find first doctor user
    const doctor = await prisma.user.findFirst({
      where: { role: "DOCTOR" },
      select: { id: true, email: true, role: true },
    });

    if (!doctor) {
      console.error("❌ Aucun docteur trouvé\n");
      process.exit(1);
    }

    console.log(`👨‍⚕️  Docteur trouvé: ${doctor.email}`);
    console.log(`   ID: ${doctor.id}\n`);

    // Find all cardiology patients
    const patients = await prisma.user.findMany({
      where: {
        email: {
          contains: "patient.cardiac",
        },
        role: "PATIENT",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (patients.length === 0) {
      console.error("❌ Aucun patient cardio trouvé\n");
      process.exit(1);
    }

    console.log(`👥 ${patients.length} patients cardio trouvés:\n`);

    let created = 0;
    let skipped = 0;

    for (const user of patients) {
      // Get patient record
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!patient) {
        console.log(`⏭️  Skip: ${user.email} (pas de record patient)`);
        skipped++;
        continue;
      }

      // Check if AccessGrant already exists for this doctor
      const existing = await prisma.accessGrant.findFirst({
        where: {
          doctorId: doctor.id,
          patientId: patient.id,
        },
      });

      if (existing && existing.isActive) {
        console.log(`⏭️  Skip: ${user.email} (AccessGrant existe déjà)`);
        skipped++;
        continue;
      }

      // Create or reactivate AccessGrant
      if (existing && !existing.isActive) {
        // Reactivate existing grant
        await prisma.accessGrant.update({
          where: { id: existing.id },
          data: { isActive: true, grantedAt: new Date() },
        });
        console.log(
          `♻️  Réactivé: ${user.firstName} ${user.lastName} (${user.email})`
        );
      } else {
        // Create new AccessGrant
        await prisma.accessGrant.create({
          data: {
            doctorId: doctor.id,
            patientId: patient.id,
            isActive: true,
            grantedAt: new Date(),
            durationDays: 365,
          },
        });
        console.log(
          `✅ Créé: ${user.firstName} ${user.lastName} (${user.email})`
        );
      }
      created++;
    }

    console.log("\n" + "=".repeat(70));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(70));
    console.log(`✅ Créés/Réactivés: ${created} AccessGrants`);
    console.log(`⏭️  Existants: ${skipped}`);
    console.log(`\n🎉 Les patients devraient maintenant apparaître!\n`);
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

#!/usr/bin/env node

/**
 * Script pour créer rapidement des AccessGrants multiples
 * Utilisé pour lier les patients cardiaques à un docteur/admin
 */

import prisma from "@/lib/prisma";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  🔗 Batch AccessGrant Creator");
  console.log("=".repeat(70) + "\n");

  try {
    // Find current admin
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true, role: true },
    });

    if (!admin) {
      console.error("❌ Aucun admin trouvé\n");
      process.exit(1);
    }

    console.log(`👨‍💼 Admin trouvé: ${admin.email}`);
    console.log(`   ID: ${admin.id}\n`);

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

      // Check if AccessGrant already exists
      const existing = await prisma.accessGrant.findFirst({
        where: {
          doctorId: admin.id,
          patientId: patient.id,
        },
      });

      if (existing) {
        console.log(`⏭️  Skip: ${user.email} (AccessGrant existe déjà)`);
        skipped++;
        continue;
      }

      // Create AccessGrant
      await prisma.accessGrant.create({
        data: {
          doctorId: admin.id,
          patientId: patient.id,
          isActive: true,
          grantedAt: new Date(),
          durationDays: 365,
        },
      });

      console.log(
        `✅ Créé: ${user.firstName} ${user.lastName} (${user.email})`
      );
      created++;
    }

    console.log("\n" + "=".repeat(70));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(70));
    console.log(`✅ Créés: ${created} AccessGrants`);
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

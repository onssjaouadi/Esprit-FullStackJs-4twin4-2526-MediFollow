#!/usr/bin/env node

/**
 * Vérifier que les AccessGrants ont été créés pour le docteur
 */

import prisma from "@/lib/prisma";

async function main() {
  try {
    // Find doctor
    const doctor = await prisma.user.findFirst({
      where: { role: "DOCTOR" },
      select: { id: true, email: true },
    });

    if (!doctor) {
      console.log("❌ Aucun docteur trouvé");
      process.exit(1);
    }

    console.log(`\n👨‍⚕️  Docteur: ${doctor.email} (ID: ${doctor.id})\n`);

    // Count AccessGrants for this doctor
    const grants = await prisma.accessGrant.findMany({
      where: {
        doctorId: doctor.id,
        isActive: true,
      },
    });

    console.log(`📊 AccessGrants actifs: ${grants.length}\n`);

    if (grants.length === 0) {
      console.log("❌ AUCUN AccessGrant trouvé pour ce docteur!");
      console.log("💡 Exécutez: npx tsx scripts/fix-doctor-access-grants.ts\n");
      process.exit(1);
    }

    // Get patient details for each grant
    for (const grant of grants) {
      const patient = await prisma.patient.findUnique({
        where: { id: grant.patientId },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      });

      if (patient) {
        const user = patient.user;
        console.log(`  ✅ ${user.firstName} ${user.lastName}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Accordé le: ${grant.grantedAt}\n`);
      }
    }

    console.log("✅ Les AccessGrants existent dans la base de données!\n");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

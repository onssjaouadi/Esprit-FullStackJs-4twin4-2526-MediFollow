#!/usr/bin/env node

/**
 * Fix AccessGrants - replace User IDs with correct Patient IDs
 */

import prisma from "@/lib/prisma";

async function main() {
  const doctorId = "69d614a88540bb0a26312b0d";

  console.log("\n" + "=".repeat(70));
  console.log("  🔧 Fixing AccessGrants for dr.martin.leclerc@hosp.fr");
  console.log("=".repeat(70) + "\n");

  try {
    // Get all existing (broken) grants for this doctor
    const brokenGrants = await prisma.accessGrant.findMany({
      where: { doctorId },
    });

    console.log(`Found ${brokenGrants.length} grants to fix\n`);

    // Delete them
    const deleteResult = await prisma.accessGrant.deleteMany({
      where: { doctorId },
    });

    console.log(`Deleted ${deleteResult.count} broken grants\n`);

    // Get all cardiac patients (these should be the ones to link)
    const patients = await prisma.patient.findMany({
      where: { user: { email: { contains: "patient.cardiac" } } },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    console.log(`Found ${patients.length} cardiac patients:\n`);

    // Create new grants with correct Patient IDs
    for (const patient of patients) {
      const grant = await prisma.accessGrant.create({
        data: {
          doctorId,
          patientId: patient.id, // Use Patient ID, not User ID!
          isActive: true,
          grantedAt: new Date(),
          durationDays: 365,
        },
      });

      console.log(`✅ ${patient.user.firstName} ${patient.user.lastName}`);
      console.log(`   Patient ID: ${patient.id}`);
      console.log(`   User ID: ${patient.user.email}\n`);
    }

    console.log("=".repeat(70));
    console.log(`✅ Fixed! Created ${patients.length} correct AccessGrants\n`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

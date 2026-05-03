#!/usr/bin/env node

/**
 * Diagnose which doctors have AccessGrants
 */

import prisma from "@/lib/prisma";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  🔍 Doctor AccessGrant Diagnosis");
  console.log("=".repeat(70) + "\n");

  try {
    // Get all doctors
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: { id: true, email: true },
    });

    console.log(`Found ${doctors.length} doctors:\n`);

    for (const doctor of doctors) {
      const grantCount = await prisma.accessGrant.count({
        where: {
          doctorId: doctor.id,
          isActive: true,
        },
      });

      const emoji = grantCount > 0 ? "✅" : "❌";
      console.log(`${emoji} ${doctor.email}`);
      console.log(`   ID: ${doctor.id}`);
      console.log(`   AccessGrants: ${grantCount}\n`);
    }

    console.log("=".repeat(70));
    console.log(
      "\n💡 You need to login as a doctor with ✅ (has AccessGrants)"
    );
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

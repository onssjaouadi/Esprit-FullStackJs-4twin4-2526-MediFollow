#!/usr/bin/env node

/**
 * Show AccessGrants with detailed info for debugging
 */

import prisma from "@/lib/prisma";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  📊 AccessGrant Summary");
  console.log("=".repeat(70) + "\n");

  try {
    const grants = await prisma.accessGrant.findMany({
      where: { isActive: true },
    });

    console.log(`Total active AccessGrants: ${grants.length}\n`);

    if (grants.length === 0) {
      console.log("❌ NO ACCESSGRANTS FOUND!\n");
    } else {
      // Get doctor details for each grant
      const grantsByDoctor = {} as any;

      for (const grant of grants) {
        const doctor = await prisma.user.findUnique({
          where: { id: grant.doctorId },
          select: { email: true, id: true },
        });

        if (doctor) {
          if (!grantsByDoctor[doctor.email]) {
            grantsByDoctor[doctor.email] = { id: doctor.id, count: 0 };
          }
          grantsByDoctor[doctor.email].count++;
        }
      }

      // Sort by count
      const sorted = Object.entries(grantsByDoctor).sort((a, b) => {
        const countA = (a[1] as any).count;
        const countB = (b[1] as any).count;
        return countB - countA;
      });

      console.log("Doctors with AccessGrants (by patient count):\n");
      sorted.forEach(([email, data]: any) => {
        console.log(`📌 ${email}`);
        console.log(`   ID: ${data.id}`);
        console.log(`   Patients: ${data.count}\n`);
      });
    }

    console.log("=".repeat(70));
    console.log("\n💡 Login with one of the doctors above to see patients!\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

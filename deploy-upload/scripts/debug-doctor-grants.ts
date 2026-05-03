#!/usr/bin/env node

/**
 * Debug why dr.martin.leclerc@hosp.fr has 0 patients in API
 */

import prisma from "@/lib/prisma";

async function main() {
  const doctorId = "69d614a88540bb0a26312b0d";
  const doctorEmail = "dr.martin.leclerc@hosp.fr";

  console.log("\n" + "=".repeat(70));
  console.log("  🔍 Debugging AccessGrants for:", doctorEmail);
  console.log("=".repeat(70) + "\n");

  try {
    // Step 1: Verify doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    console.log("Step 1: Doctor verification");
    if (!doctor) {
      console.log("❌ Doctor not found!");
      process.exit(1);
    }
    console.log(`✅ Found: ${doctor.email}`);
    console.log(`   ID: ${doctor.id}`);
    console.log(`   Role: ${doctor.role}`);
    console.log(`   Active: ${doctor.isActive}\n`);

    // Step 2: Find AccessGrants
    console.log("Step 2: Fetching AccessGrants");
    const grants = await prisma.accessGrant.findMany({
      where: {
        doctorId: doctorId,
        isActive: true,
      },
    });

    console.log(`✅ Found ${grants.length} active AccessGrants`);
    const patientIds = grants.map((g) => g.patientId);
    console.log(`   Patient IDs: ${patientIds.join(", ")}\n`);

    if (grants.length === 0) {
      console.log("❌ NO ACCESSGRANTS FOUND - this is the problem!");
      process.exit(1);
    }

    // Step 3: Check if patients exist and are active
    console.log("Step 3: Verifying patients");
    for (const patientId of patientIds) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          isActive: true,
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      });

      if (!patient) {
        console.log(`❌ Patient ${patientId} not found!`);
      } else if (!patient.isActive) {
        console.log(`⚠️  Patient ${patientId} is INACTIVE!`);
        console.log(`   ${patient.user.firstName} ${patient.user.lastName}`);
      } else {
        console.log(`✅ ${patient.user.firstName} ${patient.user.lastName}`);
        console.log(`   ID: ${patient.id}, Email: ${patient.user.email}`);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("If all steps show ✅, the API should work!");
    console.log("If you see ⚠️ INACTIVE, that's the problem.\n");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

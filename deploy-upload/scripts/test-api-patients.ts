#!/usr/bin/env node

/**
 * Test the /api/patients endpoint directly
 * Simulates what would happen when the doctor fetches patients
 */

import prisma from "@/lib/prisma";

async function main() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("  🧪 Testing API /api/patients Logic");
    console.log("=".repeat(70) + "\n");

    // Find doctor user
    const doctor = await prisma.user.findFirst({
      where: { role: "DOCTOR" },
      select: { id: true, email: true, role: true },
    });

    if (!doctor) {
      console.error("❌ Doctor not found\n");
      process.exit(1);
    }

    console.log(`👨‍⚕️  Testing with doctor: ${doctor.email}`);
    console.log(`   ID: ${doctor.id}\n`);

    // Step 1: Find AccessGrants
    console.log("📋 Step 1: Fetching AccessGrants...");
    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        doctorId: doctor.id,
        isActive: true,
      },
      select: {
        patientId: true,
      },
    });

    console.log(`✅ Found ${accessGrants.length} AccessGrants`);
    const patientIds = accessGrants.map((grant) => grant.patientId);
    console.log(`   Patient IDs: ${patientIds.join(", ")}\n`);

    // Step 2: Fetch patient records
    console.log("📋 Step 2: Fetching patient records...");
    const patients = await prisma.patient.findMany({
      where: {
        id: {
          in: patientIds,
        },
        isActive: true,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });

    console.log(`✅ Found ${patients.length} patient records\n`);

    // Step 3: Show what API would return
    console.log("📋 Step 3: API Response would be:");
    console.log("=".repeat(70));
    console.log(JSON.stringify({ success: true, data: patients }, null, 2));
    console.log("=".repeat(70) + "\n");

    if (patients.length === 0) {
      console.error("❌ ERROR: No patients found despite having AccessGrants!");
      console.error("   Check if Patient records have isActive=true");
      process.exit(1);
    }

    console.log("✅ API would return patients successfully!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

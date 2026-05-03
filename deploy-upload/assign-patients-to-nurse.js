/**
 * Assign patients to nurse@test.com for testing
 * This script finds or creates a test nurse and assigns patients to them
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function assignPatientsToNurse() {
  try {
    console.log("🔍 Looking for nurse with email: nurse@test.com");

    // Find nurse by email
    let nurse = await prisma.user.findUnique({
      where: { email: "nurse@test.com" },
      include: {
        nurseProfile: true,
      },
    });

    if (!nurse) {
      console.log("❌ Nurse not found with email: nurse@test.com");
      console.log("\nPlease create a nurse account first:");
      console.log("  Email: nurse@test.com");
      console.log("  Password: any password");
      console.log("  Role: NURSE");
      process.exit(1);
    }

    console.log(
      `✅ Found nurse: ${nurse.firstName} ${nurse.lastName} (${nurse.email})\n`
    );

    // Check existing assignments
    const existingAssignments = await prisma.nurseAssignment.findMany({
      where: { nurseId: nurse.id },
    });

    console.log(`📊 Current assignments: ${existingAssignments.length}\n`);

    // Get available patients (first 5)
    console.log("👥 Fetching available patients...");
    const patients = await prisma.patient.findMany({
      take: 5,
      include: {
        user: true,
      },
    });

    console.log(`✓ Found ${patients.length} patients\n`);

    if (patients.length === 0) {
      console.log("❌ No patients found in database");
      console.log("\nYou need to create test patients first!");
      process.exit(1);
    }

    // Create assignments for patients that aren't already assigned
    console.log("📋 Creating patient assignments...\n");

    let assignedCount = 0;
    let skippedCount = 0;

    for (const patient of patients) {
      try {
        // Check if already assigned
        const existing = await prisma.nurseAssignment.findUnique({
          where: {
            nurseId_patientId: {
              nurseId: nurse.id,
              patientId: patient.id,
            },
          },
        });

        if (existing) {
          console.log(
            `   ⊘ Already assigned: ${patient.user?.firstName} ${patient.user?.lastName} (MRN: ${patient.medicalRecordNumber})`
          );
          skippedCount++;
          continue;
        }

        // Create new assignment
        await prisma.nurseAssignment.create({
          data: {
            nurseId: nurse.id,
            patientId: patient.id,
            assignedAt: new Date(),
            isActive: true,
          },
        });

        console.log(
          `   ✅ Assigned: ${patient.user?.firstName} ${patient.user?.lastName} (MRN: ${patient.medicalRecordNumber})`
        );
        assignedCount++;
      } catch (error) {
        console.log(
          `   ⚠️  Error assigning ${patient.user?.firstName}: ${error.message}`
        );
      }
    }

    console.log(
      `\n✅ Successfully created ${assignedCount} new patient assignments!`
    );
    if (skippedCount > 0) {
      console.log(`⊘ Skipped ${skippedCount} already assigned patients`);
    }
    console.log("\n🎉 Nurse should now see patients in the dashboard.\n");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the script
assignPatientsToNurse();

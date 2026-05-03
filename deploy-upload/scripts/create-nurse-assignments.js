/**
 * Create patient assignments (reminders) for the current nurse user
 * This script finds the nurse with ID 69d6f979f166f41e3e3bc5ab
 * and assigns 3-5 patients to them
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createNurseAssignments() {
  try {
    const nurseId = "69d6f979f166f41e3e3bc5ab";

    console.log("🔍 Looking for nurse...");
    const nurse = await prisma.user.findUnique({
      where: { id: nurseId },
    });

    if (!nurse) {
      console.log("❌ Nurse not found with ID:", nurseId);
      process.exit(1);
    }

    console.log(
      `✅ Found nurse: ${nurse.firstName} ${nurse.lastName} (${nurse.email})\n`
    );

    // Check existing assignments
    const existingAssignments = await prisma.patientReminder.findMany({
      where: { nurseId },
    });

    console.log(`📊 Current assignments: ${existingAssignments.length}\n`);

    if (existingAssignments.length > 0) {
      console.log("⚠️  Nurse already has assignments. Clearing...\n");
      await prisma.patientReminder.deleteMany({
        where: { nurseId },
      });
      console.log("✓ Cleared old assignments\n");
    }

    // Get available patients
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
      process.exit(1);
    }

    // Create assignments
    console.log("📋 Creating patient assignments...\n");

    for (const patient of patients) {
      try {
        const reminder = await prisma.patientReminder.create({
          data: {
            nurseId,
            patientId: patient.id,
            title: `Initial check-in for ${patient.user?.firstName} ${patient.user?.lastName}`,
            message: "Patient assigned to this nurse",
            reminderType: "FOLLOW_UP",
            scheduledFor: new Date(),
            priority: "NORMAL",
            isSent: false,
            isRead: false,
          },
        });

        console.log(
          `   ✅ Assigned: ${patient.user?.firstName} ${patient.user?.lastName} (MRN: ${patient.medicalRecordNumber})`
        );
      } catch (error) {
        console.log(
          `   ⚠️  Error assigning ${patient.user?.firstName}: ${error.message}`
        );
      }
    }

    console.log(
      `\n✅ Successfully created ${patients.length} patient assignments!`
    );
    console.log("\n🎉 Nurse can now see patients in the dropdown.\n");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createNurseAssignments();

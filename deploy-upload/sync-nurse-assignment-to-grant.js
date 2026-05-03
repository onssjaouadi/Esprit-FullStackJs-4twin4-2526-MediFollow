/**
 * Sync NurseAssignment to AccessGrant
 * This script finds NurseAssignments and creates corresponding AccessGrant records
 * to sync the data between nurse and coordinator views
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function syncNurseAssignmentToGrant() {
  try {
    console.log("🔄 Syncing NurseAssignment to AccessGrant...\n");

    // Find all active NurseAssignments
    const assignments = await prisma.nurseAssignment.findMany({
      where: { isActive: true },
      include: {
        patient: {
          include: { user: true },
        },
        nurse: {
          include: { user: true },
        },
      },
    });

    console.log(`📊 Found ${assignments.length} active NurseAssignment(s)\n`);

    if (assignments.length === 0) {
      console.log("❌ No NurseAssignments found");
      process.exit(1);
    }

    // Display assignments
    for (const assignment of assignments) {
      console.log(`Patient: ${assignment.patient.user.email}`);
      console.log(`Nurse: ${assignment.nurse.user.email}`);
      console.log(`NurseAssignment ID: ${assignment.id}`);
      console.log("---");
    }

    console.log(
      "\n🔍 Now looking for doctor assignments via nurse metadata..."
    );

    // Option 1: Direct assignment - ask for nurse email and doctor email
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    function askQuestion(question) {
      return new Promise((resolve) => {
        rl.question(question, (answer) => {
          resolve(answer);
        });
      });
    }

    console.log("\n📝 To create an AccessGrant, provide:");
    const patientEmail = await askQuestion(
      "Patient email (or press Enter to skip): "
    );

    if (!patientEmail.trim()) {
      console.log("⏭️  Skipped");
      rl.close();
      process.exit(0);
    }

    const doctorEmail = await askQuestion("Doctor email: ");
    rl.close();

    // Find patient and doctor
    const patient = await prisma.patient.findFirst({
      where: {
        user: { email: patientEmail.trim() },
      },
      include: { user: true },
    });

    const doctor = await prisma.user.findUnique({
      where: { email: doctorEmail.trim() },
    });

    if (!patient) {
      console.log(`❌ Patient not found with email: ${patientEmail}`);
      process.exit(1);
    }

    if (!doctor) {
      console.log(`❌ Doctor not found with email: ${doctorEmail}`);
      process.exit(1);
    }

    console.log(
      `\n✅ Found Patient: ${patient.user.firstName} ${patient.user.lastName}`
    );
    console.log(`✅ Found Doctor: ${doctor.firstName} ${doctor.lastName}`);

    // Create or update AccessGrant
    const accessGrant = await prisma.accessGrant.upsert({
      where: {
        patientId_doctorId: {
          patientId: patient.userId,
          doctorId: doctor.id,
        },
      },
      update: {
        isActive: true,
        grantedAt: new Date(),
      },
      create: {
        patientId: patient.userId,
        doctorId: doctor.id,
        isActive: true,
        durationDays: 365,
        grantedAt: new Date(),
      },
    });

    console.log(`\n✅ AccessGrant created/updated:`);
    console.log(`   ID: ${accessGrant.id}`);
    console.log(`   Patient: ${patient.user.email}`);
    console.log(`   Doctor: ${doctor.email}`);
    console.log(`   Active: ${accessGrant.isActive}`);
    console.log(`   Duration: ${accessGrant.durationDays} days`);

    console.log("\n✨ Data sync completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncNurseAssignmentToGrant();

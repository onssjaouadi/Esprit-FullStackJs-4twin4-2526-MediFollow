/**
 * Quick Sync: Create AccessGrant for patientt@medifollow.health and walaeddine1207@gmail.com
 * This directly creates the AccessGrant for the specific patient and doctor
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function quickSync() {
  try {
    const patientEmail = "patientt@medifollow.health";
    const doctorEmail = "walaeddine1207@gmail.com";

    console.log(`🔄 Creating AccessGrant...`);
    console.log(`   Patient: ${patientEmail}`);
    console.log(`   Doctor: ${doctorEmail}\n`);

    // Find patient
    const patient = await prisma.patient.findFirst({
      where: {
        user: { email: patientEmail },
      },
      include: { user: true },
    });

    if (!patient) {
      console.log(`❌ Patient not found: ${patientEmail}`);
      process.exit(1);
    }

    console.log(
      `✅ Found Patient: ${patient.user.firstName} ${patient.user.lastName}`
    );

    // Find doctor
    const doctor = await prisma.user.findUnique({
      where: { email: doctorEmail },
    });

    if (!doctor) {
      console.log(`❌ Doctor not found: ${doctorEmail}`);
      process.exit(1);
    }

    console.log(`✅ Found Doctor: ${doctor.firstName} ${doctor.lastName}\n`);

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

    console.log(`✅ AccessGrant created/updated:`);
    console.log(`   ID: ${accessGrant.id}`);
    console.log(`   Patient: ${patient.user.email}`);
    console.log(`   Doctor: ${doctor.email}`);
    console.log(`   Active: ${accessGrant.isActive}`);
    console.log(`   Duration: ${accessGrant.durationDays} days`);
    console.log(`   Granted At: ${accessGrant.grantedAt}`);

    console.log("\n✨ Data sync completed successfully!");
    console.log(
      "\n🔄 Now the coordinator will see the doctor assigned to this patient!"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

quickSync();

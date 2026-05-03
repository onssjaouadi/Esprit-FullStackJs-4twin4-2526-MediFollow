#!/usr/bin/env node

/**
 * Script pour accorder l'accès blockchain à un docteur pour un patient spécifique
 */

// Load environment variables
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const {
  grantDoctorAccess,
} = require("../lib/actions/blockchain-access.actions");

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Granting blockchain access to doctor for patient...\n");
  console.log("=".repeat(60));

  // Get command line arguments
  const doctorEmail = process.argv[2] || "walaeddine1207@gmail.com";
  const patientEmail = process.argv[3];

  // Get the doctor
  const doctor = await prisma.user.findUnique({
    where: { email: doctorEmail },
    select: {
      id: true,
      email: true,
      blockchainAddress: true,
    },
  });

  if (!doctor) {
    console.error(`❌ Doctor ${doctorEmail} not found`);
    process.exit(1);
  }

  if (!doctor.blockchainAddress) {
    console.error(`❌ Doctor ${doctorEmail} has no blockchain address`);
    process.exit(1);
  }

  console.log(`\n👨‍⚕️ Doctor: ${doctor.email}`);
  console.log(`   Blockchain Address: ${doctor.blockchainAddress}`);

  // Get patients
  let patients;
  if (patientEmail) {
    // Specific patient
    const patientUser = await prisma.user.findUnique({
      where: { email: patientEmail },
      include: { patient: true },
    });

    if (!patientUser) {
      console.error(`❌ Patient ${patientEmail} not found`);
      process.exit(1);
    }

    patients = patientUser.patient ? [patientUser.patient] : [];
  } else {
    // All active patients
    patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: { user: true },
    });
  }

  console.log(`\n🏥 Found ${patients.length} patient(s)`);

  if (patients.length === 0) {
    console.error("❌ No patients found");
    process.exit(1);
  }

  // Grant access for each patient
  for (const patient of patients) {
    const patientUser =
      patient.user ||
      (await prisma.user.findUnique({
        where: { id: patient.userId },
      }));

    console.log(
      `\n📝 Granting access for: ${patientUser.email} (${patient.id})`
    );

    try {
      const result = await grantDoctorAccess(
        doctor.blockchainAddress,
        patient.id,
        365 // 1 year
      );

      if (result.success) {
        console.log(`   ✅ Access granted!`);
        console.log(`   Transaction: ${result.transactionHash}`);
        console.log(
          `   View: https://explorer.aptoslabs.com/txn/${result.transactionHash}?network=testnet`
        );
      } else {
        console.log(`   ⚠️  ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      // Continue with next patient
    }

    // Wait a bit between transactions
    if (patients.length > 1) {
      console.log("   ⏳ Waiting 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Access granting complete!\n");
  console.log("📋 Summary:");
  console.log(`   - Doctor: ${doctor.email}`);
  console.log(`   - Patients: ${patients.length}`);
  console.log(
    "\n✅ You can now access patient data with blockchain verification!"
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("\n💥 Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

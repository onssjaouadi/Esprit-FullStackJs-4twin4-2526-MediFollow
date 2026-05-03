import { prisma } from "@/lib/prisma";
import { grantAccessToDoctor } from "@/lib/actions/patient-access.actions";

async function setupPatientDoctorAccess() {
  try {
    const patientEmail = "arij.mhjb1@gmail.com";
    const doctorEmail = "arij@medifollow.health";

    console.log(
      `\n🔍 Setting up access: Patient ${patientEmail} → Doctor ${doctorEmail}\n`
    );

    // Find patient by email
    const patientUser = await prisma.user.findUnique({
      where: { email: patientEmail },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!patientUser) {
      console.error(`❌ Patient with email ${patientEmail} not found`);
      process.exit(1);
    }

    console.log(
      `✅ Found patient: ${patientUser.firstName} ${patientUser.lastName}`
    );

    // Find patient profile to get patient ID (for blockchain)
    const patientProfile = await prisma.patient.findUnique({
      where: { userId: patientUser.id },
      select: { id: true },
    });

    if (!patientProfile) {
      console.error("❌ Patient profile not found");
      process.exit(1);
    }

    console.log(`✅ Found patient profile ID: ${patientProfile.id}`);

    // Find doctor by email
    const doctorUser = await prisma.user.findUnique({
      where: { email: doctorEmail },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    if (!doctorUser) {
      console.error(`❌ Doctor with email ${doctorEmail} not found`);
      process.exit(1);
    }

    if (doctorUser.role !== "DOCTOR") {
      console.error("❌ User is not a doctor");
      process.exit(1);
    }

    console.log(
      `✅ Found doctor: ${doctorUser.firstName} ${doctorUser.lastName}`
    );

    // Grant access
    console.log("\n⏳ Granting access...");
    const result = await grantAccessToDoctor(
      patientUser.id,
      patientProfile.id,
      doctorUser.id,
      365
    );

    if (!result.success) {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    }

    console.log("✅ Access granted successfully!");
    if (result.txHash) {
      console.log(`📝 Transaction Hash: ${result.txHash}`);
    }
    console.log(
      `\n🎉 Patient ${patientEmail} is now accessible to doctor ${doctorEmail}`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

setupPatientDoctorAccess();

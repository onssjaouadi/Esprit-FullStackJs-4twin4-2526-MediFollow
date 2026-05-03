import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

/**
 * TEST PATIENT SETUP SCRIPT
 * Creates a test patient and links it to the first available doctor
 * Usage: npx ts-node scripts/create-test-patient.ts
 */

async function createTestPatient() {
  try {
    console.log("🔍 Looking for a doctor to link the patient to...");

    // Find the first doctor user
    const doctor = await prisma.user.findFirst({
      where: { role: "DOCTOR" },
    });

    if (!doctor) {
      console.error(
        "❌ No doctor found in database. Create a doctor account first."
      );
      process.exit(1);
    }

    console.log(
      `✅ Found doctor: ${doctor.firstName} ${doctor.lastName} (${doctor.email})`
    );

    // Check if test patient already exists
    const existingPatient = await prisma.user.findUnique({
      where: { email: "patient.test@healthcareapp.com" },
    });

    if (existingPatient) {
      console.log(`⚠️  Test patient already exists: ${existingPatient.email}`);

      // Still create/verify AccessGrant
      const existingPatientRecord = await prisma.patient.findUnique({
        where: { userId: existingPatient.id },
      });

      if (existingPatientRecord) {
        const accessGrant = await prisma.accessGrant.upsert({
          where: {
            patientId_doctorId: {
              patientId: existingPatientRecord.id,
              doctorId: doctor.id,
            },
          },
          update: { isActive: true },
          create: {
            patientId: existingPatientRecord.id,
            doctorId: doctor.id,
            grantedAt: new Date(),
            isActive: true,
          },
        });

        console.log(`✅ AccessGrant verified for ${existingPatient.email}`);
        displayPatientInfo(existingPatient, "EXISTING");
        process.exit(0);
      }
    }

    // Hash password
    const password = "TestPatient123!";
    const passwordHash = await bcrypt.hash(password, 10);

    // Create patient user
    const patientUser = await prisma.user.create({
      data: {
        email: "patient.test@healthcareapp.com",
        passwordHash,
        firstName: "Test",
        lastName: "Patient",
        role: "PATIENT",
        phoneNumber: "+1-555-0100",
        isActive: true,
      },
    });

    console.log(`✅ Created patient user: ${patientUser.email}`);

    // Create patient record
    const medicalRecordNumber = `MRN-${Date.now()}`;
    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        medicalRecordNumber,
        dateOfBirth: new Date("1985-05-15"),
        gender: "MALE",
        bloodType: "O_POSITIVE",
        isActive: true,
      },
    });

    console.log(`✅ Created patient record: ${medicalRecordNumber}`);

    // Create AccessGrant to link doctor and patient
    const accessGrant = await prisma.accessGrant.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        grantedAt: new Date(),
        isActive: true,
      },
    });

    console.log(`✅ Created AccessGrant linking doctor and patient`);

    displayPatientInfo(patientUser, "NEW");

    console.log("\n✨ Test patient created successfully!");
    console.log(
      "You can now log in and see this patient in the analyses section."
    );
  } catch (error) {
    console.error("❌ Error creating test patient:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function displayPatientInfo(user: any, status: "NEW" | "EXISTING") {
  console.log("\n📋 Patient Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Status:   ${status}`);
  console.log(`Email:    patient.test@healthcareapp.com`);
  console.log(`Password: TestPatient123!`);
  console.log(`Name:     ${user.firstName} ${user.lastName}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

createTestPatient();

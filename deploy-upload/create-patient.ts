/**
 * Script to create demo patient account
 * Run: npx ts-node create-patient.ts
 */

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/utils";

const PATIENT_EMAIL = "nizarchaieb44@gmail.com";
const PATIENT_PASSWORD = "Patient@123456";

async function main() {
  try {
    console.log("🔧 Setting up patient account...");

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: PATIENT_EMAIL },
    });

    if (user && user.role === "PATIENT") {
      console.log(`✅ Patient already exists: ${user.email}`);
      console.log(`📝 User ID: ${user.id}`);

      // Check if patient profile exists
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id },
      });

      if (patient) {
        console.log(`📋 Patient profile ID: ${patient.id}`);
      } else {
        console.log(`⚠️ User exists but no patient profile. Creating one...`);
        const newPatient = await prisma.patient.create({
          data: {
            userId: user.id,
            medicalRecordNumber: `MR-${Date.now()}`,
            dateOfBirth: new Date("1990-01-15"),
            gender: "Male",
            bloodType: "O+",
          },
        });
        console.log(`✅ Patient profile created: ${newPatient.id}`);
      }
    } else if (user) {
      console.log(`⚠️ User exists but is not a patient (role: ${user.role})`);
      process.exit(1);
    } else {
      console.log(`📝 Creating new patient account...`);

      const hashedPassword = await hashPassword(PATIENT_PASSWORD);

      const newUser = await prisma.user.create({
        data: {
          email: PATIENT_EMAIL,
          passwordHash: hashedPassword,
          firstName: "Nizar",
          lastName: "Chaieb",
          role: "PATIENT",
          isActive: true,
          isApproved: true,
          phoneNumber: "+216 28609851",
        },
      });

      console.log(`✅ User account created: ${newUser.id}`);

      // Create patient profile
      const newPatient = await prisma.patient.create({
        data: {
          userId: newUser.id,
          medicalRecordNumber: `MR-${Date.now()}`,
          dateOfBirth: new Date("1990-01-15"),
          gender: "Male",
          bloodType: "O+",
        },
      });

      console.log(`✅ Patient profile created: ${newPatient.id}`);
    }

    console.log("\n✨ You can now log in with:");
    console.log(`📧 Email: ${PATIENT_EMAIL}`);
    console.log(`🔑 Password: ${PATIENT_PASSWORD}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

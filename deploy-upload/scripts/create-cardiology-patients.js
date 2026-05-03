#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CARDIOLOGY_PATIENTS = [
  {
    email: "patient.cardiac1@medifollow.health",
    firstName: "Jean",
    lastName: "Dupont",
    phoneNumber: "+33-1-23-45-67-89",
    dateOfBirth: new Date("1965-03-20"),
    gender: "MALE",
    bloodType: "A_POSITIVE",
    diagnosis: "Hypertension",
  },
  {
    email: "patient.cardiac2@medifollow.health",
    firstName: "Marie",
    lastName: "Martin",
    phoneNumber: "+33-2-34-56-78-90",
    dateOfBirth: new Date("1970-07-15"),
    gender: "FEMALE",
    bloodType: "B_POSITIVE",
    diagnosis: "Insuffisance cardiaque",
  },
  {
    email: "patient.cardiac3@medifollow.health",
    firstName: "Pierre",
    lastName: "Bernard",
    phoneNumber: "+33-3-45-67-89-01",
    dateOfBirth: new Date("1958-11-08"),
    gender: "MALE",
    bloodType: "O_POSITIVE",
    diagnosis: "Arythmie cardiaque",
  },
  {
    email: "patient.cardiac4@medifollow.health",
    firstName: "Sophie",
    lastName: "Laurent",
    phoneNumber: "+33-4-56-78-90-12",
    dateOfBirth: new Date("1975-09-22"),
    gender: "FEMALE",
    bloodType: "AB_NEGATIVE",
    diagnosis: "Maladie coronarienne",
  },
];

async function main() {
  try {
    // Find doctor Arij
    const doctor = await prisma.user.findUnique({
      where: { email: "arij@medifollow.health" },
      include: { doctorProfile: true },
    });

    if (!doctor) {
      console.error("❌ Doctor arij@medifollow.health not found");
      process.exit(1);
    }

    console.log(
      `\n✅ Found doctor: Dr. ${doctor.firstName} ${doctor.lastName}`
    );

    // Create patients
    let createdCount = 0;
    let skippedCount = 0;

    for (const patientData of CARDIOLOGY_PATIENTS) {
      try {
        // Check if patient already exists
        const existing = await prisma.user.findUnique({
          where: { email: patientData.email },
        });

        if (existing) {
          console.log(
            `⏭️  Skip - Patient already exists: ${patientData.email}`
          );
          skippedCount++;

          // Verify AccessGrant exists
          const patientRecord = await prisma.patient.findUnique({
            where: { userId: existing.id },
          });

          if (patientRecord) {
            await prisma.accessGrant.upsert({
              where: {
                patientId_doctorId: {
                  patientId: patientRecord.id,
                  doctorId: doctor.id,
                },
              },
              update: { isActive: true },
              create: {
                patientId: patientRecord.id,
                doctorId: doctor.id,
                grantedAt: new Date(),
                isActive: true,
              },
            });
          }
          continue;
        }

        // Hash password
        const password = "PatientTest123!";
        const passwordHash = await bcrypt.hash(password, 12);

        // Create patient user
        const patientUser = await prisma.user.create({
          data: {
            email: patientData.email,
            passwordHash,
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            phoneNumber: patientData.phoneNumber,
            role: "PATIENT",
            isActive: true,
          },
        });

        // Create patient record
        const medicalRecordNumber = `MRN-CARDIO-${Date.now()}-${createdCount}`;
        const patient = await prisma.patient.create({
          data: {
            userId: patientUser.id,
            medicalRecordNumber,
            dateOfBirth: patientData.dateOfBirth,
            gender: patientData.gender,
            bloodType: patientData.bloodType,
            diagnosis: patientData.diagnosis,
            isActive: true,
          },
        });

        // Create AccessGrant to link doctor and patient
        await prisma.accessGrant.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            grantedAt: new Date(),
            isActive: true,
          },
        });

        console.log(
          `✅ Created patient: ${patientData.firstName} ${patientData.lastName} (${patientData.email})`
        );
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Error creating patient ${patientData.email}:`,
          error.message
        );
      }
    }

    // Display summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 SUMMARY");
    console.log("=".repeat(70));
    console.log(`✅ Created: ${createdCount} patients`);
    console.log(`⏭️  Skipped: ${skippedCount} patients (already exist)`);
    console.log(`👨‍⚕️  Doctor: Dr. ${doctor.firstName} ${doctor.lastName}`);
    console.log(`📧 Doctor Email: ${doctor.email}`);
    console.log(`🔐 Doctor Password: Test1234*`);

    console.log("\n📋 PATIENT LOGIN CREDENTIALS");
    console.log("=".repeat(70));

    for (const patientData of CARDIOLOGY_PATIENTS) {
      console.log(`\nName: ${patientData.firstName} ${patientData.lastName}`);
      console.log(`Email: ${patientData.email}`);
      console.log(`Password: PatientTest123!`);
      console.log(`Diagnosis: ${patientData.diagnosis}`);
    }

    console.log("\n🎯 Test Setup Complete!");
    console.log("Now the doctor can:");
    console.log("  1. Log in at http://localhost:3000/login");
    console.log("  2. View these 4 cardiac patients");
    console.log("  3. Request analyses from them");
    console.log("  4. Assign questionnaires");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

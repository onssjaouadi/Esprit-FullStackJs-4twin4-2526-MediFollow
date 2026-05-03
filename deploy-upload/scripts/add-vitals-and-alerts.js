#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Simulated vital signs data for cardiology patients
const PATIENT_VITALS = [
  {
    email: "patient.cardiac1@medifollow.health",
    name: "Jean Dupont",
    diagnosis: "Hypertension",
    vitals: [
      {
        systolicBP: 160,
        diastolicBP: 100,
        heartRate: 95,
        temperature: 36.8,
        oxygenSaturation: 98,
        status: "CRITIQUE",
      },
      {
        systolicBP: 155,
        diastolicBP: 98,
        heartRate: 92,
        temperature: 36.9,
        oxygenSaturation: 98,
        status: "A_VERIFIER",
      },
      {
        systolicBP: 150,
        diastolicBP: 95,
        heartRate: 88,
        temperature: 36.8,
        oxygenSaturation: 99,
        status: "NORMAL",
      },
    ],
  },
  {
    email: "patient.cardiac2@medifollow.health",
    name: "Marie Martin",
    diagnosis: "Insuffisance cardiaque",
    vitals: [
      {
        systolicBP: 130,
        diastolicBP: 85,
        heartRate: 110,
        temperature: 36.7,
        oxygenSaturation: 94,
        status: "A_VERIFIER",
      },
      {
        systolicBP: 125,
        diastolicBP: 82,
        heartRate: 105,
        temperature: 36.8,
        oxygenSaturation: 95,
        status: "A_VERIFIER",
      },
      {
        systolicBP: 128,
        diastolicBP: 80,
        heartRate: 102,
        temperature: 36.8,
        oxygenSaturation: 96,
        status: "NORMAL",
      },
    ],
  },
  {
    email: "patient.cardiac3@medifollow.health",
    name: "Pierre Bernard",
    diagnosis: "Arythmie cardiaque",
    vitals: [
      {
        systolicBP: 135,
        diastolicBP: 85,
        heartRate: 125,
        temperature: 36.9,
        oxygenSaturation: 97,
        status: "CRITIQUE",
      },
      {
        systolicBP: 132,
        diastolicBP: 84,
        heartRate: 118,
        temperature: 36.8,
        oxygenSaturation: 97,
        status: "A_VERIFIER",
      },
      {
        systolicBP: 130,
        diastolicBP: 82,
        heartRate: 95,
        temperature: 36.7,
        oxygenSaturation: 98,
        status: "NORMAL",
      },
    ],
  },
  {
    email: "patient.cardiac4@medifollow.health",
    name: "Sophie Laurent",
    diagnosis: "Maladie coronarienne",
    vitals: [
      {
        systolicBP: 148,
        diastolicBP: 92,
        heartRate: 100,
        temperature: 36.8,
        oxygenSaturation: 95,
        status: "A_VERIFIER",
      },
      {
        systolicBP: 145,
        diastolicBP: 90,
        heartRate: 98,
        temperature: 36.8,
        oxygenSaturation: 96,
        status: "A_VERIFIER",
      },
      {
        systolicBP: 142,
        diastolicBP: 88,
        heartRate: 92,
        temperature: 36.8,
        oxygenSaturation: 97,
        status: "NORMAL",
      },
    ],
  },
];

async function main() {
  try {
    console.log("\n📊 Adding Vital Signs and Alerts for Cardiac Patients...\n");

    // Get the doctor (Arij)
    const doctor = await prisma.user.findUnique({
      where: { email: "arij@medifollow.health" },
      include: { doctorProfile: true },
    });

    if (!doctor) {
      console.log("❌ Doctor not found: arij@medifollow.health");
      process.exit(1);
    }

    console.log(`👨‍⚕️  Doctor: ${doctor.firstName} ${doctor.lastName}\n`);

    let totalVitals = 0;
    let totalAlerts = 0;

    for (const patientData of PATIENT_VITALS) {
      // Find patient by email
      const user = await prisma.user.findUnique({
        where: { email: patientData.email },
        include: { patient: true },
      });

      if (!user || !user.patient) {
        console.log(`⏭️  Patient not found: ${patientData.name}`);
        continue;
      }

      const patient = user.patient;
      console.log(`\n👤 ${patientData.name} (${patientData.diagnosis})`);

      // Add vital signs with different timestamps
      const now = new Date();
      let createdVitals = 0;
      const vitalIds = [];

      for (let i = patientData.vitals.length - 1; i >= 0; i--) {
        const vitalData = patientData.vitals[i];
        const recordedAt = new Date(
          now.getTime() - (patientData.vitals.length - 1 - i) * 3600000
        ); // 1 hour apart

        const vital = await prisma.vitalRecord.create({
          data: {
            patientId: patient.id,
            systolicBP: vitalData.systolicBP,
            diastolicBP: vitalData.diastolicBP,
            heartRate: vitalData.heartRate,
            temperature: vitalData.temperature,
            oxygenSaturation: vitalData.oxygenSaturation,
            status: vitalData.status,
            recordedAt,
          },
        });

        vitalIds.push(vital.id);
        createdVitals++;
      }

      console.log(`   ✅ Created ${createdVitals} vital records`);
      totalVitals += createdVitals;

      // Create alerts based on vital signs
      let createdAlerts = 0;

      // Alert for critical/high blood pressure
      if (patientData.vitals.some((v) => v.systolicBP > 150)) {
        await prisma.alert.create({
          data: {
            patientId: patient.id,
            alertType: "VITAL",
            severity: "HIGH",
            message: `Hypertension Alert: Systolic BP > 150 mmHg`,
            vitalRecordId: vitalIds[0],
            triggeredById: doctor.id,
          },
        });
        createdAlerts++;
      }

      // Alert for high heart rate (tachycardia)
      if (patientData.vitals.some((v) => v.heartRate > 110)) {
        await prisma.alert.create({
          data: {
            patientId: patient.id,
            alertType: "VITAL",
            severity: "HIGH",
            message: `Tachycardia Alert: Heart Rate > 110 bpm`,
            vitalRecordId: vitalIds[0],
            triggeredById: doctor.id,
          },
        });
        createdAlerts++;
      }

      // Alert for low oxygen saturation
      if (patientData.vitals.some((v) => v.oxygenSaturation < 95)) {
        await prisma.alert.create({
          data: {
            patientId: patient.id,
            alertType: "VITAL",
            severity: "MEDIUM",
            message: `Low Oxygen Alert: SpO2 < 95%`,
            vitalRecordId: vitalIds[0],
            triggeredById: doctor.id,
          },
        });
        createdAlerts++;
      }

      // Alert for arrhythmia (specific to Pierre Bernard)
      if (
        patientData.diagnosis.toUpperCase().includes("ARYTHMIE") ||
        patientData.diagnosis.toUpperCase().includes("ARRHYTHMIA")
      ) {
        await prisma.alert.create({
          data: {
            patientId: patient.id,
            alertType: "VITAL",
            severity: "HIGH",
            message: `Arrhythmia Detected: Irregular heart rate pattern`,
            vitalRecordId: vitalIds[0],
            triggeredById: doctor.id,
          },
        });
        createdAlerts++;
      }

      console.log(`   ⚠️  Created ${createdAlerts} alerts`);
      totalAlerts += createdAlerts;
    }

    // Display summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 VITAL SIGNS & ALERTS SUMMARY");
    console.log("=".repeat(70));
    console.log(`✅ Total Vital Records Created: ${totalVitals}`);
    console.log(`⚠️  Total Alerts Created: ${totalAlerts}`);
    console.log("\n🎯 Next Steps:");
    console.log("   1. Log in as Dr. Arij Medecin (arij@medifollow.health)");
    console.log("   2. Go to Patients section - should see 4 cardiac patients");
    console.log("   3. Go to Alerts section - should see the open alerts");
    console.log("   4. Go to Vitals section - should see the vital sign data");
    console.log("   5. Review alerts and acknowledge");
    console.log("=".repeat(70));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

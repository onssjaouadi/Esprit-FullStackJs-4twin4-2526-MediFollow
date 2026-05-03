/**
 * MediFollow - Database Seed Script
 * Populates the database with demo data
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.alert.deleteMany();
  await prisma.vitalRecord.deleteMany();
  await prisma.symptom.deleteMany();
  await prisma.session.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // Create Admin User
  console.log("👤 Creating admin user...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@medifollow.health",
      passwordHash: hashedPassword,
      firstName: "Admin",
      lastName: "MediFollow",
      role: "ADMIN",
      phoneNumber: "+33612345678",
      isActive: true,
    },
  });

  // Create Doctor User
  console.log("👨‍⚕️ Creating doctor user...");
  const doctor = await prisma.user.create({
    data: {
      email: "doctor@medifollow.health",
      passwordHash: hashedPassword,
      firstName: "Dr. Marie",
      lastName: "Dupont",
      role: "DOCTOR",
      phoneNumber: "+33612345679",
      isActive: true,
    },
  });

  // Create Patient Users
  console.log("🏥 Creating patient users...");

  // Patient 1 - Jean Martin
  const patient1User = await prisma.user.create({
    data: {
      email: "patient@medifollow.health",
      passwordHash: hashedPassword,
      firstName: "Jean",
      lastName: "Martin",
      role: "PATIENT",
      phoneNumber: "+33612345680",
      isActive: true,
    },
  });

  const patient1 = await prisma.patient.create({
    data: {
      userId: patient1User.id,
      medicalRecordNumber: "MRN001",
      dateOfBirth: new Date("1985-05-15"),
      gender: "MALE",
      bloodType: "A_POSITIVE",
      address: {
        street: "123 Rue de la Santé",
        city: "Paris",
        state: "Île-de-France",
        postalCode: "75013",
        country: "France",
      },
      emergencyContact: {
        name: "Marie Martin",
        relationship: "Épouse",
        phoneNumber: "+33612345681",
        email: "marie.martin@email.com",
      },
      dischargeDate: new Date("2026-02-15"),
      diagnosis: "Hypertension artérielle",
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "1 fois par jour",
          startDate: new Date("2026-02-15"),
          notes: "À prendre le matin",
        },
      ],
      vitalThresholds: {
        systolicBP: { min: 90, max: 140 },
        diastolicBP: { min: 60, max: 90 },
        heartRate: { min: 60, max: 100 },
        temperature: { min: 36.0, max: 37.5 },
        oxygenSaturation: { min: 95, max: 100 },
        weight: { min: 70, max: 85 },
      },
      isActive: true,
    },
  });

  // Patient 2 - Sophie Bernard
  const patient2User = await prisma.user.create({
    data: {
      email: "sophie.bernard@email.com",
      passwordHash: hashedPassword,
      firstName: "Sophie",
      lastName: "Bernard",
      role: "PATIENT",
      phoneNumber: "+33612345682",
      isActive: true,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      userId: patient2User.id,
      medicalRecordNumber: "MRN002",
      dateOfBirth: new Date("1992-08-22"),
      gender: "FEMALE",
      bloodType: "O_POSITIVE",
      address: {
        street: "45 Avenue des Roses",
        city: "Lyon",
        state: "Auvergne-Rhône-Alpes",
        postalCode: "69003",
        country: "France",
      },
      emergencyContact: {
        name: "Pierre Bernard",
        relationship: "Père",
        phoneNumber: "+33612345683",
        email: "pierre.bernard@email.com",
      },
      dischargeDate: new Date("2026-02-20"),
      diagnosis: "Asthme",
      medications: [
        {
          name: "Ventoline",
          dosage: "100mcg",
          frequency: "En cas de crise",
          startDate: new Date("2026-02-20"),
          notes: "Toujours avoir sur soi",
        },
      ],
      vitalThresholds: {
        systolicBP: { min: 90, max: 130 },
        diastolicBP: { min: 60, max: 85 },
        heartRate: { min: 60, max: 100 },
        temperature: { min: 36.0, max: 37.5 },
        oxygenSaturation: { min: 92, max: 100 },
      },
      isActive: true,
    },
  });

  // Patient 3 - Pierre Dubois
  const patient3User = await prisma.user.create({
    data: {
      email: "pierre.dubois@email.com",
      passwordHash: hashedPassword,
      firstName: "Pierre",
      lastName: "Dubois",
      role: "PATIENT",
      phoneNumber: "+33612345684",
      isActive: true,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      userId: patient3User.id,
      medicalRecordNumber: "MRN003",
      dateOfBirth: new Date("1978-11-30"),
      gender: "MALE",
      bloodType: "B_POSITIVE",
      address: {
        street: "12 Rue du Commerce",
        city: "Marseille",
        state: "Provence-Alpes-Côte d'Azur",
        postalCode: "13001",
        country: "France",
      },
      emergencyContact: {
        name: "Claire Dubois",
        relationship: "Sœur",
        phoneNumber: "+33612345685",
      },
      dischargeDate: new Date("2026-02-25"),
      diagnosis: "Diabète type 2",
      medications: [
        {
          name: "Metformine",
          dosage: "500mg",
          frequency: "2 fois par jour",
          startDate: new Date("2026-02-25"),
          notes: "Pendant les repas",
        },
      ],
      vitalThresholds: {
        systolicBP: { min: 90, max: 130 },
        diastolicBP: { min: 60, max: 85 },
        heartRate: { min: 60, max: 100 },
        temperature: { min: 36.0, max: 37.5 },
        oxygenSaturation: { min: 95, max: 100 },
        weight: { min: 80, max: 95 },
      },
      isActive: true,
    },
  });

  // Create Vital Records for Patient 1 (Jean Martin)
  console.log("📊 Creating vital records for patients...");

  const now = new Date();
  const vitalRecords1 = [];

  // Last 7 days of vitals for Patient 1
  for (let i = 6; i >= 0; i--) {
    const recordDate = new Date(now);
    recordDate.setDate(recordDate.getDate() - i);
    recordDate.setHours(9, 0, 0, 0);

    const record = await prisma.vitalRecord.create({
      data: {
        patientId: patient1.id,
        systolicBP: 125 + Math.floor(Math.random() * 20) - 10,
        diastolicBP: 75 + Math.floor(Math.random() * 15) - 5,
        heartRate: 72 + Math.floor(Math.random() * 16) - 8,
        temperature: 36.5 + Math.random() * 0.8,
        oxygenSaturation: 96 + Math.floor(Math.random() * 4),
        weight: 77 + Math.random() * 2,
        notes: i === 0 ? "Mesure de ce matin, tout va bien" : undefined,
        recordedAt: recordDate,
      },
    });
    vitalRecords1.push(record);
  }

  // One critical vital for Patient 1 (to trigger alert)
  const criticalVital1 = await prisma.vitalRecord.create({
    data: {
      patientId: patient1.id,
      systolicBP: 165, // Critical: above threshold
      diastolicBP: 95, // Critical: above threshold
      heartRate: 110, // Critical: above threshold
      temperature: 36.8,
      oxygenSaturation: 96,
      notes: "Ressenti de fatigue et maux de tête",
      recordedAt: new Date(),
    },
  });

  // Create Vital Records for Patient 2 (Sophie Bernard)
  const vitalRecords2 = [];
  for (let i = 5; i >= 0; i--) {
    const recordDate = new Date(now);
    recordDate.setDate(recordDate.getDate() - i);
    recordDate.setHours(10, 30, 0, 0);

    const record = await prisma.vitalRecord.create({
      data: {
        patientId: patient2.id,
        systolicBP: 115 + Math.floor(Math.random() * 15) - 7,
        diastolicBP: 70 + Math.floor(Math.random() * 10) - 5,
        heartRate: 75 + Math.floor(Math.random() * 12) - 6,
        temperature: 36.3 + Math.random() * 0.6,
        oxygenSaturation: 94 + Math.floor(Math.random() * 5),
        recordedAt: recordDate,
      },
    });
    vitalRecords2.push(record);
  }

  // Create Vital Records for Patient 3 (Pierre Dubois)
  const vitalRecords3 = [];
  for (let i = 4; i >= 0; i--) {
    const recordDate = new Date(now);
    recordDate.setDate(recordDate.getDate() - i);
    recordDate.setHours(8, 0, 0, 0);

    const record = await prisma.vitalRecord.create({
      data: {
        patientId: patient3.id,
        systolicBP: 120 + Math.floor(Math.random() * 12) - 6,
        diastolicBP: 78 + Math.floor(Math.random() * 8) - 4,
        heartRate: 68 + Math.floor(Math.random() * 10) - 5,
        temperature: 36.6 + Math.random() * 0.5,
        oxygenSaturation: 97 + Math.floor(Math.random() * 3),
        weight: 88 + Math.random() * 3,
        recordedAt: recordDate,
      },
    });
    vitalRecords3.push(record);
  }

  // Create Alerts
  console.log("🚨 Creating alerts...");

  // Alert for Patient 1 - Critical BP
  await prisma.alert.create({
    data: {
      patientId: patient1.id,
      alertType: "VITAL",
      severity: "CRITICAL",
      status: "OPEN",
      message: "Pression systolique critique: 165 mmHg (seuil: 140 mmHg)",
      data: {
        vitalType: "systolicBP",
        value: 165,
        threshold: { min: 90, max: 140 },
        vitalRecordId: criticalVital1.id,
      },
    },
  });

  await prisma.alert.create({
    data: {
      patientId: patient1.id,
      alertType: "VITAL",
      severity: "CRITICAL",
      status: "OPEN",
      message: "Fréquence cardiaque critique: 110 bpm (seuil max: 100 bpm)",
      data: {
        vitalType: "heartRate",
        value: 110,
        threshold: { min: 60, max: 100 },
        vitalRecordId: criticalVital1.id,
      },
    },
  });

  // Alert for Patient 2 - Low SpO2
  await prisma.alert.create({
    data: {
      patientId: patient2.id,
      alertType: "VITAL",
      severity: "MEDIUM",
      status: "ACKNOWLEDGED",
      message: "Saturation en oxygène faible: 93% (seuil min: 95%)",
      data: {
        vitalType: "oxygenSaturation",
        value: 93,
        threshold: { min: 95, max: 100 },
      },
      acknowledgedById: doctor.id,
      acknowledgedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  // Resolved alert for Patient 3
  await prisma.alert.create({
    data: {
      patientId: patient3.id,
      alertType: "VITAL",
      severity: "HIGH",
      status: "RESOLVED",
      message: "Pression artérielle élevée détectée",
      data: {
        vitalType: "systolicBP",
        value: 145,
        threshold: { min: 90, max: 130 },
      },
      acknowledgedById: doctor.id,
      acknowledgedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      resolvedById: doctor.id,
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      resolution:
        "Patient contacté. Ajustement du traitement effectué. Surveillance quotidienne mise en place.",
    },
  });

  // Create Symptoms
  console.log("💭 Creating symptoms...");

  await prisma.symptom.create({
    data: {
      patientId: patient1.id,
      symptomType: "Maux de tête",
      severity: "MODERATE",
      description:
        "Maux de tête persistants depuis ce matin, surtout au niveau frontal",
      occurredAt: new Date(),
    },
  });

  await prisma.symptom.create({
    data: {
      patientId: patient2.id,
      symptomType: "Essoufflement",
      severity: "MILD",
      description: "Léger essoufflement après montée d'escaliers",
      occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Demo Accounts:");
  console.log("┌─────────────────────────────────────────────────────┐");
  console.log("│ Admin:                                              │");
  console.log("│   Email: admin@medifollow.health                    │");
  console.log("│   Password: Password123!                            │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ Médecin:                                            │");
  console.log("│   Email: doctor@medifollow.health                   │");
  console.log("│   Password: Password123!                            │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ Patient (Jean Martin):                              │");
  console.log("│   Email: patient@medifollow.health                  │");
  console.log("│   Password: Password123!                            │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ Patient (Sophie Bernard):                           │");
  console.log("│   Email: sophie.bernard@email.com                   │");
  console.log("│   Password: Password123!                            │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ Patient (Pierre Dubois):                            │");
  console.log("│   Email: pierre.dubois@email.com                    │");
  console.log("│   Password: Password123!                            │");
  console.log("└─────────────────────────────────────────────────────┘");
  console.log("\n📊 Data Summary:");
  console.log(`  - 5 Users (1 Admin, 1 Doctor, 3 Patients)`);
  console.log(`  - 3 Patient profiles`);
  console.log(
    `  - ${vitalRecords1.length + vitalRecords2.length + vitalRecords3.length + 1} Vital records`
  );
  console.log(`  - 4 Alerts (2 OPEN, 1 ACKNOWLEDGED, 1 RESOLVED)`);
  console.log(`  - 2 Symptoms`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

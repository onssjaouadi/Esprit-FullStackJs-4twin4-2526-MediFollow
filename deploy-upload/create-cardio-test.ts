#!/usr/bin/env node
/**
 * Script pour créer un docteur cardiologue + patient cardiaque pour tester
 * Usage: npm run test:cardio
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createCardioTest() {
  try {
    console.log("🏥 Création d'un test Cardiologue + Patient Cardiaque...\n");

    // Hash password
    const hashedPassword = await bcrypt.hash("TestCardio@123", 10);

    // 1. Créer un docteur cardiologue
    console.log("👨‍⚕️ Création du docteur cardiologue...");
    const cardioDoctor = await prisma.user.create({
      data: {
        email: "dr.cardio@test.health",
        passwordHash: hashedPassword,
        firstName: "Dr. Pierre",
        lastName: "Cardioux",
        role: "DOCTOR",
        phoneNumber: "+33699999999",
        isActive: true,
      },
    });

    console.log(`   ✅ Docteur créé: ${cardioDoctor.email}`);

    // 2. Créer la spécialité du docteur
    console.log("📋 Configuration de la spécialité...");
    const doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: cardioDoctor.id,
        specialty: "CARDIOLOGY",
        bio: "Spécialiste en cardiologie avec 15 ans d'expérience",
        phone: "+33699999999",
        location: "Paris, France",
      },
    });

    console.log(`   ✅ Spécialité définie: ${doctorProfile.specialty}`);

    // 3. Créer un patient avec diagnostic cardiaque
    console.log("\n👤 Création du patient cardiologue...");
    const cardioPatientUser = await prisma.user.create({
      data: {
        email: "patient.cardio@test.health",
        passwordHash: hashedPassword,
        firstName: "Jean",
        lastName: "Lachance",
        role: "PATIENT",
        phoneNumber: "+33688888888",
        isActive: true,
        // Création automatique du profil Patient
        patient: {
          create: {
            medicalRecordNumber: `MRN-CARDIO-${Date.now()}`,
            dateOfBirth: new Date("1975-03-20"),
            gender: "MALE",
            bloodType: "A_POSITIVE",
            diagnosis: "Cardiologie - Arythmie cardiaque",
            address: {
              street: "456 Avenue du Cœur",
              city: "Lyon",
              state: "Auvergne-Rhône-Alpes",
              postalCode: "69000",
              country: "France",
            },
            emergencyContact: {
              name: "Marie Lachance",
              relationship: "Épouse",
              phoneNumber: "+33688888889",
              email: "marie.lachance@test.health",
            },
            dischargeDate: new Date("2026-03-01"),
            medications: [
              {
                name: "Bisoprolol",
                dosage: "5mg",
                frequency: "1 fois par jour",
                startDate: new Date("2026-03-01"),
                notes: "Pour réguler le rythme cardiaque",
              },
            ],
            vitalThresholds: {
              systolicBP: { min: 100, max: 140 },
              diastolicBP: { min: 60, max: 90 },
              heartRate: { min: 50, max: 100 },
              temperature: { min: 36.0, max: 37.5 },
              oxygenSaturation: { min: 95, max: 100 },
              weight: { min: 75, max: 85 },
            },
            isActive: true,
          },
        },
      },
      include: {
        patient: true,
      },
    });

    console.log(`   ✅ Patient créé: ${cardioPatientUser.email}`);
    console.log(`   📋 Diagnostic: ${cardioPatientUser.patient?.diagnosis}`);

    // 4. Ajouter quelques mesures de signes vitaux pour le patient
    console.log("\n📊 Ajout de signes vitaux...");
    const now = new Date();

    const vitals = await prisma.vitalRecord.create({
      data: {
        patientId: cardioPatientUser.patient!.id,
        heartRate: 85,
        systolicBP: 130,
        diastolicBP: 85,
        temperature: 37.0,
        oxygenSaturation: 98,
        weight: 78,
        notes: "Mesure basale - Patient stable",
        recordedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    });

    console.log("   ✅ Mesures ajoutées");

    // 5. Résumé
    console.log("\n" + "=".repeat(60));
    console.log("✨ TEST CARDIOLOGIE CRÉÉ AVEC SUCCÈS");
    console.log("=".repeat(60));

    console.log("\n🔐 Identifiants de test:");
    console.log("\n   DOCTEUR CARDIOLOGUE:");
    console.log(`   📧 Email: dr.cardio@test.health`);
    console.log(`   🔑 Mot de passe: TestCardio@123`);
    console.log(`   🏥 Spécialité: Cardiologie`);

    console.log("\n   PATIENT CARDIAQUE:");
    console.log(`   📧 Email: patient.cardio@test.health`);
    console.log(`   🔑 Mot de passe: TestCardio@123`);
    console.log(`   📋 Diagnostic: Cardiologie - Arythmie cardiaque`);
    console.log(`   📊 MRN: ${cardioPatientUser.patient?.medicalRecordNumber}`);

    console.log("\n📝 Instructions de test:");
    console.log("   1. Connectez-vous avec le docteur cardiologue");
    console.log("   2. Allez à /dashboard/doctor/patients");
    console.log("   3. Vous devriez voir 'Jean Lachance' dans la liste");
    console.log(
      "   4. Vérifiez que seuls les patients avec 'Cardiologie' dans"
    );
    console.log("      leur diagnostic s'affichent");

    console.log("\n✅ Test prêt! Lancez l'app avec: npm run dev\n");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCardioTest();

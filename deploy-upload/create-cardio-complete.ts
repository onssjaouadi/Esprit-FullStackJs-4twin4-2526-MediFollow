#!/usr/bin/env node
/**
 * Script complet pour créer un docteur cardiologue + plusieurs patients cardialogues
 * avec alertes et notifications réalistes
 * Usage: npm run test:cardio-complete
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createCardioComplete() {
  try {
    console.log("🏥 Création d'un écosystème Cardiologie complet...\n");

    // Hash password
    const hashedPassword = await bcrypt.hash("Cardio@123456", 10);

    // ============================================
    // 1. CRÉER LE DOCTEUR CARDIOLOGUE
    // ============================================
    console.log("👨‍⚕️ Création du docteur cardiologue...");

    // Générer un email unique avec timestamp
    const doctorEmailId = Math.random().toString(36).substr(2, 9);
    const cardioDoctor = await prisma.user.create({
      data: {
        email: `dr.martin.leclerc+${doctorEmailId}@hosp.fr`,
        passwordHash: hashedPassword,
        firstName: "Dr. Martin",
        lastName: "Leclerc",
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
        bio: "Cardiologue interventionniste avec 18 ans d'expérience. Spécialisé en arythmies et insuffisances cardiaques.",
        phone: "+33699999999",
        location: "Hôpital Universitaire de Lyon, France",
      },
    });

    console.log(`   ✅ Spécialité définie: ${doctorProfile.specialty}`);

    // ============================================
    // 2. CRÉER PLUSIEURS PATIENTS CARDIAQUES
    // ============================================
    const patientsData = [
      {
        email: `jean.dupont+${Math.random().toString(36).substr(2, 9)}@email.fr`,
        firstName: "Jean",
        lastName: "Dupont",
        dateOfBirth: new Date("1962-03-20"),
        gender: "MALE" as const,
        bloodType: "O_POSITIVE" as const,
        diagnosis: "CARDIOLOGY - Insuffisance cardiaque systolique",
        address: {
          street: "42 Rue de la Paix",
          city: "Lyon",
          state: "Auvergne-Rhône-Alpes",
          postalCode: "69000",
          country: "France",
        },
        medicines: [
          {
            name: "Furosémide (Lasix)",
            dosage: "40mg",
            frequency: "2 fois par jour",
          },
          {
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "1 fois par jour",
          },
          {
            name: "Carvedilol",
            dosage: "6.25mg",
            frequency: "2 fois par jour",
          },
        ],
        vitals: {
          heartRate: 102,
          systolicBP: 145,
          diastolicBP: 92,
          weight: 92,
        },
        alerts: [
          {
            alertType: "VITAL",
            severity: "CRITICAL",
            message: "Fréquence cardiaque élevée: 102 bpm",
            data: {
              vitalType: "heartRate",
              value: 102,
              normalRange: "60-100",
              unit: "bpm",
            },
          },
          {
            alertType: "VITAL",
            severity: "HIGH",
            message: "Tension artérielle systolique élevée: 145 mmHg",
            data: {
              vitalType: "systolicBP",
              value: 145,
              normalRange: "90-130",
              unit: "mmHg",
            },
          },
          {
            alertType: "SYMPTOM",
            severity: "HIGH",
            message:
              "Essoufflement éveillant la nuit - Possible aggravation de l'insuffisance",
            data: {
              symptomNote: "Orthopnée observée",
              severity: "HIGH",
            },
          },
        ],
      },
      {
        email: `marie.bernard+${Math.random().toString(36).substr(2, 9)}@email.fr`,
        firstName: "Marie",
        lastName: "Bernard",
        dateOfBirth: new Date("1958-07-15"),
        gender: "FEMALE" as const,
        bloodType: "A_POSITIVE" as const,
        diagnosis: "CARDIOLOGY - Fibrillation auriculaire paroxystique",
        address: {
          street: "78 Boulevard Gambetta",
          city: "Paris",
          state: "Île-de-France",
          postalCode: "75020",
          country: "France",
        },
        medicines: [
          {
            name: "Warfarine (Coumadine)",
            dosage: "5mg",
            frequency: "1 fois par jour",
          },
          {
            name: "Métoprolol",
            dosage: "100mg",
            frequency: "2 fois par jour",
          },
          {
            name: "Digoxine",
            dosage: "0.25mg",
            frequency: "1 fois par jour",
          },
        ],
        vitals: {
          heartRate: 98,
          systolicBP: 138,
          diastolicBP: 88,
          weight: 68,
        },
        alerts: [
          {
            alertType: "VITAL",
            severity: "CRITICAL",
            message: "Arythmie détectée - FC irrégulière à 98 bpm",
            data: {
              vitalType: "heartRate",
              value: 98,
              pattern: "Irrégulière",
              unit: "bpm",
            },
          },
          {
            alertType: "MEDICATION",
            severity: "HIGH",
            message: "Suivi INR recommandé pour Warfarine",
            data: {
              medicationName: "Warfarine",
              note: "Dernier INR: 2.8 (normal)",
            },
          },
          {
            alertType: "SYMPTOM",
            severity: "MEDIUM",
            message: "Palpitations rapides observées",
            data: {
              symptomNote: "Episodes de palpitations de 30-60 secondes",
              frequency: "2-3 episodes/jour",
            },
          },
        ],
      },
      {
        email: `pierre.martin+${Math.random().toString(36).substr(2, 9)}@email.fr`,
        firstName: "Pierre",
        lastName: "Martin",
        dateOfBirth: new Date("1970-11-28"),
        gender: "MALE" as const,
        bloodType: "B_NEGATIVE" as const,
        diagnosis: "CARDIOLOGY - Hypertension pulmonaire",
        address: {
          street: "150 Avenue des Pins",
          city: "Marseille",
          state: "Provence-Alpes-Côte d'Azur",
          postalCode: "13000",
          country: "France",
        },
        medicines: [
          {
            name: "Sildenafil (Revatio)",
            dosage: "20mg",
            frequency: "3 fois par jour",
          },
          {
            name: "Ambrisentan",
            dosage: "5mg",
            frequency: "1 fois par jour",
          },
          {
            name: "Diurétique",
            dosage: "Variable",
            frequency: "Selon besoin",
          },
        ],
        vitals: {
          heartRate: 95,
          systolicBP: 142,
          diastolicBP: 90,
          weight: 85,
          oxygenSaturation: 92,
        },
        alerts: [
          {
            alertType: "VITAL",
            severity: "CRITICAL",
            message: "Saturation en oxygène basse: 92%",
            data: {
              vitalType: "oxygenSaturation",
              value: 92,
              normalRange: ">95",
              unit: "%",
            },
          },
          {
            alertType: "VITAL",
            severity: "MEDIUM",
            message: "Tension artérielle élevée: 142/90 mmHg",
            data: {
              vitalType: "bloodPressure",
              systolic: 142,
              diastolic: 90,
              unit: "mmHg",
            },
          },
          {
            alertType: "SYMPTOM",
            severity: "HIGH",
            message: "Dyspnée d'effort progressive",
            data: {
              symptomNote:
                "Essoufflement avec montée d'escalier depuis 2 jours",
              severity: "HIGH",
            },
          },
        ],
      },
      {
        email: `anne.rousseau+${Math.random().toString(36).substr(2, 9)}@email.fr`,
        firstName: "Anne",
        lastName: "Rousseau",
        dateOfBirth: new Date("1965-05-10"),
        gender: "FEMALE" as const,
        bloodType: "AB_POSITIVE" as const,
        diagnosis: "CARDIOLOGY - Sténose aortique modérée",
        address: {
          street: "23 Rue de la Fontaine",
          city: "Toulouse",
          state: "Occitanie",
          postalCode: "31000",
          country: "France",
        },
        medicines: [
          {
            name: "Amlodipine",
            dosage: "5mg",
            frequency: "1 fois par jour",
          },
          {
            name: "Aspirine",
            dosage: "100mg",
            frequency: "1 fois par jour",
          },
        ],
        vitals: {
          heartRate: 78,
          systolicBP: 135,
          diastolicBP: 82,
          weight: 72,
        },
        alerts: [
          {
            alertType: "VITAL",
            severity: "MEDIUM",
            message:
              "Tension artérielle systolique légèrement élevée: 135 mmHg",
            data: {
              vitalType: "systolicBP",
              value: 135,
              normalRange: "90-130",
              unit: "mmHg",
            },
          },
          {
            alertType: "SYMPTOM",
            severity: "MEDIUM",
            message: "Légère douleur thoracique à l'effort",
            data: {
              symptomNote: "Douleur légère pendant l'exercice",
              relief: "Au repos",
            },
          },
        ],
      },
    ];

    const createdPatients = [];

    for (const patientData of patientsData) {
      console.log(
        `\n👤 Création du patient: ${patientData.firstName} ${patientData.lastName}...`
      );

      const patientUser = await prisma.user.create({
        data: {
          email: patientData.email,
          passwordHash: hashedPassword,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          role: "PATIENT",
          phoneNumber:
            "+33" + Math.floor(Math.random() * 900000000 + 100000000),
          isActive: true,
          patient: {
            create: {
              medicalRecordNumber: `MRN-CARDIO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              dateOfBirth: patientData.dateOfBirth,
              gender: patientData.gender,
              bloodType: patientData.bloodType,
              diagnosis: patientData.diagnosis,
              address: patientData.address,
              emergencyContact: {
                name: `Famille ${patientData.lastName}`,
                relationship: "Famille",
                phoneNumber:
                  "+33" + Math.floor(Math.random() * 900000000 + 100000000),
                email: `emergency.${patientData.email}`,
              },
              dischargeDate: new Date(),
              medications: patientData.medicines.map((med) => ({
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                startDate: new Date(
                  new Date().getTime() - 30 * 24 * 60 * 60 * 1000
                ),
                notes: `Médicament cardioprotecteur - suivi régulier`,
              })),
              vitalThresholds: {
                systolicBP: { min: 90, max: 140 },
                diastolicBP: { min: 60, max: 90 },
                heartRate: { min: 50, max: 100 },
                temperature: { min: 36.0, max: 37.5 },
                oxygenSaturation: { min: 94, max: 100 },
                weight: { min: 65, max: 95 },
              },
              isActive: true,
            },
          },
        },
        include: {
          patient: true,
        },
      });

      createdPatients.push(patientUser);
      console.log(`   ✅ Patient créé: ${patientUser.email}`);
      console.log(`   📋 Diagnostic: ${patientUser.patient?.diagnosis}`);

      // ============================================
      // 3. AJOUTER DES MESURES DE SIGNES VITAUX
      // ============================================
      console.log("   📊 Ajout de signes vitaux...");

      const alertData = patientsData.find((p) => p.email === patientUser.email);
      const vitals = alertData?.vitals;

      if (vitals && patientUser.patient) {
        await prisma.vitalRecord.create({
          data: {
            patientId: patientUser.patient.id,
            heartRate: vitals.heartRate,
            systolicBP: vitals.systolicBP,
            diastolicBP: vitals.diastolicBP,
            temperature: 37.0,
            oxygenSaturation: vitals.oxygenSaturation || 98,
            weight: vitals.weight,
            notes: "Mesure initiale - Suivi cardiaque recommandé",
            recordedAt: new Date(),
          },
        });

        console.log(
          `      FC: ${vitals.heartRate} bpm | TA: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`
        );
      }

      // ============================================
      // 4. CRÉER DES ALERTES CARDIAQUES
      // ============================================
      console.log("   🚨 Création des alertes...");

      const patientAlerts = alertData?.alerts || [];
      let alertCount = 0;

      for (const alertData of patientAlerts) {
        try {
          await prisma.alert.create({
            data: {
              patientId: patientUser.patient!.id,
              alertType: alertData.alertType as
                | "VITAL"
                | "SYMPTOM"
                | "MEDICATION",
              severity: alertData.severity as
                | "CRITICAL"
                | "HIGH"
                | "MEDIUM"
                | "LOW",
              message: alertData.message,
              data: alertData.data,
              status: "OPEN",
            },
          });
          alertCount++;
        } catch (err) {
          console.error(`      ❌ Erreur: ${(err as Error).message}`);
        }
      }

      console.log(`      ✅ ${alertCount} alertes créées`);

      // ============================================
      // 5. AJOUTER DES NOTES DE DOCTEUR
      // ============================================
      if (patientUser.patient) {
        await prisma.doctorNote.create({
          data: {
            patientId: patientUser.patient.id,
            doctorId: cardioDoctor.id,
            note: `Suivi initial du patient pour ${patientUser.patient.diagnosis}. 
Signes vitaux anormaux détectés. Recommandations:
1. Augmenter la fréquence de monitoring
2. Ajouter des test cardiaques appropriés
3. Revoir le plan de traitement`,
          },
        });

        console.log("   📝 Note de docteur ajoutée");
      }
    }

    // ============================================
    // 5. CRÉER DES ACCESSGRANT POUR ASSIGNER LES PATIENTS AU DOCTEUR
    // ============================================
    console.log("\n🔐 Attribution des patients au docteur...");
    for (const patient of createdPatients) {
      if (patient.patient) {
        await prisma.accessGrant.create({
          data: {
            patientId: patient.id,
            doctorId: cardioDoctor.id,
            durationDays: 365,
            isActive: true,
          },
        });
      }
    }
    console.log(`   ✅ ${createdPatients.length} patients assignés au docteur`);

    // ============================================
    // 6. RÉSUMÉ FINAL
    // ============================================
    console.log("\n" + "=".repeat(70));
    console.log("✨ ÉCOSYSTÈME CARDIOLOGIE CRÉÉ AVEC SUCCÈS!");
    console.log("=".repeat(70));

    console.log("\n🔐 IDENTIFIANTS DE CONNEXION:");
    console.log("\n📋 DOCTEUR CARDIOLOGUE:");
    console.log(`   📧 Email: dr.martin.leclerc@hosp.fr`);
    console.log(`   🔑 Mot de passe: Cardio@123456`);
    console.log(`   🏥 Spécialité: Cardiologie`);
    console.log(
      `   👥 Patients assignés: ${createdPatients.length} patients cardialogues`
    );

    console.log("\n👥 PATIENTS CRÉÉS:");
    createdPatients.forEach((patient, index) => {
      console.log(
        `   ${index + 1}. ${patient.firstName} ${patient.lastName} (${patient.patient?.diagnosis})`
      );
      console.log(`      📧 ${patient.email} | 🔑 Cardio@123456`);
    });

    console.log("\n📊 STATISTIQUES:");
    console.log(`   • Total patients: ${createdPatients.length}`);
    console.log(`   • Docteur: 1`);
    console.log(
      `   • Total alertes: ${patientsData.reduce((sum, p) => sum + (p.alerts?.length || 0), 0)}`
    );

    console.log("\n📝 INSTRUCTIONS DE TEST:");
    console.log("   1. Connectez-vous avec le docteur:");
    console.log("      Email: dr.martin.leclerc@hosp.fr");
    console.log("      Mot de passe: Cardio@123456");
    console.log("   2. Allez à /dashboard/doctor/patients");
    console.log("   3. Vous devriez voir tous les patients cardialogues");
    console.log("   4. Cliquez sur un patient pour voir les alertes");
    console.log("   5. Les alertes CRITIQUE et HIGH devraient être visibles");

    console.log("\n✅ Environnement prêt! Lancez avec: npm run dev\n");
  } catch (error) {
    console.error("❌ Erreur lors de la création:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCardioComplete();

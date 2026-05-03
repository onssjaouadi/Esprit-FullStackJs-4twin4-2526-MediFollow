#!/usr/bin/env node
/**
 * Script simplifié pour créer un docteur cardiologue + patients
 * avec emails fixes pour faciliter les tests
 * Usage: npm run test:cardio-demo
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createCardioDemo() {
  try {
    console.log("🏥 Création de l'écosystème Cardiologie (version démo)...\n");

    // Hash password
    const hashedPassword = await bcrypt.hash("Cardio@123456", 10);

    // ============================================
    // 1. SUPPRIMER LES ANCIENNES DONNÉES (optionnel)
    // ============================================
    console.log("🧹 Nettoyage des données existantes...");

    const emailsToDelete = [
      "dr.martin.leclerc@hosp.fr",
      "jean.dupont@email.fr",
      "marie.bernard@email.fr",
      "pierre.martin@email.fr",
      "anne.rousseau@email.fr",
    ];

    // Récupérer tous les utilisateurs avec ces emails
    const usersToDelete = await prisma.user.findMany({
      where: {
        email: {
          in: emailsToDelete,
        },
      },
      select: { id: true },
    });

    const userIds = usersToDelete.map((u) => u.id);

    if (userIds.length > 0) {
      // Supprimer les AccessGrant
      await prisma.accessGrant.deleteMany({
        where: {
          OR: [{ doctorId: { in: userIds } }, { patientId: { in: userIds } }],
        },
      });

      // Supprimer les patients (cascade delete via User)
      await prisma.user.deleteMany({
        where: {
          id: { in: userIds },
        },
      });
    }

    console.log("   ✅ Anciennes données supprimées\n");

    // ============================================
    // 2. CRÉER LE DOCTEUR CARDIOLOGUE
    // ============================================
    console.log("👨‍⚕️ Création du docteur cardiologue...");

    const cardioDoctor = await prisma.user.create({
      data: {
        email: "dr.martin.leclerc@hosp.fr",
        passwordHash: hashedPassword,
        firstName: "Dr. Martin",
        lastName: "Leclerc",
        role: "DOCTOR",
        phoneNumber: "+33699999999",
        isActive: true,
      },
    });

    console.log(`   ✅ Docteur créé: ${cardioDoctor.email}`);

    // Créer la spécialité du docteur
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
    // 3. CRÉER PLUSIEURS PATIENTS CARDIAQUES
    // ============================================
    const patientsData = [
      {
        email: "jean.dupont@email.fr",
        firstName: "Jean",
        lastName: "Dupont",
        dateOfBirth: new Date("1962-03-20"),
        gender: "MALE" as const,
        bloodType: "O_POSITIVE" as const,
        diagnosis: "CARDIOLOGY - Insuffisance cardiaque systolique",
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
        email: "marie.bernard@email.fr",
        firstName: "Marie",
        lastName: "Bernard",
        dateOfBirth: new Date("1958-07-15"),
        gender: "FEMALE" as const,
        bloodType: "A_POSITIVE" as const,
        diagnosis: "CARDIOLOGY - Fibrillation auriculaire paroxystique",
        vitals: { heartRate: 98, systolicBP: 138, diastolicBP: 88, weight: 68 },
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
        email: "pierre.martin@email.fr",
        firstName: "Pierre",
        lastName: "Martin",
        dateOfBirth: new Date("1970-11-28"),
        gender: "MALE" as const,
        bloodType: "B_NEGATIVE" as const,
        diagnosis: "CARDIOLOGY - Hypertension pulmonaire",
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
        email: "anne.rousseau@email.fr",
        firstName: "Anne",
        lastName: "Rousseau",
        dateOfBirth: new Date("1965-05-10"),
        gender: "FEMALE" as const,
        bloodType: "AB_POSITIVE" as const,
        diagnosis: "CARDIOLOGY - Sténose aortique modérée",
        vitals: { heartRate: 78, systolicBP: 135, diastolicBP: 82, weight: 72 },
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
              medicalRecordNumber: `MRN-CARDIO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              dateOfBirth: patientData.dateOfBirth,
              gender: patientData.gender,
              bloodType: patientData.bloodType,
              diagnosis: patientData.diagnosis,
              address: {
                street: `${Math.floor(Math.random() * 200)} Avenue de la Santé`,
                city: "Lyon",
                state: "Auvergne-Rhône-Alpes",
                postalCode: "69000",
                country: "France",
              },
              emergencyContact: {
                name: `Famille ${patientData.lastName}`,
                relationship: "Famille",
                phoneNumber:
                  "+33" + Math.floor(Math.random() * 900000000 + 100000000),
                email: `emergency.${patientData.email}`,
              },
              dischargeDate: new Date(),
              medications: [
                {
                  name: "Médicament cardioprotecteur",
                  dosage: "Variable",
                  frequency: "Selon prescription",
                  startDate: new Date(
                    new Date().getTime() - 30 * 24 * 60 * 60 * 1000
                  ),
                  notes: "Suivi régulier requis",
                },
              ],
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

      // Ajouter signes vitaux
      console.log("   📊 Ajout de signes vitaux...");
      const vitals = patientData.vitals;

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

      // Créer alertes
      console.log("   🚨 Création des alertes...");
      let alertCount = 0;

      for (const alertData of patientData.alerts) {
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

      // Ajouter note de docteur
      if (patientUser.patient) {
        await prisma.doctorNote.create({
          data: {
            patientId: patientUser.patient.id,
            doctorId: cardioDoctor.id,
            note: `Suivi initial du patient pour ${patientUser.patient.diagnosis}. 
Signes vitaux anormaux détectés. Recommandations:
1. Augmenter la fréquence de monitoring
2. Ajouter des tests cardiaques appropriés
3. Revoir le plan de traitement`,
          },
        });

        console.log("   📝 Note de docteur ajoutée");
      }
    }

    // ============================================
    // 4. CRÉER DES ACCESSGRANT
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
    // 5. RÉSUMÉ FINAL
    // ============================================
    console.log("\n" + "=".repeat(70));
    console.log("✨ ÉCOSYSTÈME CARDIOLOGIE CRÉÉ AVEC SUCCÈS!");
    console.log("=".repeat(70));

    console.log("\n🔐 IDENTIFIANTS DE CONNEXION:");
    console.log("\n📋 DOCTEUR CARDIOLOGUE:");
    console.log(`   📧 Email: dr.martin.leclerc@hosp.fr`);
    console.log(`   🔑 Mot de passe: Cardio@123456`);

    console.log("\n👥 PATIENTS CRÉÉS:");
    createdPatients.forEach((patient, index) => {
      console.log(`   ${index + 1}. ${patient.firstName} ${patient.lastName}`);
      console.log(`      📧 ${patient.email}`);
      console.log(`      🔑 Cardio@123456`);
    });

    console.log("\n📊 STATISTIQUES:");
    console.log(`   • Patients: ${createdPatients.length}`);
    console.log(`   • Docteur: 1`);
    console.log(
      `   • Alertes: ${patientsData.reduce((sum, p) => sum + (p.alerts?.length || 0), 0)}`
    );

    console.log("\n📝 INSTRUCTIONS DE TEST:");
    console.log("   1. Lancez npm run dev");
    console.log(
      "   2. Connectez-vous: dr.martin.leclerc@hosp.fr / Cardio@123456"
    );
    console.log(
      "   3. Allez à http://localhost:3000/dashboard/doctor/patients"
    );
    console.log("   4. Les 4 patients devraient s'afficher avec leurs alertes");

    console.log("\n✅ Test prêt!\n");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCardioDemo();

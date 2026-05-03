#!/usr/bin/env node
/**
 * Script pour ajouter des analyses médicales au patient cardiaque de test
 * Usage: npm run test:cardio-analyses
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addCardioAnalyses() {
  try {
    console.log("🏥 Ajout d'analyses cardiologiques au patient test...\n");

    // Trouver le patient cardiaque créé précédemment
    const patient = await prisma.patient.findFirst({
      where: {
        user: {
          email: "patient.cardio@test.health",
        },
      },
      include: {
        user: true,
      },
    });

    if (!patient) {
      console.error(
        "❌ Patient cardiaque non trouvé. Assurez-vous d'avoir exécuté 'npm run test:cardio' d'abord."
      );
      process.exit(1);
    }

    console.log(
      `✅ Patient trouvé: ${patient.user.firstName} ${patient.user.lastName}\n`
    );

    const analyses = [
      {
        testName: "Électrocardiogramme (ECG) au repos",
        analysisType: "ECG",
        results: {
          frequency: "72 bpm",
          prInterval: "120ms",
          qrsComplex: "80ms",
          qtInterval: "400ms",
          rhythm: "Régulier",
          interpretation: "Légère arythmie détectée",
        },
        resultSummary:
          "Électrocardiogramme montrant une légère irrégularité du rythme cardiaque. Recommandation: suivi au Holter ECG.",
        laboratory: "Laboratoire Central - Paris",
        status: "COMPLETED",
        isAbnormal: true,
        doctorNotes: "Patient arythmique, nécessite un suivi continu.",
      },
      {
        testName: "Test d'effort cardiaque (Épreuve d'effort)",
        analysisType: "SPIROMETRY",
        results: {
          initialHeartRate: "68 bpm",
          maxHeartRate: "145 bpm",
          recoveryTime: "3 minutes",
          ejectionFraction: "55%",
          stressLevel: "Modérée",
        },
        resultSummary:
          "Tolérance modérée à l'effort avec bonne récupération. Capacité cardiaque conservée.",
        laboratory: "Clinique Cardiologique Paris-Ouest",
        status: "COMPLETED",
        isAbnormal: false,
        doctorNotes: "Excellente compliance du patient à l'exercice.",
      },
      {
        testName: "Échocardiogramme",
        analysisType: "ECHOCARDIOGRAPHY",
        results: {
          leftVentricleSize: "51mm",
          ejectionFraction: "58%",
          wallThickness: "10mm",
          mitralValve: "Normal",
          aorticValve: "Normal",
          tricuspidValve: "Normal",
        },
        resultSummary:
          "Échocardiogramme normal. Fonction cardiaque conservée. Valves normales.",
        laboratory: "Clinique Cardiologique Paris-Ouest",
        status: "COMPLETED",
        isAbnormal: false,
        doctorNotes:
          "Structure cardiaque normale, pas de signe d'insuffisance cardiaque.",
      },
      {
        testName: "Holter 24h (ECG ambulatoire)",
        analysisType: "ECG",
        results: {
          totalEpisodes: "47",
          maxHeartRate: "152 bpm",
          minHeartRate: "48 bpm",
          arrhythmiaType: "Arythmie supraventriculaire paroxystique",
          pausesDetected: "3",
          pauseDuration: "2.8 secondes",
        },
        resultSummary:
          "Détection de 47 épisodes d'arythmie supraventriculaire durant 24 heures. Pas de pauses significatives.",
        laboratory: "Laboratoire Cardiologie Avancée",
        status: "COMPLETED",
        isAbnormal: true,
        doctorNotes:
          "Indiquer la prescription d'un antiarythmique. Suivi mensuel par Holter.",
      },
      {
        testName: "Troponine et BNP (Marqueurs cardiaques)",
        analysisType: "BLOOD_TEST",
        results: {
          troponinI: "0.02 ng/mL",
          bnp: "180 pg/mL",
          cTroponin: "Négatif",
          myoglobin: "85 µg/L",
        },
        resultSummary:
          "Marqueurs cardiaques légèrement élevés. Pas de signe d'infarctus aigu. BNP modérément élevé.",
        laboratory: "Laboratoire Central - Paris",
        status: "COMPLETED",
        isAbnormal: true,
        doctorNotes:
          "Résultats suggestifs d'une légère insuffisance cardiaque. Réévaluer avec échocardiogramme.",
      },
      {
        testName: "Radiographie thoracique",
        analysisType: "IMAGING_XRAY",
        results: {
          cardioThoracicRatio: "0.52",
          pulmonaryVascularization: "Normal",
          pleuralEffusion: "Absent",
          consolidations: "Absent",
        },
        resultSummary:
          "Radiographie thoracique normale. Silhouette cardiaque normale.",
        laboratory: "Imagerie Médicale Paris",
        status: "COMPLETED",
        isAbnormal: false,
        doctorNotes: "Pas d'anomalies détectées sur la radiographie.",
      },
    ];

    console.log(`📊 Ajout de ${analyses.length} analyses...\n`);

    const now = new Date();
    let addedCount = 0;

    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i];
      const analysisDate = new Date(
        now.getTime() - (analyses.length - i) * 24 * 60 * 60 * 1000 // Spread over days
      );

      const createdAnalysis = await prisma.medicalAnalysis.create({
        data: {
          patientId: patient.id,
          analysisType: analysis.analysisType as any,
          testName: analysis.testName,
          results: analysis.results,
          resultSummary: analysis.resultSummary,
          laboratory: analysis.laboratory,
          analysisDate: analysisDate,
          status: analysis.status as any,
          isAbnormal: analysis.isAbnormal,
          doctorNotes: analysis.doctorNotes,
        },
      });

      console.log(`   ✅ ${analysis.testName} - ${createdAnalysis.status}`);
      addedCount++;
    }

    console.log(`\n✨ ${addedCount} analyses ajoutées avec succès!\n`);

    console.log("=".repeat(60));
    console.log("📊 ANALYSES CARDIOLOGIQUES CRÉÉES");
    console.log("=".repeat(60));

    console.log("\n🔐 Données de test:");
    console.log(
      `   Patient: ${patient.user.firstName} ${patient.user.lastName}`
    );
    console.log(`   Email: patient.cardio@test.health`);
    console.log(`   Nombre d'analyses: ${addedCount}`);

    console.log("\n📝 Types d'analyses ajoutées:");
    analyses.forEach((a) => {
      console.log(
        `   • ${a.testName} (${a.analysisType}) - ${a.isAbnormal ? "⚠️  Anormal" : "✓ Normal"}`
      );
    });

    console.log("\n🧪 Comment visualiser:");
    console.log("   1. Connectez-vous avec le docteur cardiologue");
    console.log("      Email: dr.cardio@test.health");
    console.log("      Mot de passe: TestCardio@123");
    console.log("   2. Allez à /dashboard/doctor/analytics");
    console.log("   3. Faites défiler jusqu'à la table des analyses");
    console.log("   4. Vous verrez toutes les analyses du patient cardiaque");

    console.log("\n✅ Prêt pour tester! Lancez: npm run dev\n");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addCardioAnalyses();

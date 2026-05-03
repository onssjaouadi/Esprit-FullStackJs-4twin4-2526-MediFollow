const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createCardiacAlerts() {
  try {
    // Get the patient with ID from URL
    const patientId = "69d59d8a692bfd0e917ecca0";

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      console.error(`Patient not found with ID: ${patientId}`);
      return;
    }

    console.log(
      `Found patient: ${patient.user.firstName} ${patient.user.lastName}`
    );
    console.log(`Diagnosis: ${patient.diagnosis}`);

    // Create cardiac-related alerts (one at a time to be safer)
    const cardiaceAlerts = [
      {
        patientId,
        alertType: "VITAL",
        severity: "CRITICAL",
        message: "Fréquence cardiaque élevée détectée: 115 bpm",
        data: {
          vitalType: "heartRate",
          value: 115,
          normalRange: "60-100",
          unit: "bpm",
        },
        status: "OPEN",
      },
      {
        patientId,
        alertType: "VITAL",
        severity: "HIGH",
        message: "Pression artérielle systolique anormale: 160 mmHg",
        data: {
          vitalType: "systolicBP",
          value: 160,
          normalRange: "90-120",
          unit: "mmHg",
        },
        status: "OPEN",
      },
      {
        patientId,
        alertType: "VITAL",
        severity: "MEDIUM",
        message: "Pression artérielle diastolique légèrement élevée: 98 mmHg",
        data: {
          vitalType: "diastolicBP",
          value: 98,
          normalRange: "60-80",
          unit: "mmHg",
        },
        status: "OPEN",
      },
      {
        patientId,
        alertType: "SYMPTOM",
        severity: "HIGH",
        message: "Arythmie cardiaque détectée - suivi ECG recommandé",
        data: {
          symptomNote: "Irrégularités observées dans le rythme cardiaque",
          recommendedAction: "ECG supplémentaire",
        },
        status: "OPEN",
      },
      {
        patientId,
        alertType: "MEDICATION",
        severity: "MEDIUM",
        message: "Vérifier l'adhérence au traitement antihypertenseur",
        data: {
          medicationName: "Antihypertenseur",
          note: "Tension artérielle incontrôlée",
        },
        status: "OPEN",
      },
      {
        patientId,
        alertType: "VITAL",
        severity: "MEDIUM",
        message: "Saturation en oxygène légèrement basse: 94%",
        data: {
          vitalType: "oxygenSaturation",
          value: 94,
          normalRange: ">95",
          unit: "%",
        },
        status: "OPEN",
      },
    ];

    // Create alerts one by one
    let count = 0;
    for (const alertData of cardiaceAlerts) {
      try {
        await prisma.alert.create({
          data: alertData,
        });
        count++;
      } catch (err) {
        console.error(
          `Failed to create alert: ${alertData.message}`,
          err.message
        );
      }
    }

    console.log(`\n✅ ${count} alertes cardiaques créées pour le patient`);
    console.log("\nAlertes créées:");
    cardiaceAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. [${alert.severity}] ${alert.message}`);
    });
  } catch (error) {
    console.error("Error creating alerts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createCardiacAlerts();

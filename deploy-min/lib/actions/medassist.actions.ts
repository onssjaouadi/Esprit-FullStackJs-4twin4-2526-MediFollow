"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth.actions";

/**
 * Get medical context for a specific patient
 * Returns comprehensive medical data for AI assistant
 */
export async function getPatientMedicalContext(patientId: string) {
  try {
    // Verify user is a doctor
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "DOCTOR") {
      return {
        success: false,
        error: "Accès non autorisé",
      };
    }

    // Get patient with all related data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 10, // Last 10 vital records
        },
        symptoms: {
          orderBy: { occurredAt: "desc" },
          take: 5, // Last 5 symptoms
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 10, // Last 10 alerts
          include: {
            acknowledgedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            resolvedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient non trouvé",
      };
    }

    // Format medical context for AI
    const medicalContext = {
      patient: {
        nom: `${patient.user.firstName} ${patient.user.lastName}`,
        age: calculateAge(patient.dateOfBirth),
        dateNaissance: patient.dateOfBirth.toLocaleDateString("fr-FR"),
        sexe:
          patient.gender === "MALE"
            ? "Masculin"
            : patient.gender === "FEMALE"
              ? "Feminin"
              : "Autre",
        groupeSanguin: patient.bloodType || "Non renseigné",
        numeroDossier: patient.medicalRecordNumber,
        diagnostic: patient.diagnosis || "Non renseigné",
        dateSortie: patient.dischargeDate
          ? patient.dischargeDate.toLocaleDateString("fr-FR")
          : "Non renseigné",
      },
      traitements: patient.medications.map((med) => ({
        nom: med.name,
        dosage: med.dosage,
        frequence: med.frequency,
        dateDebut: new Date(med.startDate).toLocaleDateString("fr-FR"),
        dateFin: med.endDate
          ? new Date(med.endDate).toLocaleDateString("fr-FR")
          : "En cours",
        notes: med.notes || "",
      })),
      signesVitaux: patient.vitalRecords.map((vital) => ({
        date: vital.recordedAt.toLocaleDateString("fr-FR"),
        heure: vital.recordedAt.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        tensionSystolique: vital.systolicBP || null,
        tensionDiastolique: vital.diastolicBP || null,
        frequenceCardiaque: vital.heartRate || null,
        temperature: vital.temperature || null,
        saturationOxygene: vital.oxygenSaturation || null,
        poids: vital.weight || null,
        notes: vital.notes || "",
      })),
      symptomes: patient.symptoms.map((symptom) => ({
        date: symptom.occurredAt.toLocaleDateString("fr-FR"),
        type: symptom.symptomType,
        severite: symptom.severity,
        description: symptom.description,
      })),
      alertes: patient.alerts.map((alert) => ({
        date: alert.createdAt.toLocaleDateString("fr-FR"),
        type: alert.alertType,
        severite: alert.severity,
        statut: alert.status,
        message: alert.message,
        acquittePar: alert.acknowledgedBy
          ? `${alert.acknowledgedBy.firstName} ${alert.acknowledgedBy.lastName}`
          : null,
        resoluPar: alert.resolvedBy
          ? `${alert.resolvedBy.firstName} ${alert.resolvedBy.lastName}`
          : null,
        resolution: alert.resolution || null,
      })),
      seuils: patient.vitalThresholds
        ? {
            tensionSystolique: `${patient.vitalThresholds.systolicBP.min}-${patient.vitalThresholds.systolicBP.max} mmHg`,
            tensionDiastolique: `${patient.vitalThresholds.diastolicBP.min}-${patient.vitalThresholds.diastolicBP.max} mmHg`,
            frequenceCardiaque: `${patient.vitalThresholds.heartRate.min}-${patient.vitalThresholds.heartRate.max} bpm`,
            temperature: `${patient.vitalThresholds.temperature.min}-${patient.vitalThresholds.temperature.max} °C`,
            saturationOxygene: `${patient.vitalThresholds.oxygenSaturation.min}-${patient.vitalThresholds.oxygenSaturation.max} %`,
          }
        : null,
      allergie: patient.emergencyContact
        ? {
            nom: patient.emergencyContact.name,
            relation: patient.emergencyContact.relationship,
            telephone: patient.emergencyContact.phoneNumber,
          }
        : null,
    };

    return {
      success: true,
      context: medicalContext,
    };
  } catch (error) {
    console.error("Error getting patient medical context:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du contexte médical",
    };
  }
}

/**
 * Get list of all patients for doctor (for AI context selection)
 */
export async function getDoctorPatientsList() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "DOCTOR") {
      return {
        success: false,
        error: "Accès non autorisé",
      };
    }

    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        alerts: {
          where: { status: "OPEN" },
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const patientsList = patients.map((patient) => ({
      id: patient.id,
      nom: `${patient.user.firstName} ${patient.user.lastName}`,
      numeroDossier: patient.medicalRecordNumber,
      alertesActives: patient.alerts.length,
    }));

    return {
      success: true,
      patients: patientsList,
    };
  } catch (error) {
    console.error("Error getting doctor patients list:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de la liste des patients",
    };
  }
}

/**
 * Helper function to calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

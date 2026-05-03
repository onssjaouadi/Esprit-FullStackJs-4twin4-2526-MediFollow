"use server";

import prisma from "@/lib/prisma";
import { SYMPTOM_TYPES } from "@/lib/utils/symptom-utils";

export type SeverityLevel = "MILD" | "MODERATE" | "SEVERE";

/**
 * Create a new symptom record
 */
export async function createSymptom(
  patientId: string,
  symptomType: string,
  severity: SeverityLevel,
  description?: string
) {
  try {
    if (!patientId) {
      return {
        success: false,
        error: "ID patient requis",
      };
    }

    if (!symptomType) {
      return {
        success: false,
        error: "Type de symptôme requis",
      };
    }

    if (!severity) {
      return {
        success: false,
        error: "Sévérité requise",
      };
    }

    const symptom = await prisma.symptom.create({
      data: {
        patientId,
        symptomType,
        severity: severity as any,
        description: description || "",
        occurredAt: new Date(),
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      success: true,
      symptom,
    };
  } catch (error: any) {
    console.error("❌ Erreur création symptôme:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la création du symptôme",
    };
  }
}

/**
 * Get patient symptoms
 */
export async function getPatientSymptoms(
  patientId: string,
  limit: number = 20
) {
  try {
    const symptoms = await prisma.symptom.findMany({
      where: { patientId },
      orderBy: { occurredAt: "desc" },
      take: limit,
    });

    return {
      success: true,
      symptoms,
    };
  } catch (error: any) {
    console.error("❌ Erreur récupération symptômes:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get recent symptoms for patient (last 7 days)
 */
export async function getRecentSymptoms(patientId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const symptoms = await prisma.symptom.findMany({
      where: {
        patientId,
        occurredAt: { gte: sevenDaysAgo },
      },
      orderBy: { occurredAt: "desc" },
    });

    return {
      success: true,
      symptoms,
      count: symptoms.length,
    };
  } catch (error: any) {
    console.error("❌ Erreur:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a symptom
 */
export async function deleteSymptom(symptomId: string) {
  try {
    await prisma.symptom.delete({
      where: { id: symptomId },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Erreur suppression symptôme:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

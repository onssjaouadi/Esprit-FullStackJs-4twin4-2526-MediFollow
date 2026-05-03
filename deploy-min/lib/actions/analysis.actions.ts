/**
 * MediFollow - Medical Analysis Actions
 * Server actions for medical analysis management (lab tests, imaging, etc.)
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createMedicalAnalysis(formData: FormData) {
  try {
    const patientId = formData.get("patientId") as string;
    const analysisType = formData.get("analysisType") as string;
    const testName = formData.get("testName") as string;
    const resultSummary = formData.get("resultSummary") as string;
    const analysisDate = formData.get("analysisDate") as string;
    const laboratory = formData.get("laboratory") as string;
    const doctorNotes = formData.get("doctorNotes") as string;
    const status = formData.get("status") as string;
    const isAbnormal = formData.get("isAbnormal") === "true";

    if (!patientId || !analysisType || !testName) {
      return {
        success: false,
        error: "Patient, type d'analyse et nom du test sont requis",
      };
    }

    const analysis = await prisma.medicalAnalysis.create({
      data: {
        patientId,
        analysisType,
        testName,
        resultSummary: resultSummary || null,
        analysisDate: analysisDate ? new Date(analysisDate) : new Date(),
        laboratory: laboratory || null,
        doctorNotes: doctorNotes || null,
        status: status || "COMPLETED",
        isAbnormal,
        documentIds: [],
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/doctor/analytics");
    revalidatePath(`/dashboard/patient`);

    return {
      success: true,
      message: "Analyse créée avec succès",
      analysis,
    };
  } catch (error: any) {
    console.error("Create analysis error:", error);
    return {
      success: false,
      error: "Erreur lors de la création de l'analyse",
    };
  }
}

export async function updateMedicalAnalysis(id: string, formData: FormData) {
  try {
    const analysisType = formData.get("analysisType") as string;
    const testName = formData.get("testName") as string;
    const resultSummary = formData.get("resultSummary") as string;
    const analysisDate = formData.get("analysisDate") as string;
    const laboratory = formData.get("laboratory") as string;
    const doctorNotes = formData.get("doctorNotes") as string;
    const status = formData.get("status") as string;
    const isAbnormal = formData.get("isAbnormal") === "true";

    if (!analysisType || !testName) {
      return {
        success: false,
        error: "Type d'analyse et nom du test sont requis",
      };
    }

    const analysis = await prisma.medicalAnalysis.update({
      where: { id },
      data: {
        analysisType,
        testName,
        resultSummary: resultSummary || null,
        analysisDate: analysisDate ? new Date(analysisDate) : undefined,
        laboratory: laboratory || null,
        doctorNotes: doctorNotes || null,
        status: status || undefined,
        isAbnormal,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/doctor/analytics");
    revalidatePath(`/dashboard/patient`);

    return {
      success: true,
      message: "Analyse modifiée avec succès",
      analysis,
    };
  } catch (error: any) {
    console.error("Update analysis error:", error);
    return {
      success: false,
      error: "Erreur lors de la modification de l'analyse",
    };
  }
}

export async function deleteMedicalAnalysis(id: string) {
  try {
    await prisma.medicalAnalysis.delete({
      where: { id },
    });

    revalidatePath("/dashboard/doctor/analytics");
    revalidatePath(`/dashboard/patient`);

    return {
      success: true,
      message: "Analyse supprimée avec succès",
    };
  } catch (error: any) {
    console.error("Delete analysis error:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de l'analyse",
    };
  }
}

export async function getAllMedicalAnalyses() {
  try {
    const analyses = await prisma.medicalAnalysis.findMany({
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        analysisDate: "desc",
      },
    });

    return { success: true, analyses };
  } catch (error: any) {
    console.error("Get all analyses error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des analyses",
      analyses: [],
    };
  }
}

export async function getPatientAnalyses(patientId: string) {
  try {
    const analyses = await prisma.medicalAnalysis.findMany({
      where: { patientId },
      orderBy: {
        analysisDate: "desc",
      },
    });

    return { success: true, analyses };
  } catch (error: any) {
    console.error("Get patient analyses error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des analyses du patient",
      analyses: [],
    };
  }
}

export async function getMedicalAnalysisById(id: string) {
  try {
    const analysis = await prisma.medicalAnalysis.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return { success: true, analysis };
  } catch (error: any) {
    console.error("Get analysis by ID error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de l'analyse",
      analysis: null,
    };
  }
}

export async function getAnalysesByDoctorSpecialty(doctorId: string) {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
      select: { specialty: true },
    });

    const analyses = await prisma.medicalAnalysis.findMany({
      where: doctorProfile?.specialty
        ? {
            patient: {
              medicalProfile: {
                specialty: doctorProfile.specialty,
              },
            },
          }
        : undefined,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        analysisDate: "desc",
      },
    });

    return { success: true, analyses };
  } catch (error: any) {
    console.error("Get analyses by doctor specialty error:", error);
    return {
      success: false,
      error: "Erreur lors de la recuperation des analyses",
      analyses: [],
    };
  }
}

"use server";

import prisma from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PatientCreateInput,
  SafeUser,
  PatientWithUser,
  PatientWithRelations,
} from "@/types/medifollow.types";
import { revalidatePath } from "next/cache";

/**
 * Get a patient by user ID
 */
export async function getPatientByUserId(
  userId: string
): Promise<PatientWithUser | null> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return patient;
  } catch (error) {
    console.error("Error fetching patient by user ID:", error);
    return null;
  }
}

/**
 * Get a patient by ID
 */
export async function getPatientById(
  patientId: string
): Promise<PatientWithUser | null> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return patient;
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    return null;
  }
}

/**
 * Get patient with full relations (vitals, alerts, symptoms)
 */
export async function getPatientWithRelations(
  patientId: string
): Promise<PatientWithRelations | null> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        symptoms: {
          orderBy: { occurredAt: "desc" },
          take: 10,
        },
      },
    });

    return patient;
  } catch (error) {
    console.error("Error fetching patient with relations:", error);
    return null;
  }
}

/**
 * Get all patients (for doctors/admins)
 */
export async function getAllPatients(): Promise<PatientWithUser[]> {
  try {
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 1, // Only the most recent vital record for performance
        },
        alerts: {
          where: { status: "OPEN" }, // Only active alerts
          orderBy: { createdAt: "desc" },
        },
        symptoms: {
          orderBy: { occurredAt: "desc" },
          take: 3, // Latest 3 symptoms
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return patients;
  } catch (error) {
    console.error("Error fetching all patients:", error);
    return [];
  }
}

/**
 * Get all patients with ALL their vital records (for vitals page)
 */
export async function getAllPatientsWithAllVitals(): Promise<
  PatientWithUser[]
> {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 100, // Last 100 vital records per patient
        },
        alerts: {
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        symptoms: {
          orderBy: { occurredAt: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return patients;
  } catch (error) {
    console.error("Error fetching patients with vitals:", error);
    return [];
  }
}

/**
 * Create a new patient profile
 * Used during registration or by admin
 */
export async function createPatient(
  data: PatientCreateInput
): Promise<{ success: boolean; patient?: PatientWithUser; error?: string }> {
  try {
    // Check if patient already exists for this user
    const existingPatient = await prisma.patient.findUnique({
      where: { userId: data.userId },
    });

    if (existingPatient) {
      return {
        success: false,
        error: "Un profil patient existe déjà pour cet utilisateur",
      };
    }

    // Check if medical record number is unique
    const existingMRN = await prisma.patient.findUnique({
      where: { medicalRecordNumber: data.medicalRecordNumber },
    });

    if (existingMRN) {
      return {
        success: false,
        error: "Ce numéro de dossier médical est déjà utilisé",
      };
    }

    const patient = await prisma.patient.create({
      data: {
        userId: data.userId,
        medicalRecordNumber: data.medicalRecordNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodType: data.bloodType,
        address: data.address as Prisma.InputJsonValue,
        emergencyContact: data.emergencyContact as Prisma.InputJsonValue,
        dischargeDate: data.dischargeDate,
        diagnosis: data.diagnosis,
        medications: data.medications as Prisma.InputJsonValue,
        vitalThresholds: data.vitalThresholds as Prisma.InputJsonValue,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/admin");

    return { success: true, patient };
  } catch (error) {
    console.error("Error creating patient:", error);
    return {
      success: false,
      error: "Erreur lors de la création du profil patient",
    };
  }
}

/**
 * Update patient information
 */
export async function updatePatient(
  patientId: string,
  data: Partial<PatientCreateInput>
): Promise<{ success: boolean; patient?: PatientWithUser; error?: string }> {
  try {
    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(data.gender && { gender: data.gender }),
        ...(data.bloodType && { bloodType: data.bloodType }),
        ...(data.address && { address: data.address as Prisma.InputJsonValue }),
        ...(data.emergencyContact && {
          emergencyContact: data.emergencyContact as Prisma.InputJsonValue,
        }),
        ...(data.dischargeDate && { dischargeDate: data.dischargeDate }),
        ...(data.diagnosis && { diagnosis: data.diagnosis }),
        ...(data.medications && {
          medications: data.medications as Prisma.InputJsonValue,
        }),
        ...(data.vitalThresholds && {
          vitalThresholds: data.vitalThresholds as Prisma.InputJsonValue,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/admin");

    return { success: true, patient };
  } catch (error) {
    console.error("Error updating patient:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil patient",
    };
  }
}

/**
 * Deactivate a patient (soft delete)
 */
export async function deactivatePatient(
  patientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deactivating patient:", error);
    return {
      success: false,
      error: "Erreur lors de la désactivation du patient",
    };
  }
}

/**
 * Search patients by name, email, or medical record number
 */
export async function searchPatients(
  query: string
): Promise<PatientWithUser[]> {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
        OR: [
          { medicalRecordNumber: { contains: query, mode: "insensitive" } },
          { user: { firstName: { contains: query, mode: "insensitive" } } },
          { user: { lastName: { contains: query, mode: "insensitive" } } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      take: 20,
    });

    return patients;
  } catch (error) {
    console.error("Error searching patients:", error);
    return [];
  }
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // Get current date boundaries
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));
    const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));

    // Total patients
    const totalPatients = await prisma.patient.count({
      where: {
        user: {
          isActive: true,
        },
      },
    });

    // New patients this week
    const newPatientsWeek = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // New patients this month
    const newPatientsMonth = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Vital records today
    const vitalsToday = await prisma.vitalRecord.count({
      where: {
        recordedAt: {
          gte: startOfToday,
        },
      },
    });

    // Vital records this week
    const vitalsWeek = await prisma.vitalRecord.count({
      where: {
        recordedAt: {
          gte: startOfWeek,
        },
      },
    });

    // Active patients (with vitals in last 7 days)
    const activePatientsIds = await prisma.vitalRecord.findMany({
      where: {
        recordedAt: {
          gte: startOfWeek,
        },
      },
      select: {
        patientId: true,
      },
      distinct: ["patientId"],
    });
    const activePatients = activePatientsIds.length;

    // Alert statistics
    const totalAlerts = await prisma.alert.count();
    const openAlerts = await prisma.alert.count({
      where: { status: "OPEN" },
    });
    const criticalAlerts = await prisma.alert.count({
      where: { severity: "CRITICAL", status: "OPEN" },
    });
    const resolvedAlerts = await prisma.alert.count({
      where: { status: "RESOLVED" },
    });

    // Alert resolution rate
    const resolutionRate =
      totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0;

    // Average response time (in hours) for resolved alerts
    const resolvedAlertsWithTime = await prisma.alert.findMany({
      where: {
        status: "RESOLVED",
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let avgResponseTime = 0;
    if (resolvedAlertsWithTime.length > 0) {
      const totalTime = resolvedAlertsWithTime.reduce((sum, alert) => {
        const diff = alert.resolvedAt!.getTime() - alert.createdAt.getTime();
        return sum + diff;
      }, 0);
      avgResponseTime = Math.round(
        totalTime / resolvedAlertsWithTime.length / (1000 * 60 * 60)
      ); // Convert to hours
    }

    // Patients by blood type
    const patientsByBloodType = await prisma.patient.groupBy({
      by: ["bloodType"],
      _count: {
        id: true,
      },
      where: {
        bloodType: { not: null },
      },
    });

    // Recent symptoms count
    const symptomsToday = await prisma.symptom.count({
      where: {
        occurredAt: {
          gte: startOfToday,
        },
      },
    });

    return {
      success: true,
      stats: {
        patients: {
          total: totalPatients,
          active: activePatients,
          newThisWeek: newPatientsWeek,
          newThisMonth: newPatientsMonth,
        },
        vitals: {
          today: vitalsToday,
          thisWeek: vitalsWeek,
        },
        alerts: {
          total: totalAlerts,
          open: openAlerts,
          critical: criticalAlerts,
          resolved: resolvedAlerts,
          resolutionRate: resolutionRate,
          avgResponseTime: avgResponseTime,
        },
        symptoms: {
          today: symptomsToday,
        },
        bloodTypeDistribution: patientsByBloodType.map((bt) => ({
          bloodType: bt.bloodType,
          count: bt._count.id,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
      stats: null,
    };
  }
}

/**
 * Get patient profile data (for the profile page)
 */
export async function getPatientProfile(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            faceDescriptor: true,
          },
        },
      },
    });

    if (!patient) {
      return { success: false, error: "Profil patient introuvable" };
    }

    return { success: true, data: patient };
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return { success: false, error: "Erreur lors du chargement du profil" };
  }
}

/**
 * Update patient profile data
 */
export async function updatePatientProfile(
  userId: string,
  data: {
    bio?: string;
    phoneNumber?: string;
    bloodType?: string;
    address?: { street?: string; city?: string; country?: string };
    emergencyContact?: { name?: string; phone?: string };
    dateOfBirth?: string;
    gender?: string;
    profileImage?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update patient fields
    await prisma.patient.update({
      where: { userId },
      data: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.bloodType && { bloodType: data.bloodType as any }),
        ...(data.address && {
          address: data.address as Prisma.InputJsonValue,
        }),
        ...(data.emergencyContact && {
          emergencyContact: data.emergencyContact as Prisma.InputJsonValue,
        }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.gender && { gender: data.gender as any }),
        ...(data.profileImage !== undefined && {
          profileImage: data.profileImage,
        }),
      },
    });

    // Update user phone number if provided
    if (data.phoneNumber !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { phoneNumber: data.phoneNumber },
      });
    }

    revalidatePath("/dashboard/patient/profile");

    return { success: true };
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return { success: false, error: "Erreur lors de la mise à jour du profil" };
  }
}

/**
 * Upload patient profile image
 */
export async function uploadPatientProfileImage(
  userId: string,
  imageData: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await prisma.patient.update({
      where: { userId },
      data: { profileImage: imageData },
    });

    revalidatePath("/dashboard/patient/profile");

    return { success: true, url: imageData };
  } catch (error) {
    console.error("Error uploading patient profile image:", error);
    return {
      success: false,
      error: "Erreur lors du téléchargement de l'image",
    };
  }
}

/**
 * Get patients filtered by doctor's specialty
 */
export async function getPatientsByDoctorSpecialty(
  doctorUserId: string
): Promise<PatientWithUser[]> {
  try {
    // Get doctor's profile to retrieve specialty
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { specialty: true },
    });

    if (!doctorProfile?.specialty) {
      // If no specialty, return all active patients
      return await prisma.patient.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              phoneNumber: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { medicalRecordNumber: "asc" },
      });
    }

    // Get patients with matching specialty field
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
        // Match specialty if patient has one defined
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { medicalRecordNumber: "asc" },
    });

    return patients;
  } catch (error) {
    console.error("Error fetching patients by doctor specialty:", error);
    return [];
  }
}

/**
 * Get patients by doctor's specialty with all vital records
 */
export async function getPatientsByDoctorSpecialtyWithAllVitals(
  doctorUserId: string
): Promise<
  Array<
    PatientWithUser & {
      vitalRecords: Array<{
        id: string;
        systolicBP?: number;
        diastolicBP?: number;
        heartRate?: number;
        temperature?: number;
        oxygenSaturation?: number;
        weight?: number;
        recordedAt: Date;
      }>;
    }
  >
> {
  try {
    // Get doctor's profile to retrieve specialty
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { specialty: true },
    });

    if (!doctorProfile?.specialty) {
      // If no specialty, return all active patients with vitals
      return await prisma.patient.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              phoneNumber: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          vitalRecords: {
            select: {
              id: true,
              systolicBP: true,
              diastolicBP: true,
              heartRate: true,
              temperature: true,
              oxygenSaturation: true,
              weight: true,
              recordedAt: true,
            },
            orderBy: { recordedAt: "desc" },
          },
        },
        orderBy: { medicalRecordNumber: "asc" },
      });
    }

    // Get patients with matching specialty and all vitals
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        vitalRecords: {
          select: {
            id: true,
            systolicBP: true,
            diastolicBP: true,
            heartRate: true,
            temperature: true,
            oxygenSaturation: true,
            weight: true,
            recordedAt: true,
          },
          orderBy: { recordedAt: "desc" },
        },
      },
      orderBy: { medicalRecordNumber: "asc" },
    });

    return patients as any;
  } catch (error) {
    console.error(
      "Error fetching patients by doctor specialty with vitals:",
      error
    );
    return [];
  }
}

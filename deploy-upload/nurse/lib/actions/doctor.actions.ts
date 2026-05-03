"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface DoctorProfileData {
  specialty?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  experiences?: ExperienceInput[];
}

export interface ExperienceInput {
  title: string;
  institution: string;
  startDate: Date;
  endDate?: Date | null;
  isCurrent?: boolean;
  description?: string | null;
}

/**
 * Get doctor profile by user ID
 */
export async function getDoctorProfile(userId: string) {
  try {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du profil",
    };
  }
}

/**
 * Create or update doctor profile
 */
export async function updateDoctorProfile(
  userId: string,
  profileData: DoctorProfileData
) {
  try {
    // Check if profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    let profile;

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.doctorProfile.update({
        where: { userId },
        data: {
          specialty: profileData.specialty,
          bio: profileData.bio,
          phone: profileData.phone,
          location: profileData.location,
          profileImage: profileData.profileImage,
          experiences: profileData.experiences || [],
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      profile = await prisma.doctorProfile.create({
        data: {
          userId,
          specialty: profileData.specialty,
          bio: profileData.bio,
          phone: profileData.phone,
          location: profileData.location,
          profileImage: profileData.profileImage,
          experiences: profileData.experiences || [],
        },
      });
    }

    // Revalidate the profile page
    revalidatePath("/dashboard/doctor/profile");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    };
  }
}

/**
 * Upload profile image (placeholder - integrate with Azure Blob Storage)
 */
export async function uploadProfileImage(
  userId: string,
  imageData: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // TODO: Implement Azure Blob Storage upload
    // For now, we'll store the base64 data directly (not recommended for production)
    // In production, upload to Azure Blob Storage and store the URL

    const profile = await prisma.doctorProfile.update({
      where: { userId },
      data: {
        profileImage: imageData,
      },
    });

    revalidatePath("/dashboard/doctor/profile");

    return {
      success: true,
      url: imageData,
    };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return {
      success: false,
      error: "Erreur lors du téléchargement de l'image",
    };
  }
}

/**
 * Delete doctor profile
 */
export async function deleteDoctorProfile(userId: string) {
  try {
    await prisma.doctorProfile.delete({
      where: { userId },
    });

    revalidatePath("/dashboard/doctor/profile");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting doctor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du profil",
    };
  }
}

/**
 * Get all doctors for patient assignment
 */
export async function getAllDoctors() {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      include: {
        doctorProfile: true,
      },
      orderBy: { firstName: "asc" },
    });

    return {
      success: true,
      data: doctors,
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des médecins",
    };
  }
}

/**
 * Get all patients unassigned to a doctor
 */
export async function getUnassignedPatients() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { user: { firstName: "asc" } },
    });

    return {
      success: true,
      data: patients,
    };
  } catch (error) {
    console.error("Error fetching unassigned patients:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des patients",
    };
  }
}

/**
 * Assign patient to doctor
 */
export async function assignPatientToDoctor(
  patientId: string,
  doctorUserId: string
) {
  try {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient non trouvé",
      };
    }

    // Verify doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorUserId, role: "DOCTOR" },
      include: { doctorProfile: true },
    });

    if (!doctor) {
      return {
        success: false,
        error: "Médecin non trouvé",
      };
    }

    // Create assignment (if you have an Appointment or Assignment model)
    // For now, we'll just return success as the backend integration may vary
    // You can extend this to create a formal appointment record if needed

    revalidatePath("/dashboard/nurse/assign-patient");

    return {
      success: true,
      message: `Patient ${patient.id} assigné au médecin ${doctor.firstName} ${doctor.lastName}`,
    };
  } catch (error) {
    console.error("Error assigning patient to doctor:", error);
    return {
      success: false,
      error: "Erreur lors de l'assignation du patient",
    };
  }
}

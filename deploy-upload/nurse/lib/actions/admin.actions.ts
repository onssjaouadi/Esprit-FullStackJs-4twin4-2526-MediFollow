"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// ==================== NURSE MANAGEMENT ====================

export async function getAllNurses() {
  try {
    const nurses = await prisma.user.findMany({
      where: { role: "NURSE" },
      include: {
        nurseProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: nurses };
  } catch (error) {
    console.error("Error fetching nurses:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des infirmiers",
    };
  }
}

export async function createNurse(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  department?: string;
  shift?: string;
}) {
  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create nurse user with profile
    const nurse = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: "NURSE",
        isActive: true,
        nurseProfile: {
          create: {
            department: data.department || "",
            shift: data.shift || "morning",
            phone: data.phoneNumber,
          },
        },
      },
      include: {
        nurseProfile: true,
      },
    });

    revalidatePath("/dashboard/admin/nurses");
    return { success: true, data: nurse };
  } catch (error) {
    console.error("Error creating nurse:", error);
    return {
      success: false,
      error: "Erreur lors de la création de l'infirmier",
    };
  }
}

export async function updateNurse(
  nurseId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    department?: string;
    shift?: string;
    isActive?: boolean;
  }
) {
  try {
    const nurse = await prisma.user.findUnique({
      where: { id: nurseId, role: "NURSE" },
      include: { nurseProfile: true },
    });

    if (!nurse) {
      return { success: false, error: "Infirmier non trouvé" };
    }

    // Update user
    const userData: any = {};
    if (data.firstName) userData.firstName = data.firstName;
    if (data.lastName) userData.lastName = data.lastName;
    if (data.phoneNumber) userData.phoneNumber = data.phoneNumber;
    if (data.isActive !== undefined) userData.isActive = data.isActive;

    const updatedNurse = await prisma.user.update({
      where: { id: nurseId },
      data: userData,
      include: { nurseProfile: true },
    });

    // Update nurse profile if exists
    if (
      nurse.nurseProfile &&
      (data.department || data.shift || data.phoneNumber)
    ) {
      const profileData: any = {};
      if (data.department) profileData.department = data.department;
      if (data.shift) profileData.shift = data.shift;
      if (data.phoneNumber) profileData.phone = data.phoneNumber;

      await prisma.nurseProfile.update({
        where: { id: nurse.nurseProfile.id },
        data: profileData,
      });
    }

    revalidatePath("/dashboard/admin/nurses");
    return { success: true, data: updatedNurse };
  } catch (error) {
    console.error("Error updating nurse:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de l'infirmier",
    };
  }
}

export async function deleteNurse(nurseId: string) {
  try {
    // Check if nurse has active assignments
    const assignments = await prisma.nurseAssignment.count({
      where: { nurseId, isActive: true },
    });

    if (assignments > 0) {
      return {
        success: false,
        error: "Impossible de supprimer: l'infirmier a des patients assignés",
      };
    }

    // Delete nurse profile first
    await prisma.nurseProfile.deleteMany({
      where: { userId: nurseId },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: nurseId },
    });

    revalidatePath("/dashboard/admin/nurses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting nurse:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de l'infirmier",
    };
  }
}

// ==================== COORDINATOR MANAGEMENT ====================

export async function getAllCoordinators() {
  try {
    const coordinators = await prisma.user.findMany({
      where: { role: "COORDINATOR" },
      include: {
        coordinatorProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: coordinators };
  } catch (error) {
    console.error("Error fetching coordinators:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des coordinateurs",
    };
  }
}

export async function createCoordinator(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  department?: string;
}) {
  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create coordinator user with profile
    const coordinator = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: "COORDINATOR",
        isActive: true,
        coordinatorProfile: {
          create: {
            department: data.department || "",
            phone: data.phoneNumber,
          },
        },
      },
      include: {
        coordinatorProfile: true,
      },
    });

    revalidatePath("/dashboard/admin/coordinators");
    return { success: true, data: coordinator };
  } catch (error) {
    console.error("Error creating coordinator:", error);
    return {
      success: false,
      error: "Erreur lors de la création du coordinateur",
    };
  }
}

export async function updateCoordinator(
  coordinatorId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    department?: string;
    isActive?: boolean;
  }
) {
  try {
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId, role: "COORDINATOR" },
      include: { coordinatorProfile: true },
    });

    if (!coordinator) {
      return { success: false, error: "Coordinateur non trouvé" };
    }

    // Update user
    const userData: any = {};
    if (data.firstName) userData.firstName = data.firstName;
    if (data.lastName) userData.lastName = data.lastName;
    if (data.phoneNumber) userData.phoneNumber = data.phoneNumber;
    if (data.isActive !== undefined) userData.isActive = data.isActive;

    const updated = await prisma.user.update({
      where: { id: coordinatorId },
      data: userData,
      include: { coordinatorProfile: true },
    });

    // Update coordinator profile
    if (
      coordinator.coordinatorProfile &&
      (data.department || data.phoneNumber)
    ) {
      const profileData: any = {};
      if (data.department) profileData.department = data.department;
      if (data.phoneNumber) profileData.phone = data.phoneNumber;

      await prisma.coordinatorProfile.update({
        where: { id: coordinator.coordinatorProfile.id },
        data: profileData,
      });
    }

    revalidatePath("/dashboard/admin/coordinators");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating coordinator:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du coordinateur",
    };
  }
}

export async function deleteCoordinator(coordinatorId: string) {
  try {
    // Delete coordinator profile first
    await prisma.coordinatorProfile.deleteMany({
      where: { userId: coordinatorId },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: coordinatorId },
    });

    revalidatePath("/dashboard/admin/coordinators");
    return { success: true };
  } catch (error) {
    console.error("Error deleting coordinator:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du coordinateur",
    };
  }
}

// ==================== PATIENT-NURSE ASSIGNMENT ====================

export async function assignPatientToNurse(
  patientId: string,
  nurseId: string,
  adminId: string
) {
  try {
    const assignment = await prisma.nurseAssignment.create({
      data: {
        patientId,
        nurseId,
        assignedBy: adminId,
        isActive: true,
      },
      include: {
        patient: {
          include: { user: true },
        },
        nurse: true,
      },
    } as any);

    revalidatePath("/dashboard/admin/nurses");
    revalidatePath(`/dashboard/nurse/patients`);
    return { success: true, data: assignment };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        error: "Ce patient est déjà assigné à cet infirmier",
      };
    }
    console.error("Error assigning patient:", error);
    return { success: false, error: "Erreur lors de l'assignation du patient" };
  }
}

export async function unassignPatientFromNurse(
  patientId: string,
  nurseId: string
) {
  try {
    await prisma.nurseAssignment.updateMany({
      where: {
        patientId,
        nurseId,
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/dashboard/admin/nurses");
    revalidatePath(`/dashboard/nurse/patients`);
    return { success: true };
  } catch (error) {
    console.error("Error unassigning patient:", error);
    return {
      success: false,
      error: "Erreur lors de la désassignation du patient",
    };
  }
}

export async function getNurseAssignments(nurseId: string) {
  try {
    const assignments = await prisma.nurseAssignment.findMany({
      where: {
        nurseId,
        isActive: true,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      } as any,
      orderBy: { assignedAt: "desc" },
    });

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des assignations",
    };
  }
}

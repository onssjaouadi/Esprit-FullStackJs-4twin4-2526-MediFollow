"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";
import {
  sendDoctorCredentialsEmail,
  sendStaffCredentialsEmail,
  sendPatientApprovalEmail,
  sendPatientBannedEmail,
} from "@/lib/actions/notification.actions";
import crypto from "crypto";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      console.warn(`Skipping revalidatePath in test environment: ${path}`);
    } else {
      throw error;
    }
  }
}

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type RecommendationPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

type PatientRiskData = {
  patientId: string;
  patientName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: string[];
  lastUpdated: Date;
};

type PatientPrediction = {
  patientId: string;
  patientName: string;
  predictions: {
    type: string;
    description: string;
    probability: number;
    timeFrame: string;
    recommendedAction: string;
  }[];
  lastAnalyzed: Date;
};

type Recommendation = {
  priority: RecommendationPriority;
  action: string;
  description: string;
  reason: string;
  confidence: number;
};

type AnomalySeverity = "HIGH" | "MEDIUM" | "LOW";

type Anomaly = {
  type: string;
  severity: AnomalySeverity;
  description: string;
  userId: string;
  userName: string;
  detectedAt: Date;
};

type UserSubmissionSummary = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  count: number;
  timeSpan: number;
};

// ==================== USER MANAGEMENT ====================

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        doctorProfile: true,
        nurseProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: true,
        nurseProfile: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export async function getUserServiceAssignments(userId: string) {
  try {
    const services = await prisma.service.findMany({
      where: {
        OR: [
          { patientIds: { has: userId } },
          { teamIds: { has: userId } },
        ],
      },
      select: {
        id: true,
        serviceName: true,
        specializations: true,
      },
    });

    return { success: true, services };
  } catch (error) {
    console.error("Error getting user service assignments:", error);
    return {
      success: false,
      services: [],
      error: "Failed to load service assignments",
    };
  }
}

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
    const assignments = await (prisma.nurseAssignment.findMany as any)({
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
      },
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

// ==================== HELPER FUNCTIONS ====================

function generateRandomPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  let password = "";
  password += upper.charAt(Math.floor(Math.random() * upper.length));
  password += lower.charAt(Math.floor(Math.random() * lower.length));
  password += digits.charAt(Math.floor(Math.random() * digits.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  for (let i = password.length; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// ==================== PATIENT MANAGEMENT ====================

export async function createUser(data: any) {
  try {
    if (!data.role || !data.email) {
      return { success: false, error: "Role and email are required" };
    }

    if (data.role === "ADMIN") {
      return {
        success: false,
        error: "Creating ADMIN users is not allowed from this interface.",
      };
    }

    // Generate random password for staff roles, use provided password for others
    const staffRoles = ["DOCTOR", "NURSE", "COORDINATOR"];
    const isStaff = staffRoles.includes(data.role);
    const plainPassword = isStaff ? generateRandomPassword() : data.password;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: hashedPassword,
        role: data.role,
        isActive: data.isActive,
        phoneNumber: data.phoneNumber,
      },
    });

    try {
      await pusherServer.trigger("admin-updates", "new-signup", {
        title: "Nouvel utilisateur",
        desc: `${newUser.firstName} ${newUser.lastName} a ete ajoute.`,
        userId: newUser.id,
      });
    } catch (pusherError) {
      console.error("Create user notification error:", pusherError);
    }

    // Send credentials email to staff (doctor, nurse, coordinator)
    let emailSent = false;
    if (staffRoles.includes(data.role)) {
      try {
        const emailResult = await sendStaffCredentialsEmail(
          data.email,
          data.firstName,
          plainPassword,
          data.role
        );
        emailSent = !!emailResult?.success;
        if (!emailSent) {
          console.error("Staff credentials email failed:", emailResult?.error);
        }
      } catch (emailError) {
        console.error("Staff credentials email error:", emailError);
      }
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true, user: newUser, emailSent };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create user",
    };
  }
}

// Get pending (unapproved) patients
export async function getPendingPatients() {
  try {
    const patients = await prisma.patient.findMany({
      where: { isActive: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        questionnaireAssignments: {
          include: {
            template: {
              select: {
                id: true,
                title: true,
                specialty: true,
              },
            },
            responses: {
              orderBy: {
                question: {
                  questionNumber: "asc",
                },
              },
              include: {
                question: {
                  select: {
                    id: true,
                    questionText: true,
                    questionType: true,
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return patients;
  } catch (error) {
    console.error("Error getting pending patients:", error);
    return [];
  }
}

// Approve a patient
export async function approvePatient(patientId: string) {
  try {
    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    // Also activate the user account
    await prisma.user.update({
      where: { id: patient.userId },
      data: { isActive: true },
    });

    try {
      await sendPatientApprovalEmail(
        patient.user.email,
        patient.user.firstName
      );
    } catch (emailError) {
      console.error("Approval email error:", emailError);
    }

    revalidatePath("/admin/pending-patients");
    return { success: true, patient };
  } catch (error) {
    console.error("Error approving patient:", error);
    return { success: false, error: "Failed to approve patient" };
  }
}

// Ban (reject) a patient
export async function banPatient(patientId: string) {
  try {
    // Deactivate the patient and the associated user
    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: { isActive: false },
      include: {
        user: true,
      },
    });

    // Also deactivate the user account
    await prisma.user.update({
      where: { id: patient.userId },
      data: { isActive: false },
    });

    try {
      await sendPatientBannedEmail(patient.user.email, patient.user.firstName);
    } catch (emailError) {
      console.error("Ban email error:", emailError);
    }

    revalidatePath("/admin/pending-patients");
    return { success: true, patient };
  } catch (error) {
    console.error("Error banning patient:", error);
    return { success: false, error: "Failed to ban patient" };
  }
}

/**
 * Get notifications for an admin
 */
export async function getAdminNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/admin/notifications");
    return { success: true, data: notification };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
        isActive: data.isActive,
      },
    });

    safeRevalidatePath("/admin/users");
    safeRevalidatePath(`/admin/users/${userId}`);
    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    safeRevalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

/**
 * Assign a patient to a doctor (via AccessGrant)
 */
export async function assignPatientToDoctor(
  patientUserId: string,
  doctorUserId: string | null
) {
  try {
    if (doctorUserId) {
      await prisma.accessGrant.upsert({
        where: {
          patientId_doctorId: {
            patientId: patientUserId,
            doctorId: doctorUserId,
          },
        },
        update: { isActive: true },
        create: {
          patientId: patientUserId,
          doctorId: doctorUserId,
          isActive: true,
          durationDays: 365,
        },
      });
      // Deactivate other doctor access grants for this patient to ensure 1 primary doctor (if that's the intention)
      await prisma.accessGrant.updateMany({
        where: {
          patientId: patientUserId,
          NOT: { doctorId: doctorUserId }
        },
        data: { isActive: false }
      });
    } else {
      // Remove assigned doctor
      await prisma.accessGrant.updateMany({
        where: { patientId: patientUserId },
        data: { isActive: false }
      });
    }
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error assigning doctor:", error);
    return { success: false, error: "Failed to assign doctor" };
  }
}

export async function getPatientDoctorAssignments() {
  try {
    const grants = await prisma.accessGrant.findMany({
      where: { isActive: true },
      select: {
        patientId: true,
        doctorId: true,
        grantedAt: true,
      },
      orderBy: { grantedAt: "desc" },
    });

    return {
      success: true,
      assignments: grants.map((grant) => ({
        patientId: grant.patientId,
        doctorId: grant.doctorId,
      })),
    };
  } catch (error) {
    console.error("Error fetching patient doctor assignments:", error);
    return {
      success: false,
      assignments: [],
      error: "Failed to fetch doctor assignments",
    };
  }
}

export async function updatePatientPlacement(
  patientUserId: string,
  serviceId: string,
  doctorUserId: string
) {
  try {
    const services = await prisma.service.findMany();

    await Promise.all(
      services.map((service) => {
        const currentPatientIds = Array.isArray(service.patientIds)
          ? service.patientIds
          : [];
        const currentTeamIds = Array.isArray(service.teamIds)
          ? service.teamIds
          : [];

        const nextPatientIds =
          service.id === serviceId
            ? Array.from(new Set([...currentPatientIds, patientUserId]))
            : currentPatientIds.filter((id) => id !== patientUserId);
        const nextTeamIds =
          service.id === serviceId
            ? Array.from(new Set([...currentTeamIds, doctorUserId]))
            : currentTeamIds;

        const patientIdsChanged =
          nextPatientIds.length !== currentPatientIds.length ||
          nextPatientIds.some((id, index) => id !== currentPatientIds[index]);
        const teamIdsChanged =
          nextTeamIds.length !== currentTeamIds.length ||
          nextTeamIds.some((id, index) => id !== currentTeamIds[index]);

        if (!patientIdsChanged && !teamIdsChanged) {
          return Promise.resolve();
        }

        return prisma.service.update({
          where: { id: service.id },
          data: {
            patientIds: nextPatientIds,
            teamIds: nextTeamIds,
          },
        });
      })
    );

    await assignPatientToDoctor(patientUserId, doctorUserId);

    revalidatePath("/admin/users");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error updating patient placement:", error);
    return { success: false, error: "Failed to update patient placement" };
  }
}

export async function getUserPlacementDetails(userId: string) {
  try {
    const [user, services, activeGrant] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { doctorProfile: true },
      }),
      prisma.service.findMany(),
      prisma.accessGrant.findFirst({
        where: { patientId: userId, isActive: true },
        orderBy: { grantedAt: "desc" },
      }),
    ]);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const assignedService = services.find((service) => {
      const ids =
        user.role === "PATIENT" ? service.patientIds : service.teamIds;
      return Array.isArray(ids) ? ids.includes(userId) : false;
    });

    const assignedDoctor = activeGrant?.doctorId
      ? await prisma.user.findUnique({
          where: { id: activeGrant.doctorId },
          select: { id: true, firstName: true, lastName: true, email: true },
        })
      : null;

    return {
      success: true,
      data: {
        service: assignedService
          ? {
              id: assignedService.id,
              serviceName: assignedService.serviceName,
            }
          : null,
        doctor: assignedDoctor
          ? {
              id: assignedDoctor.id,
              label: `${assignedDoctor.firstName} ${assignedDoctor.lastName} (${assignedDoctor.email})`.trim(),
              email: assignedDoctor.email,
            }
          : null,
        doctorProfile: user.doctorProfile
          ? {
              specialty: user.doctorProfile.specialty,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching user placement details:", error);
    return { success: false, error: "Failed to fetch placement details" };
  }
}

export async function updateDoctorPlacement(
  doctorUserId: string,
  serviceId: string,
  specialty: string
) {
  try {
    const normalizedSpecialty = specialty.trim();
    const services = await prisma.service.findMany();

    await Promise.all(
      services.map((service) => {
        const currentTeamIds = Array.isArray(service.teamIds)
          ? service.teamIds
          : [];
        const currentSpecializations = Array.isArray(service.specializations)
          ? service.specializations
          : [];

        const nextTeamIds =
          service.id === serviceId
            ? Array.from(new Set([...currentTeamIds, doctorUserId]))
            : currentTeamIds.filter((id) => id !== doctorUserId);
        const nextSpecializations =
          service.id === serviceId && normalizedSpecialty
            ? Array.from(new Set([...currentSpecializations, normalizedSpecialty]))
            : currentSpecializations;

        const teamIdsChanged =
          nextTeamIds.length !== currentTeamIds.length ||
          nextTeamIds.some((id, index) => id !== currentTeamIds[index]);
        const specializationsChanged =
          nextSpecializations.length !== currentSpecializations.length ||
          nextSpecializations.some(
            (item, index) => item !== currentSpecializations[index]
          );

        if (!teamIdsChanged && !specializationsChanged) {
          return Promise.resolve();
        }

        return prisma.service.update({
          where: { id: service.id },
          data: {
            teamIds: nextTeamIds,
            specializations: nextSpecializations,
          },
        });
      })
    );

    await prisma.doctorProfile.upsert({
      where: { userId: doctorUserId },
      update: { specialty: normalizedSpecialty || null },
      create: {
        userId: doctorUserId,
        specialty: normalizedSpecialty || null,
        experiences: [],
      },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${doctorUserId}`);
    revalidatePath(`/admin/users/${doctorUserId}/edit`);
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor placement:", error);
    return { success: false, error: "Failed to update doctor placement" };
  }
}

export async function getActiveDoctors() {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR", isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return { success: true, data: doctors };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, data: [] };
  }
}

export async function getAssignedDoctorForPatient(patientUserId: string) {
  try {
    const grant = await prisma.accessGrant.findFirst({
      where: { patientId: patientUserId, isActive: true },
    });
    return { success: true, data: grant ? grant.doctorId : null };
  } catch (error) {
    console.error("Error getting assigned doctor:", error);
    return { success: false, data: null };
  }
}

// ==================== AI GLOBAL RISK ORCHESTRATOR ====================

/**
 * Calculate risk score for a patient based on questionnaire responses and medical data
 */
export async function calculatePatientRiskScore(patientId: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        questionnaireAssignments: {
          include: {
            responses: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    let riskScore = 0;
    const riskFactors: string[] = [];

    // Analyze questionnaire responses
    for (const assignment of patient.questionnaireAssignments) {
      for (const response of assignment.responses) {
        const question = response.question;
        const answerText = response.answer ?? "";

        // Simple risk calculation based on question type and response
        if (question.questionType === "SCALE" || question.questionType === "RATING") {
          const value = parseInt(answerText) || 0;
          if (value >= 7) { // High values indicate risk
            riskScore += value * 2;
            riskFactors.push(`${question.questionText}: ${value}/10`);
          } else if (value >= 4) {
            riskScore += value;
          }
        } else if (question.questionType === "MULTIPLE_CHOICE") {
          // Check for critical symptoms
          const criticalSymptoms = ["douleur thoracique", "difficulté respiratoire", "fatigue extrême", "vertiges"];
          const normalizedAnswer = answerText.toLowerCase();
          if (criticalSymptoms.some(symptom => normalizedAnswer.includes(symptom))) {
            riskScore += 15;
            riskFactors.push(`Symptôme critique: ${answerText}`);
          }
        }
      }
    }

    // Check for recent alerts (cardiac-related alerts)
    const recentAlerts = await prisma.alert.count({
      where: {
        patientId,
        alertType: "VITAL", // Using VITAL as proxy for cardiac alerts
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    if (recentAlerts > 0) {
      riskScore += recentAlerts * 10;
      riskFactors.push(`${recentAlerts} alerte(s) cardiaque(s) récente(s)`);
    }

    // Normalize risk score to 0-100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine risk level
    let riskLevel = "LOW";
    if (riskScore >= 70) riskLevel = "CRITICAL";
    else if (riskScore >= 40) riskLevel = "HIGH";
    else if (riskScore >= 20) riskLevel = "MEDIUM";

    return {
      success: true,
      data: {
        patientId,
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        riskScore,
        riskLevel,
        riskFactors,
        lastUpdated: new Date(),
      },
    };
  } catch (error) {
    console.error("Error calculating patient risk:", error);
    return { success: false, error: "Failed to calculate risk score" };
  }
}

/**
 * Get global hospital risk overview
 */
export async function getGlobalHospitalRisk() {
  try {
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    const riskData: PatientRiskData[] = [];
    let totalRiskScore = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;

    for (const patient of patients) {
      const riskResult = await calculatePatientRiskScore(patient.id);
      if (riskResult.success && riskResult.data) {
        const risk = riskResult.data;
        riskData.push(risk as PatientRiskData);
        totalRiskScore += risk.riskScore;

        if (risk.riskLevel === "CRITICAL") criticalCount++;
        else if (risk.riskLevel === "HIGH") highCount++;
        else if (risk.riskLevel === "MEDIUM") mediumCount++;
      }
    }

    const averageRisk = patients.length > 0 ? totalRiskScore / patients.length : 0;

    // Sort by risk score descending
    riskData.sort((a, b) => b.riskScore - a.riskScore);

    return {
      success: true,
      data: {
        totalPatients: patients.length,
        averageRiskScore: Math.round(averageRisk),
        criticalPatients: criticalCount,
        highRiskPatients: highCount,
        mediumRiskPatients: mediumCount,
        topRiskPatients: riskData.slice(0, 10), // Top 10 highest risk
        lastUpdated: new Date(),
      },
    };
  } catch (error) {
    console.error("Error getting global hospital risk:", error);
    return { success: false, error: "Failed to get hospital risk overview" };
  }
}

// ==================== PREDICTIVE ALERT ENGINE ====================

/**
 * Predict potential alerts before they happen
 */
export async function predictPatientAlerts(patientId: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        questionnaireAssignments: {
          include: {
            responses: {
              include: {
                question: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 10, // Last 10 responses
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
          take: 5, // Last 5 assignments
        },
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    const predictions: PatientPrediction["predictions"] = [];

    // Analyze trends in responses
    const scaleResponses = patient.questionnaireAssignments
      .flatMap(assignment => assignment.responses)
      .map((response) => ({
        answerText: response.answer ?? "",
        createdAt: response.createdAt,
        question: response.question,
      }))
      .filter(
        (response) =>
          response.question.questionType === "SCALE" ||
          response.question.questionType === "RATING"
      )
      .map((response) => ({
        value: parseInt(response.answerText) || 0,
        date: response.createdAt,
        question: response.question.questionText,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Simple trend analysis
    if (scaleResponses.length >= 3) {
      const recent = scaleResponses.slice(-3);
      const avgRecent = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
      const avgPrevious = scaleResponses.length > 3
        ? scaleResponses.slice(-6, -3).reduce((sum, r) => sum + r.value, 0) / 3
        : avgRecent;

      if (avgRecent > avgPrevious + 1) {
        predictions.push({
          type: "TREND_INCREASE",
          description: `Augmentation des scores de symptômes (${avgPrevious.toFixed(1)} → ${avgRecent.toFixed(1)})`,
          probability: Math.min(85, 60 + (avgRecent - avgPrevious) * 10),
          timeFrame: "next_24h",
          recommendedAction: "increase_monitoring",
        });
      }
    }

    // Check for critical symptoms patterns
    const criticalResponses = patient.questionnaireAssignments
      .flatMap(assignment => assignment.responses)
      .filter((response) => {
        const criticalSymptoms = ["douleur thoracique", "difficulté respiratoire", "fatigue extrême"];
        const answerText = (response.answer ?? "").toLowerCase();
        return criticalSymptoms.some((symptom) => answerText.includes(symptom));
      });

    if (criticalResponses.length > 0) {
      const lastCritical = criticalResponses[criticalResponses.length - 1];
      const daysSince = (Date.now() - lastCritical.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince < 7) {
        predictions.push({
          type: "RECURRENCE_RISK",
          description: "Risque de récurrence de symptômes critiques",
          probability: Math.max(20, 80 - daysSince * 10),
          timeFrame: "next_48h",
          recommendedAction: "notify_doctor",
        });
      }
    }

    // Check compliance patterns
    const recentAssignments = patient.questionnaireAssignments.slice(0, 5);
    const completedCount = recentAssignments.filter(a => a.completedAt).length;
    const completionRate = recentAssignments.length > 0 ? completedCount / recentAssignments.length : 0;

    if (completionRate < 0.6) {
      predictions.push({
        type: "COMPLIANCE_DROP",
        description: `Taux de soumission faible (${Math.round(completionRate * 100)}%)`,
        probability: Math.max(30, 90 - completionRate * 50),
        timeFrame: "next_week",
        recommendedAction: "send_reminder",
      });
    }

    return {
      success: true,
      data: {
        patientId,
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        predictions,
        lastAnalyzed: new Date(),
      },
    };
  } catch (error) {
    console.error("Error predicting alerts:", error);
    return { success: false, error: "Failed to predict alerts" };
  }
}

/**
 * Get predictive alerts for all patients
 */
export async function getAllPredictiveAlerts() {
  try {
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    type PredictedAlert = {
      patientId: string;
      patientName: string;
      type: string;
      description: string;
      probability: number;
      timeFrame: string;
      recommendedAction: string;
    };

    const allPredictions: PredictedAlert[] = [];

    for (const patient of patients) {
      const result = await predictPatientAlerts(patient.id);
      if (result.success && result.data) {
        const data = result.data;
        if (data.predictions.length > 0) {
          allPredictions.push(
            ...data.predictions.map((p) => ({
              ...p,
              patientId: patient.id,
              patientName: data.patientName,
            }))
          );
        }
      }
    }

    // Sort by probability descending
    allPredictions.sort((a, b) => b.probability - a.probability);

    return {
      success: true,
      data: {
        totalPredictions: allPredictions.length,
        highProbabilityPredictions: allPredictions.filter(p => p.probability >= 70),
        allPredictions: allPredictions.slice(0, 20), // Top 20
        lastUpdated: new Date(),
      },
    };
  } catch (error) {
    console.error("Error getting predictive alerts:", error);
    return { success: false, error: "Failed to get predictive alerts" };
  }
}

// ==================== AI RECOMMENDATION ENGINE ====================

/**
 * Generate AI recommendations for patient management
 */
export async function generatePatientRecommendations(patientId: string) {
  try {
    const [riskResult, predictionResult] = await Promise.all([
      calculatePatientRiskScore(patientId),
      predictPatientAlerts(patientId),
    ]);

    if (!riskResult.success || !predictionResult.success || !riskResult.data || !predictionResult.data) {
      return { success: false, error: "Failed to analyze patient data" };
    }

    const risk = riskResult.data;
    const predictions = predictionResult.data.predictions;

    const recommendations: Recommendation[] = [];

    // Risk-based recommendations
    if (risk.riskLevel === "CRITICAL") {
      recommendations.push({
        priority: "URGENT",
        action: "notify_doctor_immediately",
        description: "Notifier le médecin référent immédiatement",
        reason: `Score de risque critique (${risk.riskScore}/100)`,
        confidence: 95,
      });
      recommendations.push({
        priority: "HIGH",
        action: "increase_monitoring",
        description: "Augmenter la fréquence de surveillance",
        reason: "Patient à haut risque nécessite monitoring rapproché",
        confidence: 90,
      });
    } else if (risk.riskLevel === "HIGH") {
      recommendations.push({
        priority: "HIGH",
        action: "assign_nurse",
        description: "Assigner un infirmier pour suivi rapproché",
        reason: `Score de risque élevé (${risk.riskScore}/100)`,
        confidence: 85,
      });
    }

    // Prediction-based recommendations
    for (const prediction of predictions) {
      if (prediction.probability >= 70) {
        switch (prediction.recommendedAction) {
          case "increase_monitoring":
            recommendations.push({
              priority: prediction.type === "TREND_INCREASE" ? "HIGH" : "MEDIUM",
              action: "increase_monitoring",
              description: "Augmenter la fréquence des questionnaires",
              reason: prediction.description,
              confidence: prediction.probability,
            });
            break;
          case "notify_doctor":
            recommendations.push({
              priority: "HIGH",
              action: "notify_doctor",
              description: "Alerter le médecin référent",
              reason: prediction.description,
              confidence: prediction.probability,
            });
            break;
          case "send_reminder":
            recommendations.push({
              priority: "MEDIUM",
              action: "send_reminder",
              description: "Envoyer un rappel de soumission",
              reason: prediction.description,
              confidence: prediction.probability,
            });
            break;
        }
      }
    }

    // Check nurse assignment
    const nurseAssignment = await prisma.nurseAssignment.findFirst({
      where: { patientId, isActive: true },
    });

    if (!nurseAssignment && (risk.riskLevel === "HIGH" || risk.riskLevel === "CRITICAL")) {
      recommendations.push({
        priority: "MEDIUM",
        action: "assign_nurse",
        description: "Assigner un infirmier disponible",
        reason: "Patient à risque sans infirmier assigné",
        confidence: 80,
      });
    }

    // Remove duplicates and sort by priority
    const uniqueRecommendations = recommendations.filter((rec, index, self) =>
      index === self.findIndex(r => r.action === rec.action)
    );

    const priorityOrder: Record<RecommendationPriority, number> = {
      URGENT: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };
    uniqueRecommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return {
      success: true,
      data: {
        patientId,
        patientName: risk.patientName,
        recommendations: uniqueRecommendations,
        generatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return { success: false, error: "Failed to generate recommendations" };
  }
}

/**
 * Get AI recommendations for all patients
 */
export async function getAllAIRecommendations() {
  try {
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    type RecommendationSet = {
      patientId: string;
      patientName: string;
      recommendations: Recommendation[];
    };

    const allRecommendations: RecommendationSet[] = [];

    for (const patient of patients) {
      const result = await generatePatientRecommendations(patient.id);
      if (result.success && result.data) {
        const data = result.data;
        if (data.recommendations.length > 0) {
          allRecommendations.push({
            patientId: patient.id,
            patientName: data.patientName,
            recommendations: data.recommendations,
          });
        }
      }
    }

    // Sort patients by highest priority recommendation
    allRecommendations.sort((a, b) => {
      const priorityOrder: Record<RecommendationPriority, number> = {
        URGENT: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };
      const aPriority = Math.min(
        ...a.recommendations.map((r) => priorityOrder[r.priority])
      );
      const bPriority = Math.min(
        ...b.recommendations.map((r) => priorityOrder[r.priority])
      );
      return aPriority - bPriority;
    });

    return {
      success: true,
      data: {
        totalPatientsWithRecommendations: allRecommendations.length,
        urgentRecommendations: allRecommendations.filter(p =>
          p.recommendations.some(r => r.priority === "URGENT")
        ),
        allRecommendations: allRecommendations.slice(0, 15), // Top 15 patients
        lastUpdated: new Date(),
      },
    };
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    return { success: false, error: "Failed to get AI recommendations" };
  }
}

// ==================== PATIENT COMPLIANCE AI ====================

/**
 * Predict patient compliance and adherence
 */
export async function predictPatientCompliance(patientId: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        questionnaireAssignments: {
          orderBy: {
            assignedAt: "desc",
          },
          take: 20, // Last 20 assignments
        },
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    const assignments = patient.questionnaireAssignments;
    if (assignments.length < 5) {
      return {
        success: true,
        data: {
          patientId,
          patientName: `${patient.user.firstName} ${patient.user.lastName}`,
          complianceScore: 50, // Neutral for new patients
          riskLevel: "UNKNOWN",
          predictions: [],
        },
      };
    }

    // Calculate completion rate over time
    const completed = assignments.filter(a => a.completedAt).length;
    const completionRate = completed / assignments.length;

    // Analyze submission patterns
    const submissionTimes = assignments
      .filter(a => a.completedAt)
      .map(a => a.completedAt!.getTime())
      .sort((a, b) => a - b);

    let complianceScore = completionRate * 100;
    const predictions = [];

    // Check for declining trend
    if (assignments.length >= 10) {
      const recent = assignments.slice(0, 5);
      const older = assignments.slice(5, 10);

      const recentCompleted = recent.filter(a => a.completedAt).length / recent.length;
      const olderCompleted = older.filter(a => a.completedAt).length / older.length;

      if (recentCompleted < olderCompleted - 0.2) {
        complianceScore -= 20;
        predictions.push({
          type: "DECLINING_COMPLIANCE",
          description: "Tendance à la baisse de la soumission",
          probability: Math.min(90, 60 + (olderCompleted - recentCompleted) * 100),
          timeFrame: "next_2weeks",
        });
      }
    }

    // Check submission delays
    const avgDelay = assignments
      .filter(a => a.completedAt)
      .reduce((sum, a) => {
        const delay = (a.completedAt!.getTime() - a.assignedAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, delay - 7); // Expected within 7 days
      }, 0) / completed;

    if (avgDelay > 3) {
      complianceScore -= avgDelay * 2;
      predictions.push({
        type: "DELAYED_SUBMISSIONS",
        description: `Soumissions retardées (moyenne: ${avgDelay.toFixed(1)} jours)`,
        probability: Math.min(85, 50 + avgDelay * 5),
        timeFrame: "ongoing",
      });
    }

    complianceScore = Math.max(0, Math.min(100, complianceScore));

    let riskLevel = "LOW";
    if (complianceScore <= 30) riskLevel = "HIGH";
    else if (complianceScore <= 60) riskLevel = "MEDIUM";

    return {
      success: true,
      data: {
        patientId,
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        complianceScore: Math.round(complianceScore),
        riskLevel,
        predictions,
        lastAnalyzed: new Date(),
      },
    };
  } catch (error) {
    console.error("Error predicting compliance:", error);
    return { success: false, error: "Failed to predict compliance" };
  }
}

// ==================== AI ANOMALY DETECTION ====================

/**
 * Detect anomalous user behavior and data patterns
 */
export async function detectAnomalies() {
  try {
    const anomalies: Anomaly[] = [];

    // Check for unusual questionnaire submission patterns
    const recentSubmissions = await prisma.questionnaireResponse.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        assignment: {
          include: {
            patient: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Group by user
    const userSubmissions: Record<string, UserSubmissionSummary> = {};
    recentSubmissions.forEach((submission) => {
      const userId = submission.assignment.patient.userId;
      if (!userSubmissions[userId]) {
        userSubmissions[userId] = {
          user: submission.assignment.patient.user,
          count: 0,
          timeSpan: 0,
        };
      }
      userSubmissions[userId].count++;
      userSubmissions[userId].timeSpan =
        Math.max(
          userSubmissions[userId].timeSpan,
          submission.createdAt.getTime()
        ) -
        Math.min(
          userSubmissions[userId].timeSpan || submission.createdAt.getTime(),
          submission.createdAt.getTime()
        );
    });

    // Detect bulk submissions
    Object.values(userSubmissions).forEach((data) => {
      const submissionsPerHour = data.count / (data.timeSpan / (1000 * 60 * 60));
      if (submissionsPerHour > 10) {
        // More than 10 submissions per hour
        anomalies.push({
          type: "BULK_SUBMISSIONS",
          severity: "HIGH",
          description: `${data.user.firstName} ${data.user.lastName} a soumis ${data.count} questionnaires en ${Math.round(
            data.timeSpan / (1000 * 60)
          )} minutes`,
          userId: data.user.id,
          userName: `${data.user.firstName} ${data.user.lastName}`,
          detectedAt: new Date(),
        });
      }
    });

    // Check for suspicious response patterns
    const suspiciousResponses = await prisma.questionnaireResponse.findMany({
      where: {
        answer: {
          in: ["999", "9999", "test", "fake"], // Common fake values
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        },
      },
      include: {
        assignment: {
          include: {
            patient: {
              include: { user: true },
            },
          },
        },
        question: true,
      },
    });

    suspiciousResponses.forEach((response) => {
      const answerText = response.answer ?? "";
      anomalies.push({
        type: "SUSPICIOUS_DATA",
        severity: "MEDIUM",
        description: `Réponse suspecte "${answerText}" à "${response.question.questionText}"`,
        userId: response.assignment.patient.userId,
        userName: `${response.assignment.patient.user.firstName} ${response.assignment.patient.user.lastName}`,
        detectedAt: new Date(),
      });
    });

    // Check for nurse activity anomalies
    const nurseActivities = await prisma.nurseAssignment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const nurseActivityCount: Record<string, number> = {};
    nurseActivities.forEach((activity) => {
      const nurseId = activity.nurseId;
      nurseActivityCount[nurseId] = (nurseActivityCount[nurseId] || 0) + 1;
    });

    for (const [nurseId, count] of Object.entries(nurseActivityCount)) {
      if (count > 20) {
        const nurse = await prisma.user.findUnique({
          where: { id: nurseId },
          select: { firstName: true, lastName: true },
        });
        const nurseName = nurse
          ? `${nurse.firstName} ${nurse.lastName}`
          : nurseId;
        anomalies.push({
          type: "UNUSUAL_NURSE_ACTIVITY",
          severity: "HIGH",
          description: `${nurseName} a effectué ${count} assignations en 24h`,
          userId: nurseId,
          userName: nurseName,
          detectedAt: new Date(),
        });
      }
    }

    return {
      success: true,
      data: {
        totalAnomalies: anomalies.length,
        anomalies: anomalies.sort((a, b) => {
          const severityOrder: Record<AnomalySeverity, number> = {
            HIGH: 0,
            MEDIUM: 1,
            LOW: 2,
          };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        lastScanned: new Date(),
      },
    };
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return { success: false, error: "Failed to detect anomalies" };
  }
}

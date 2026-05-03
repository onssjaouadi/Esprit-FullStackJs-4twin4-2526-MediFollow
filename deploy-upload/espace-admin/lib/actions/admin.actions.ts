"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { pusherServer } from "@/lib/pusher";
import {
  sendDoctorCredentialsEmail,
  sendStaffCredentialsEmail,
  sendPatientApprovalEmail,
  sendPatientBannedEmail,
} from "@/lib/actions/notification.actions";
import crypto from "crypto";

function generateRandomPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  // Ensure at least one of each type
  let password = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];

  for (let i = password.length; i < length; i++) {
    password.push(all[crypto.randomInt(all.length)]);
  }

  // Shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

// Get all users
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
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

// Get user by ID - ADD THIS FUNCTION
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

// Update user
export async function updateUser(userId: string, data: any) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role as Role,
        isActive: data.isActive,
        phoneNumber: data.phoneNumber ?? undefined,
      },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

// Delete user
export async function deleteUser(userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Break optional references from alerts to this user.
      await tx.alert.updateMany({
        where: { triggeredById: userId },
        data: { triggeredById: null },
      });

      await tx.alert.updateMany({
        where: { acknowledgedById: userId },
        data: { acknowledgedById: null, acknowledgedAt: null },
      });

      await tx.alert.updateMany({
        where: { resolvedById: userId },
        data: {
          resolvedById: null,
          resolvedAt: null,
          resolution: null,
          status: "OPEN",
        },
      });

      // Remove logs/sessions that still point to the user.
      await tx.auditLog.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });

      // Patient has onDelete cascade for all patient-linked entities.
      await tx.patient.deleteMany({ where: { userId } });

      await tx.user.delete({ where: { id: userId } });
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    const details =
      error instanceof Error ? error.message : "Unknown delete error";
    return { success: false, error: `Failed to delete user: ${details}` };
  }
}

// Create user
export async function createUser(data: any) {
  try {
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
    return { success: false, error: "Failed to create user" };
  }
}

// Toggle user status
export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { success: false, error: "Failed to update user status" };
  }
}

// Get users by role
export async function getUsersByRole(role: string) {
  try {
    const users = await prisma.user.findMany({
      where: { role: role as Role },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error getting users by role:", error);
    return [];
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" as Role },
    });
    const totalDoctors = await prisma.user.count({
      where: { role: "DOCTOR" as Role },
    });
    const totalPatients = await prisma.user.count({
      where: { role: "PATIENT" as Role },
    });

    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const inactiveUsers = await prisma.user.count({
      where: { isActive: false },
    });

    return {
      totalUsers,
      totalAdmins,
      totalDoctors,
      totalPatients,
      activeUsers,
      inactiveUsers,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
}

// Get pending (unapproved) patients
export async function getPendingPatients() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "PATIENT", isApproved: false },
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    console.error("Error getting pending patients:", error);
    return [];
  }
}

// Approve a patient
export async function approvePatient(userId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    try {
      await sendPatientApprovalEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error("Approval email error:", emailError);
    }

    revalidatePath("/dashboard/admin/pending-patients");
    return { success: true, user };
  } catch (error) {
    console.error("Error approving patient:", error);
    return { success: false, error: "Failed to approve patient" };
  }
}

// Ban (reject) a patient
export async function banPatient(userId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, isApproved: false },
    });

    try {
      await sendPatientBannedEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error("Ban email error:", emailError);
    }

    revalidatePath("/dashboard/admin/pending-patients");
    return { success: true, user };
  } catch (error) {
    console.error("Error banning patient:", error);
    return { success: false, error: "Failed to ban patient" };
  }
}

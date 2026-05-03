/**
 * MediFollow - User Settings Actions
 * Server actions for user profile and settings management
 */

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { hashPassword, comparePassword, verifyAccessToken } from "@/lib/utils";

/**
 * Update user profile information
 */
export async function updateUserProfile(formData: FormData) {
  try {
    // Get current user from token
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { success: false, error: "Non authentifié" };
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return { success: false, error: "Session invalide" };
    }

    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return {
        success: false,
        error: "Le prénom, nom et email sont requis",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Format d'email invalide",
      };
    }

    // Check if email is already taken by another user
    if (email !== payload.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== payload.userId) {
        return {
          success: false,
          error: "Cette adresse email est déjà utilisée",
        };
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
      },
    });

    // Revalidate pages that depend on user data
    revalidatePath("/dashboard/doctor/settings");
    revalidatePath("/dashboard/doctor");

    return {
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(formData: FormData) {
  try {
    // Get current user from token
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { success: false, error: "Non authentifié" };
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return { success: false, error: "Session invalide" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        error: "Tous les champs sont requis",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "Les nouveaux mots de passe ne correspondent pas",
      };
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Le nouveau mot de passe doit contenir au moins 8 caractères",
      };
    }

    if (!/[A-Z]/.test(newPassword)) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins une majuscule",
      };
    }

    if (!/[a-z]/.test(newPassword)) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins une minuscule",
      };
    }

    if (!/[0-9]/.test(newPassword)) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins un chiffre",
      };
    }

    if (!/[@$!%*?&]/.test(newPassword)) {
      return {
        success: false,
        error:
          "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)",
      };
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    // Verify current password
    const isValidPassword = await comparePassword(
      currentPassword,
      user.passwordHash
    );

    if (!isValidPassword) {
      return {
        success: false,
        error: "Le mot de passe actuel est incorrect",
      };
    }

    // Check if new password is different from current
    const isSamePassword = await comparePassword(
      newPassword,
      user.passwordHash
    );

    if (isSamePassword) {
      return {
        success: false,
        error:
          "Le nouveau mot de passe doit être différent du mot de passe actuel",
      };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    // Optional: Invalidate all other sessions for security
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        refreshToken: {
          not: cookieStore.get("refreshToken")?.value || "",
        },
      },
    });

    return {
      success: true,
      message: "Mot de passe modifié avec succès",
    };
  } catch (error: any) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: "Erreur lors du changement de mot de passe",
    };
  }
}

/**
 * Deactivate user account
 */
export async function deactivateAccount(formData: FormData) {
  try {
    // Get current user from token
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { success: false, error: "Non authentifié" };
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return { success: false, error: "Session invalide" };
    }

    const password = formData.get("password") as string;

    if (!password) {
      return {
        success: false,
        error: "Le mot de passe est requis pour confirmer",
      };
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return {
        success: false,
        error: "Mot de passe incorrect",
      };
    }

    // Deactivate account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: false,
      },
    });

    // Clear all sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Clear cookies
    cookies().delete("accessToken");
    cookies().delete("refreshToken");

    return {
      success: true,
      message: "Compte désactivé avec succès",
    };
  } catch (error: any) {
    console.error("Deactivate account error:", error);
    return {
      success: false,
      error: "Erreur lors de la désactivation du compte",
    };
  }
}

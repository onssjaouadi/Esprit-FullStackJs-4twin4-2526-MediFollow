/**
 * MediFollow - Password Reset Actions
 * Server actions for password reset functionality
 */

"use server";

import { randomBytes } from "crypto";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/azure-email";

/**
 * Request password reset - sends email with reset link
 */
export async function requestPasswordReset(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();

    if (!email) {
      return {
        success: false,
        error: "L'adresse email est requise",
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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // (don't reveal if email exists or not)
    if (!user || !user.isActive) {
      return {
        success: true,
        message:
          "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
      };
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Save token and expiration to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    // Send email with reset link (with timeout handling)
    console.log(`📧 Tentative d'envoi d'email à ${user.email}...`);
    let emailResult;

    try {
      emailResult = await sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        resetToken,
      });

      if (!emailResult.success) {
        console.error("❌ Failed to send reset email:", emailResult.error);

        // If timeout, still return success to user (token is already saved)
        if (emailResult.error?.includes("timeout")) {
          console.warn(
            "⚠️  Email timeout but token saved - user can try again"
          );
          return {
            success: true,
            message:
              "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
          };
        }

        return {
          success: false,
          error:
            "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.",
        };
      }

      console.log(
        `✅ Email envoyé avec succès! Message ID: ${emailResult.messageId}`
      );
    } catch (error: any) {
      console.error("❌ Email send exception:", error.message);
      // Token is saved, so return success anyway
      return {
        success: true,
        message:
          "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
      };
    }

    return {
      success: true,
      message:
        "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
    };
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: "Une erreur est survenue. Veuillez réessayer.",
    };
  }
}

/**
 * Verify reset token validity
 */
export async function verifyResetToken(token: string) {
  try {
    if (!token) {
      return { success: false, error: "Token manquant" };
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token must not be expired
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error:
          "Ce lien est invalide ou a expiré. Veuillez faire une nouvelle demande.",
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  } catch (error: any) {
    console.error("Verify reset token error:", error);
    return {
      success: false,
      error: "Erreur lors de la vérification du token",
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(formData: FormData) {
  try {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate inputs
    if (!token || !password || !confirmPassword) {
      return {
        success: false,
        error: "Tous les champs sont requis",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        error: "Les mots de passe ne correspondent pas",
      };
    }

    // Validate password strength
    if (password.length < 8) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins 8 caractères",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins une majuscule",
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins une minuscule",
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins un chiffre",
      };
    }

    if (!/[@$!%*?&]/.test(password)) {
      return {
        success: false,
        error:
          "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)",
      };
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
        isActive: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error:
          "Ce lien est invalide ou a expiré. Veuillez faire une nouvelle demande.",
      };
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Optional: Invalidate all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return {
      success: true,
      message: "Votre mot de passe a été réinitialisé avec succès",
    };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la réinitialisation",
    };
  }
}

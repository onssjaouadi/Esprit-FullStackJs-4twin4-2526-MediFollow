/**
 * MediFollow - Authentication Actions with Real-Time Auditing
 */

"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/utils";
import { LoginSchema, RegisterSchema } from "@/lib/validation";
import { createAuditLog } from "@/lib/actions/audit.actions"; 
import { pusherServer } from "@/lib/pusher";
import { sendWelcomeEmail, sendNewSignupNotification } from "@/lib/actions/notification.actions";
// Import your custom Role type to use for casting
import { Role as CustomRole } from "@/types/medifollow.types";

export async function login(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = LoginSchema.parse(rawData);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: { patient: true },
      // @ts-ignore - isApproved is a new field
    }) as any;

    if (!user) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    if (!user.isActive) {
      return { success: false, error: "Compte désactivé" };
    }

    if (!user.isApproved) {
      return { success: false, error: "Votre compte est en attente d'approbation par un administrateur" };
    }

    const isValid = await comparePassword(
      validated.password,
      user.passwordHash
    );
    
    if (!isValid) {
      await createAuditLog(user.id, "LOGIN_FAILED", "User", user.id, { reason: "Wrong Password" });
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    // FIX: Cast user.role to CustomRole to satisfy JWTPayload
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as unknown as CustomRole,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as unknown as CustomRole,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await createAuditLog(
      user.id, 
      "CONNEXION", 
      "User", 
      user.id, 
      { fullName: `${user.firstName} ${user.lastName}`, role: user.role }
    );

    const cookieStore = cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as unknown as CustomRole, // Fix cast here too
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: "Erreur lors de la connexion" };
  }
}

export async function register(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: (formData.get("phoneNumber") as string) || undefined,
    };

    const validated = RegisterSchema.parse(rawData);

    const passwordHash = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phoneNumber: validated.phoneNumber,
        role: "PATIENT",
        isApproved: false,
      },
    });

    await createAuditLog(
      user.id, 
      "CRÉATION_COMPTE", 
      "User", 
      user.id, 
      { email: user.email, role: "PATIENT" }
    );

    try {
      await pusherServer.trigger("admin-updates", "new-signup", {
        title: "Nouvelle inscription",
        desc: `${user.firstName} ${user.lastName} vient de creer un compte.`,
        userId: user.id,
      });
    } catch (pusherError) {
      console.error("Signup notification error:", pusherError);
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error("Welcome email error:", emailError);
    }

    // Notify admin of new signup
    try {
      await sendNewSignupNotification(user.firstName, user.lastName, user.email);
    } catch (emailError) {
      console.error("Signup admin email error:", emailError);
    }

    return {
      success: true,
      message: "Compte créé avec succès",
      userId: user.id,
    };
  } catch (error: any) {
    console.error("Register error:", error);

    if (error?.name === "ZodError" && error.errors?.length > 0) {
      const messages = error.errors.map((e: any) => e.message).join(", ");
      return { success: false, error: messages };
    }

    if (error?.code === "P2002") {
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    return { success: false, error: "Erreur lors de l'inscription" };
  }
}

export async function logout() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const currentUser = await getCurrentUser();

    if (refreshToken) {
      await prisma.session.deleteMany({
        where: { refreshToken },
      });
    }

    if (currentUser) {
      await createAuditLog(currentUser.id, "DÉCONNEXION", "User", currentUser.id);
    }

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Erreur lors de la déconnexion" };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) return null;

    const { verifyAccessToken } = await import("@/lib/utils");
    const payload = verifyAccessToken(accessToken);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { patient: true },
    });

    if (!user || !user.isActive) return null;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as unknown as CustomRole, // Fix cast here too
      phoneNumber: user.phoneNumber,
      patient: user.patient,
    };
  } catch (error) {
    return null;
  }
}
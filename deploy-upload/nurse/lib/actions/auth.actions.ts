/**
 * MediFollow - Authentication Actions
 * Server actions for authentication
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
import { generateUserWallet } from "@/lib/actions/blockchain-access.actions";
import { encryptPrivateKey } from "@/lib/encryption";

export async function login(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = LoginSchema.parse(rawData);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: { 
        patient: true,
        nurseProfile: true,
        coordinatorProfile: true,
      },
    });

    if (!user) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    if (!user.isActive) {
      return { success: false, error: "Compte désactivé" };
    }

    // Verify password
    const isValid = await comparePassword(
      validated.password,
      user.passwordHash
    );
    if (!isValid) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Auto-assign blockchain wallet if the user doesn't have one yet
    // (fire-and-forget — never fails the login)
    if (!(user as any).blockchainAddress) {
      import("@/lib/actions/blockchain-access.actions")
        .then(({ assignWalletToUser }) => assignWalletToUser(user.id))
        .catch((e) => console.error("[wallet auto-assign]", e));
    }

    // Set cookies
    cookies().set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    cookies().set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
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

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Generate individual Aptos wallet for this user
    const wallet = await generateUserWallet();

    // Create user (default role: PATIENT)
    const user = await (prisma as any).user.create({
      data: {
        email: validated.email,
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phoneNumber: validated.phoneNumber,
        role: "PATIENT",
        blockchainAddress: wallet.address,
        blockchainPrivateKey: encryptPrivateKey(wallet.privateKey),
      },
    });

    return {
      success: true,
      message: "Compte créé avec succès",
      userId: user.id,
    };
  } catch (error: any) {
    console.error("Register error:", error);
    return { success: false, error: "Erreur lors de l'inscription" };
  }
}

export async function logout() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { refreshToken },
      });
    }

    // Clear cookies
    cookies().delete("accessToken");
    cookies().delete("refreshToken");

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

    if (!accessToken) {
      return null;
    }

    // Verify and decode token
    const { verifyAccessToken } = await import("@/lib/utils");
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { 
        patient: true,
        nurseProfile: true,
        coordinatorProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      patient: user.patient,
      nurseProfile: user.nurseProfile,
      coordinatorProfile: user.coordinatorProfile,
      hasFaceDescriptor: (user as any).faceDescriptor !== null,
      blockchainAddress: (user as any).blockchainAddress ?? null,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

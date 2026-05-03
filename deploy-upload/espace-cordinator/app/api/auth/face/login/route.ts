import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/utils";
import { Role } from "@/types/medifollow.types";

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { descriptor } = body;

    // Validate descriptor: must be 128-element float array
    if (
      !descriptor ||
      !Array.isArray(descriptor) ||
      descriptor.length !== 128 ||
      !descriptor.every(
        (v: unknown) => typeof v === "number" && isFinite(v as number)
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Descripteur facial invalide" },
        { status: 400 }
      );
    }

    // Load all active users that have enrolled face descriptors
    interface FaceUser {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      faceDescriptor: unknown;
    }

    const users = (await (prisma as any).user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        faceDescriptor: true,
      },
    })) as FaceUser[];

    const enrolledUsers = users.filter(
      (u) =>
        u.faceDescriptor !== null &&
        Array.isArray(u.faceDescriptor) &&
        (u.faceDescriptor as unknown[]).length === 128
    );

    if (enrolledUsers.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          "Aucun visage enregistré dans le système. Enregistrez votre visage depuis votre profil.",
      });
    }

    // Find closest matching face
    let bestMatch: (typeof enrolledUsers)[0] | null = null;
    let bestDistance = Infinity;

    for (const user of enrolledUsers) {
      const stored = user.faceDescriptor as number[];
      const dist = euclideanDistance(descriptor, stored);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = user;
      }
    }

    // Threshold: 0.5 (stricter than default 0.6 for healthcare security)
    const THRESHOLD = 0.5;

    if (!bestMatch || bestDistance > THRESHOLD) {
      return NextResponse.json({
        success: false,
        error:
          "Visage non reconnu. Veuillez vous connecter avec votre mot de passe.",
      });
    }

    // Authentication successful — generate tokens
    const accessToken = generateAccessToken({
      userId: bestMatch.id,
      email: bestMatch.email,
      role: bestMatch.role as unknown as Role,
    });

    const refreshToken = generateRefreshToken({
      userId: bestMatch.id,
      email: bestMatch.email,
      role: bestMatch.role as unknown as Role,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: bestMatch.id,
        refreshToken,
        expiresAt,
      },
    });

    await prisma.user.update({
      where: { id: bestMatch.id },
      data: { lastLogin: new Date() },
    });

    cookies().set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/",
    });

    cookies().set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: bestMatch.id,
        email: bestMatch.email,
        firstName: bestMatch.firstName,
        lastName: bestMatch.lastName,
        role: bestMatch.role,
      },
    });
  } catch (err) {
    console.error("Face login error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}

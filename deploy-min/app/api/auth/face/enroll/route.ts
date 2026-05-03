import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    // Require authenticated session
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Session expirée" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { descriptor } = body;

    // Validate descriptor
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

    // Save face descriptor to user record
    await (prisma as any).user.update({
      where: { id: payload.userId },
      data: { faceDescriptor: descriptor },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Face enroll error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Session expirée" },
        { status: 401 }
      );
    }

    await (prisma as any).user.update({
      where: { id: payload.userId },
      data: { faceDescriptor: null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Face delete error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePhoto: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: fullUser });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { profilePhoto } = body;

    if (typeof profilePhoto !== "string") {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }

    // Validate it's a data URL (base64 image)
    if (!profilePhoto.startsWith("data:image/")) {
      return NextResponse.json({ success: false, error: "Format d'image invalide" }, { status: 400 });
    }

    // Limit size (~2MB in base64 ≈ ~2.7MB string)
    if (profilePhoto.length > 3_000_000) {
      return NextResponse.json({ success: false, error: "Image trop volumineuse (max 2 Mo)" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { profilePhoto },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    // Delete sessions first
    await prisma.session.deleteMany({ where: { userId: user.id } });

    // Delete audit logs
    await prisma.auditLog.deleteMany({ where: { userId: user.id } });

    // Delete the user
    await prisma.user.delete({ where: { id: user.id } });

    // Clear auth cookies
    const cookieStore = cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la suppression du compte" }, { status: 500 });
  }
}

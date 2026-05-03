import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils";
import prisma from "@/lib/prisma";

/** GET /api/blockchain/users-wallets
 * Returns all users with their blockchain wallet status.
 * Requires ADMIN role. Private keys are never returned.
 */
export async function GET(req: NextRequest) {
  try {
    const token = cookies().get("accessToken")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Accès réservé aux admins" },
        { status: 403 }
      );
    }

    const users = await (prisma as any).user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        blockchainAddress: true,
        // Never expose blockchainPrivateKey
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: users.length,
      withWallet: users.filter((u: any) => u.blockchainAddress).length,
      withoutWallet: users.filter((u: any) => !u.blockchainAddress).length,
    };

    return NextResponse.json({ success: true, users, stats });
  } catch (err) {
    console.error("users-wallets error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils";
import {
  assignWalletToUser,
  assignWalletsToAllUsers,
} from "@/lib/actions/blockchain-access.actions";

/** POST /api/blockchain/assign-wallet
 * Body: { userId?: string, all?: boolean, forceRegenerate?: boolean }
 * Requires ADMIN role.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
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

    const body = await req.json();
    const { userId, all, forceRegenerate } = body;

    if (all) {
      const result = await assignWalletsToAllUsers();
      return NextResponse.json(result);
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId requis" },
        { status: 400 }
      );
    }

    const result = await assignWalletToUser(userId, forceRegenerate ?? false);
    return NextResponse.json(result);
  } catch (err) {
    console.error("assign-wallet error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

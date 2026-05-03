import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth-api";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== "PATIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, state, deviceType } = body;

    // Verify that the patient ID matches the current user
    if (!patientId) {
      return NextResponse.json({ error: "Patient ID requis" }, { status: 400 });
    }

    // Build Santé Connect authorization URL
    const santeConnectClientId = process.env.SANTE_CONNECT_CLIENT_ID;
    const santeConnectRedirectUri =
      process.env.SANTE_CONNECT_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/wearables/santeconnect/callback`;

    if (!santeConnectClientId) {
      console.error("[Santé Connect] Missing SANTE_CONNECT_CLIENT_ID");
      return NextResponse.json(
        { error: "Configuration Santé Connect manquante" },
        { status: 500 }
      );
    }

    // Santé Connect authorization endpoint
    const authorizationUrl = new URL("https://auth.sante-connect.fr/authorize");
    authorizationUrl.searchParams.append("client_id", santeConnectClientId);
    authorizationUrl.searchParams.append(
      "redirect_uri",
      santeConnectRedirectUri
    );
    authorizationUrl.searchParams.append("response_type", "code");
    authorizationUrl.searchParams.append("scope", "openid profile email");
    authorizationUrl.searchParams.append("state", state);
    authorizationUrl.searchParams.append(
      "nonce",
      Math.random().toString(36).substring(7)
    );

    // Store patient and device info in session for callback
    const response = NextResponse.json({
      success: true,
      authorizationUrl: authorizationUrl.toString(),
    });

    // Store in a secure cookie
    response.cookies.set(
      "santeconnect_session",
      JSON.stringify({
        patientId,
        deviceType,
        state,
        userId: user.id,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 600, // 10 minutes
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("[Santé Connect] Authorization error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'autorisation" },
      { status: 500 }
    );
  }
}

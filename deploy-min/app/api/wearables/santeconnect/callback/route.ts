import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for errors from Santé Connect
    if (error) {
      console.error("[Santé Connect] Callback error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=${encodeURIComponent(
          error
        )}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=missing_parameters`
      );
    }

    // Get session data from cookie
    const sessionCookie = req.cookies.get("santeconnect_session")?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=session_expired`
      );
    }

    const session = JSON.parse(sessionCookie);

    // Verify state token
    if (session.state !== state) {
      console.error("[Santé Connect] State mismatch");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=invalid_state`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://auth.sante-connect.fr/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri:
          process.env.SANTE_CONNECT_REDIRECT_URI ||
          `${process.env.NEXT_PUBLIC_APP_URL}/api/wearables/santeconnect/callback`,
        client_id: process.env.SANTE_CONNECT_CLIENT_ID || "",
        client_secret: process.env.SANTE_CONNECT_CLIENT_SECRET || "",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error(
        "[Santé Connect] Token exchange failed:",
        tokenResponse.status
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=no_access_token`
      );
    }

    // Get user info from Santé Connect
    const userInfoResponse = await fetch(
      "https://auth.sante-connect.fr/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("[Santé Connect] User info fetch failed");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=userinfo_failed`
      );
    }

    const userInfo = await userInfoResponse.json();

    // Create or update wearable device in database
    const deviceId = `enzo200_${userInfo.sub}_${Date.now()}`;

    const wearableDevice = await prisma.wearableDevice.create({
      data: {
        patientId: session.patientId,
        deviceType: session.deviceType || "ENZO_200",
        deviceId,
        authToken: accessToken, // Store the Santé Connect access token
        isActive: true,
        lastSyncedAt: new Date(),
        metadata: {
          santeConnectSub: userInfo.sub,
          santeConnectEmail: userInfo.email,
          connectedAt: new Date().toISOString(),
        } as any,
      },
    });

    console.log("[Santé Connect] Device registered:", wearableDevice.id);

    // Redirect back to wearables page with success
    const redirectUrl = new URL(
      "/dashboard/patient/wearables",
      process.env.NEXT_PUBLIC_APP_URL
    );
    redirectUrl.searchParams.append("device_connected", "true");
    redirectUrl.searchParams.append("deviceId", wearableDevice.id);

    const response = NextResponse.redirect(redirectUrl);

    // Clear session cookie
    response.cookies.delete("santeconnect_session");

    return response;
  } catch (error) {
    console.error("[Santé Connect] Callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/wearables?error=callback_failed`
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncEnzoData } from "@/lib/actions/wearable.actions";

/**
 * Webhook endpoint for Enzo 200 smartwatch data
 * POST /api/wearables/enzo
 *
 * Expected payload:
 * {
 *   "deviceId": "ENZO_ABC123",
 *   "userId": "patient_id_string",
 *   "timestamp": 1712825400,
 *   "heartRate": 72,
 *   "bloodPressure": { "systolic": 120, "diastolic": 80 },
 *   "temperature": 37.2,
 *   "oxygenSaturation": 98,
 *   "signature": "hmac_hash_for_verification"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Validate required fields
    if (!payload.deviceId || !payload.userId) {
      return NextResponse.json(
        { error: "Missing required fields: deviceId, userId" },
        { status: 400 }
      );
    }

    // Verify signature (optional but recommended)
    // In production, verify HMAC signature with Enzo API secret
    const signature = payload.signature;
    if (!signature) {
      console.warn("⚠️ Warning: No signature provided for Enzo webhook");
    }

    // Get patient
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id: payload.userId },
          { userId: payload.userId },
        ],
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Sync data using server action
    const result = await syncEnzoData(patient.id, {
      deviceId: payload.deviceId,
      userId: payload.userId,
      timestamp: payload.timestamp || Math.floor(Date.now() / 1000),
      heartRate: payload.heartRate ? Number(payload.heartRate) : undefined,
      bloodPressure: payload.bloodPressure
        ? {
            systolic: Number(payload.bloodPressure.systolic),
            diastolic: Number(payload.bloodPressure.diastolic),
          }
        : undefined,
      temperature: payload.temperature ? Number(payload.temperature) : undefined,
      oxygenSaturation: payload.oxygenSaturation
        ? Number(payload.oxygenSaturation)
        : undefined,
      steps: payload.steps ? Number(payload.steps) : undefined,
      calories: payload.calories ? Number(payload.calories) : undefined,
      sleepDuration: payload.sleepDuration
        ? Number(payload.sleepDuration)
        : undefined,
      stressLevel: payload.stressLevel
        ? Number(payload.stressLevel)
        : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Update device last synced timestamp
    await prisma.wearableDevice.updateMany({
      where: { deviceId: payload.deviceId },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      vitalRecordId: result.data?.id,
    });
  } catch (error) {
    console.error("Error processing Enzo webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process wearable data",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to verify webhook connectivity
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Enzo 200 webhook endpoint is active",
    endpoint: "/api/wearables/enzo",
    method: "POST",
  });
}

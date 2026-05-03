import { NextRequest, NextResponse } from "next/server";
import { grantDoctorAccess } from "@/lib/actions/blockchain-access.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";

/**
 * Grant blockchain access to a doctor for a patient
 * POST /api/blockchain/grant-access
 * Body: { doctorWalletAddress: string, patientId: string, durationDays?: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { doctorWalletAddress, patientId, durationDays = 365 } = body;

    if (!doctorWalletAddress || !patientId) {
      return NextResponse.json(
        { success: false, error: "Missing doctorWalletAddress or patientId" },
        { status: 400 }
      );
    }

    const result = await grantDoctorAccess(
      doctorWalletAddress,
      patientId,
      durationDays
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Access granted to doctor ${doctorWalletAddress} for patient ${patientId}`,
        transactionHash: result.transactionHash,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to grant access",
      },
      { status: 500 }
    );
  }
}

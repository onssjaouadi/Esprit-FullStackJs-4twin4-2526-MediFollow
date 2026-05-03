import { NextResponse } from "next/server";
import { initializeAccessControl } from "@/lib/actions/blockchain-access.actions";

/**
 * Initialize the blockchain access control system
 * POST /api/blockchain/initialize
 */
export async function POST() {
  try {
    const result = await initializeAccessControl();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Access control initialized successfully on blockchain",
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
        error: error instanceof Error ? error.message : "Initialization failed",
      },
      { status: 500 }
    );
  }
}

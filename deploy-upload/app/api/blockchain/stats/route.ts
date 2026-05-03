import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getBlockchainStatsEnriched } from "@/lib/actions/blockchain-explorer.actions";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and has appropriate role
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "AUDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch enriched stats including Aptos data
    const stats = await getBlockchainStatsEnriched();

    // Set cache headers for 2 minutes
    const response = NextResponse.json(stats);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=240"
    );

    return response;
  } catch (error) {
    console.error("Error in GET /api/blockchain/stats:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

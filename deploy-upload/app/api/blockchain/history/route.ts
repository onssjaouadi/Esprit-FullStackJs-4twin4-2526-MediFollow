import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getBlockchainHistoryStats } from "@/lib/actions/blockchain-explorer.actions";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and has appropriate role
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "AUDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get("months") || "12");

    // Validate months parameter
    if (months < 1 || months > 60) {
      return NextResponse.json(
        { error: "Months must be between 1 and 60" },
        { status: 400 }
      );
    }

    // Fetch history statistics
    const historyStats = await getBlockchainHistoryStats(months);

    // Set cache headers for 5 minutes
    const response = NextResponse.json(historyStats);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Error in GET /api/blockchain/history:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

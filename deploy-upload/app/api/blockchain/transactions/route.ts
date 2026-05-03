import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getBlockchainTransactions,
  getBlockchainStats,
} from "@/lib/actions/blockchain-explorer.actions";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and has appropriate role
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "AUDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");
    const action = searchParams.get("action") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;

    // Fetch transactions with filters
    const result = await getBlockchainTransactions(skip, take, {
      action,
      userId,
      dateFrom,
      dateTo,
    });

    // Set cache headers for 1 minute
    const response = NextResponse.json(result);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );

    return response;
  } catch (error) {
    console.error("Error in GET /api/blockchain/transactions:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

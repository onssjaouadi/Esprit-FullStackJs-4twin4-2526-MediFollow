import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { exportBlockchainTransactions } from "@/lib/actions/blockchain-explorer.actions";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and has appropriate role
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "AUDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;

    // Fetch and export data
    const csvContent = await exportBlockchainTransactions({
      action,
      userId,
      dateFrom,
      dateTo,
    });

    // Return CSV file
    const response = new NextResponse(csvContent);
    response.headers.set("Content-Type", "text/csv;charset=utf-8");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="blockchain-transactions-${new Date().toISOString().slice(0, 10)}.csv"`
    );

    // Don't cache file downloads
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error in GET /api/blockchain/export:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

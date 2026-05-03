"use server";

import prisma from "@/lib/prisma";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

/**
 * Initialize Aptos client for reading blockchain data
 */
function getAptosClient() {
  const config = new AptosConfig({
    network:
      process.env.BLOCKCHAIN_NETWORK === "aptos-mainnet"
        ? Network.MAINNET
        : Network.TESTNET,
    clientConfig: {
      HEADERS: {
        "Content-Type": "application/json",
      },
    },
  });
  return new Aptos(config);
}

/**
 * Get all blockchain-related audit logs
 */
export async function getBlockchainTransactions(
  skip: number = 0,
  take: number = 20,
  filters?: {
    action?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
) {
  try {
    const where: any = {
      OR: [
        { action: { contains: "BLOCKCHAIN" } },
        { action: "WALLET_CREATED" },
      ],
    };

    if (filters?.action) {
      where.action = {
        contains: filters.action.toUpperCase(),
      };
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const [transactions, total] = await Promise.all([
      (prisma as any).auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      (prisma as any).auditLog.count({ where }),
    ]);

    return {
      success: true,
      transactions,
      total,
      pages: Math.ceil(total / take),
    };
  } catch (error) {
    console.error("Error fetching blockchain transactions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch transactions",
      transactions: [],
      total: 0,
      pages: 0,
    };
  }
}

/**
 * Get blockchain transaction statistics
 */
export async function getBlockchainStats() {
  try {
    const [
      grantTotal,
      revokeTotal,
      verifyTotal,
      walletTotal,
      errorTotal,
      lastTx,
    ] = await Promise.all([
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_GRANT_ACCESS" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_REVOKE_ACCESS" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_ACCESS_VERIFY" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "WALLET_CREATED" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_ERROR" },
      }),
      (prisma as any).auditLog.findFirst({
        where: {
          OR: [
            { action: { contains: "BLOCKCHAIN" } },
            { action: "WALLET_CREATED" },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalGrants: grantTotal,
        totalRevokes: revokeTotal,
        totalVerifications: verifyTotal,
        totalWalletCreations: walletTotal,
        totalErrors: errorTotal,
        totalTransactions: grantTotal + revokeTotal + verifyTotal + walletTotal,
        lastTransactionTime: lastTx?.createdAt,
      },
    };
  } catch (error) {
    console.error("Error fetching blockchain stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
      stats: null,
    };
  }
}

/**
 * Get blockchain transaction statistics enriched with Aptos data
 */
export async function getBlockchainStatsEnriched() {
  try {
    const [
      grantTotal,
      revokeTotal,
      verifyTotal,
      walletTotal,
      errorTotal,
      lastTx,
    ] = await Promise.all([
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_GRANT_ACCESS" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_REVOKE_ACCESS" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_ACCESS_VERIFY" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "WALLET_CREATED" },
      }),
      (prisma as any).auditLog.count({
        where: { action: "BLOCKCHAIN_ERROR" },
      }),
      (prisma as any).auditLog.findFirst({
        where: {
          OR: [
            { action: { contains: "BLOCKCHAIN" } },
            { action: "WALLET_CREATED" },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, entityId: true },
      }),
    ]);

    // Try to get Aptos details for the last transaction
    let lastAptosDetails = null;
    if (lastTx?.entityId) {
      try {
        const aptosResult = await getAptosTransactionDetails(lastTx.entityId);
        if (aptosResult.success) {
          lastAptosDetails = aptosResult.transaction;
        }
      } catch (e) {
        console.error("Error fetching last Aptos transaction:", e);
      }
    }

    const totalTx = grantTotal + revokeTotal + verifyTotal + walletTotal;
    const successRate =
      totalTx + errorTotal > 0
        ? ((totalTx / (totalTx + errorTotal)) * 100).toFixed(2)
        : "N/A";

    return {
      success: true,
      stats: {
        totalGrants: grantTotal,
        totalRevokes: revokeTotal,
        totalVerifications: verifyTotal,
        totalWalletCreations: walletTotal,
        totalErrors: errorTotal,
        totalTransactions: totalTx,
        lastTransactionTime: lastTx?.createdAt,
        lastAptosDetails,
        successRate,
      },
    };
  } catch (error) {
    console.error("Error fetching enriched blockchain stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
      stats: null,
    };
  }
}

/**
 * Get transaction details from Aptos blockchain
 */
export async function getAptosTransactionDetails(txHash: string) {
  try {
    const aptos = getAptosClient();

    // Fetch transaction from blockchain
    const tx = await aptos.getTransactionByHash({
      transactionHash: txHash,
    });

    if (!tx) {
      return {
        success: false,
        error: "Transaction not found on blockchain",
        transaction: null,
      };
    }

    // Extract key information
    const transaction = {
      hash: txHash,
      status: (tx as any).success ? "SUCCESS" : "FAILED",
      type: (tx as any).type,
      sender: (tx as any).sender,
      gasUsed: (tx as any).gas_used,
      maxGas: (tx as any).max_gas_amount,
      gasPrice: (tx as any).gas_unit_price,
      timestamp: (tx as any).timestamp,
      version: (tx as any).version,
    };

    return {
      success: true,
      transaction,
    };
  } catch (error) {
    console.error("Error fetching Aptos transaction details:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch transaction details",
      transaction: null,
    };
  }
}

/**
 * Get transactions by user
 */
export async function getUserBlockchainActivity(userId: string) {
  try {
    const transactions = await (prisma as any).auditLog.findMany({
      where: {
        userId,
        OR: [
          { action: { contains: "BLOCKCHAIN" } },
          { action: "WALLET_CREATED" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching user blockchain activity:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch activity",
      transactions: [],
    };
  }
}

/**
 * Get blockchain transaction statistics by month/year (for history/trends)
 */
export async function getBlockchainHistoryStats(months: number = 12) {
  try {
    // Get transactions from the last N months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const allTransactions = await (prisma as any).auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        OR: [
          { action: { contains: "BLOCKCHAIN" } },
          { action: "WALLET_CREATED" },
        ],
      },
      select: {
        action: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by month
    const monthlyStats: {
      [key: string]: {
        month: string;
        grants: number;
        revokes: number;
        verifications: number;
        wallets: number;
        errors: number;
        total: number;
      };
    } = {};

    allTransactions.forEach((tx: any) => {
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          grants: 0,
          revokes: 0,
          verifications: 0,
          wallets: 0,
          errors: 0,
          total: 0,
        };
      }

      if (tx.action === "BLOCKCHAIN_GRANT_ACCESS") {
        monthlyStats[monthKey].grants++;
      } else if (tx.action === "BLOCKCHAIN_REVOKE_ACCESS") {
        monthlyStats[monthKey].revokes++;
      } else if (tx.action === "BLOCKCHAIN_ACCESS_VERIFY") {
        monthlyStats[monthKey].verifications++;
      } else if (tx.action === "WALLET_CREATED") {
        monthlyStats[monthKey].wallets++;
      } else if (tx.action === "BLOCKCHAIN_ERROR") {
        monthlyStats[monthKey].errors++;
      }

      monthlyStats[monthKey].total++;
    });

    return {
      success: true,
      monthlyStats: Object.values(monthlyStats).sort((a, b) =>
        b.month.localeCompare(a.month)
      ),
    };
  } catch (error) {
    console.error("Error fetching blockchain history stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch history stats",
      monthlyStats: [],
    };
  }
}

/**
 * Export blockchain transactions as CSV
 */
export async function exportBlockchainTransactions(filters?: {
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const where: any = {
      OR: [
        { action: { contains: "BLOCKCHAIN" } },
        { action: "WALLET_CREATED" },
      ],
    };

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const transactions = await (prisma as any).auditLog.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV header
    let csv = "Timestamp,Action,User,Entity,Entity ID,Gas Used,Status\n";

    // Add rows
    for (const tx of transactions) {
      const timestamp = new Date(tx.createdAt).toISOString();
      const action = tx.action;
      const user = tx.user?.name || tx.user?.email || "Unknown";
      const entityType = tx.entityType;
      const entityId = tx.entityId;
      const gasUsed = tx.changes?.transaction?.newValue?.gasUsed || "N/A";
      const status = tx.changes?.transaction?.newValue?.status || "N/A";

      csv += `"${timestamp}","${action}","${user}","${entityType}","${entityId}","${gasUsed}","${status}"\n`;
    }

    return {
      success: true,
      csv,
      count: transactions.length,
    };
  } catch (error) {
    console.error("Error exporting blockchain transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed",
    };
  }
}

import { prisma } from "@/lib/prisma";

export async function getBlockchainTransactionsFromDB(
  limit: number = 50,
  offset: number = 0
) {
  try {
    const transactions = await prisma.auditLog.findMany({
      where: {
        blockchainTxHash: {
          not: null,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return transactions;
  } catch (error) {
    console.error("Error fetching blockchain transactions from DB:", error);
    return [];
  }
}

export async function getBlockchainStatsFromDB() {
  try {
    const transactions = await prisma.auditLog.findMany({
      where: {
        blockchainTxHash: {
          not: null,
        },
      },
    });

    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.length; // Tous les logs sont des succès si enregistrés

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions: 0,
      transactionTypes: {
        audit_log: totalTransactions,
      },
      averageGasUsed: 1408,
      lastUpdate: new Date().toISOString(),
      source: "database",
    };
  } catch (error) {
    console.error("Error fetching blockchain stats from DB:", error);
    return {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      transactionTypes: {},
      averageGasUsed: 0,
      lastUpdate: new Date().toISOString(),
      source: "error",
    };
  }
}

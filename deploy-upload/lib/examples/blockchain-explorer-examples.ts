/**
 * Exemples d'utilisation du module Transactions Blockchain
 *
 * Ce fichier montre comment utiliser les APIs du module blockchain-explorer
 * pour récupérer, filtrer et exporter les transactions blockchain.
 */

// ============================================
// 1. IMPORTER LES FONCTIONS
// ============================================

import {
  getBlockchainTransactions,
  getBlockchainStats,
  getAptosTransactionDetails,
  getUserBlockchainActivity,
  exportBlockchainTransactions,
} from "@/lib/actions/blockchain-explorer.actions";

// ============================================
// 2. RÉCUPÉRER TOUTES LES TRANSACTIONS
// ============================================

async function getAllTransactions() {
  const result = await getBlockchainTransactions(
    0, // skip
    20 // take per page
  );

  if (result.success) {
    console.log(`✅ Transactions trouvées: ${result.total}`);
    console.log(`📄 Pages disponibles: ${result.pages}`);

    result.transactions.forEach((tx) => {
      console.log(`
        Action: ${tx.action}
        User: ${tx.user?.name}
        Entity: ${tx.entityType} - ${tx.entityId}
        Time: ${tx.createdAt}
      `);
    });
  } else {
    console.error(`❌ Erreur: ${result.error}`);
  }
}

// ============================================
// 3. FILTRER PAR ACTION
// ============================================

async function getAccessGrants() {
  const result = await getBlockchainTransactions(0, 50, {
    action: "BLOCKCHAIN_GRANT_ACCESS",
  });

  if (result.success) {
    console.log(
      `✅ ${result.total} accès accordés trouvés`,
      result.transactions
    );
  }
}

// ============================================
// 4. FILTRER PAR DATE
// ============================================

async function getTransactionsLastWeek() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const result = await getBlockchainTransactions(0, 100, {
    dateFrom: weekAgo,
    dateTo: today,
  });

  if (result.success) {
    console.log(`✅ ${result.total} transactions cette semaine`);
  }
}

// ============================================
// 5. FILTRER PAR UTILISATEUR
// ============================================

async function getUserTransactions(userId: string) {
  const result = await getBlockchainTransactions(0, 50, {
    userId,
  });

  if (result.success) {
    console.log(`✅ ${result.total} transactions pour l'utilisateur ${userId}`);
  }
}

// ============================================
// 6. COMBINAISON DE FILTRES
// ============================================

async function complexFiltering(
  userId: string,
  actionType: string,
  fromDate: Date,
  toDate: Date
) {
  const result = await getBlockchainTransactions(0, 100, {
    userId,
    action: actionType,
    dateFrom: fromDate,
    dateTo: toDate,
  });

  if (result.success) {
    console.log(
      `✅ ${result.total} transactions trouvées avec filtres`,
      result.transactions
    );
  }
}

// ============================================
// 7. RÉCUPÉRER LES STATISTIQUES
// ============================================

async function showStatistics() {
  const result = await getBlockchainStats();

  if (result.success) {
    const stats = result.stats;
    console.log(`
    📊 STATISTIQUES BLOCKCHAIN
    ========================
    ✅ Accès accordés: ${stats.totalGrants}
    ❌ Accès révoqués: ${stats.totalRevokes}
    🔍 Vérifications: ${stats.totalVerifications}
    👛 Portefeuilles: ${stats.totalWalletCreations}
    ⚠️  Erreurs: ${stats.totalErrors}
    📈 Total transactions: ${stats.totalTransactions}
    🕐 Dernière transaction: ${stats.lastTransactionTime}
    `);
  }
}

// ============================================
// 8. OBTENIR DÉTAILS APTOS
// ============================================

async function getTransactionDetails(txHash: string) {
  const result = await getAptosTransactionDetails(txHash);

  if (result.success) {
    const tx = result.transaction;
    console.log(`
    🔗 DÉTAILS APTOS
    ===============
    Hash: ${tx.hash}
    Status: ${tx.status}
    Sender: ${tx.sender}
    Gaz utilisé: ${tx.gasUsed}
    Gaz max: ${tx.maxGas}
    Prix du gaz: ${tx.gasPrice}
    Timestamp: ${tx.timestamp}
    Version: ${tx.version}
    `);
  } else {
    console.error(`❌ Transaction non trouvée: ${result.error}`);
  }
}

// ============================================
// 9. OBTENIR ACTIVITÉ D'UN UTILISATEUR
// ============================================

async function trackUserActivity(userId: string) {
  const result = await getUserBlockchainActivity(userId);

  if (result.success) {
    console.log(
      `✅ ${result.transactions.length} transactions pour ${userId}:`
    );
    result.transactions.forEach((tx) => {
      console.log(`  - ${tx.action} le ${tx.createdAt}`);
    });
  }
}

// ============================================
// 10. EXPORTER EN CSV
// ============================================

async function exportAllTransactions() {
  const result = await exportBlockchainTransactions();

  if (result.success) {
    console.log(`✅ ${result.count} transactions exportées`);
    console.log("📝 Contenu CSV:");
    console.log(result.csv);

    // Sauvegarder dans un fichier
    const fs = require("fs");
    fs.writeFileSync(`blockchain-transactions-${Date.now()}.csv`, result.csv);
  }
}

// ============================================
// 11. EXPORTER AVEC FILTRES
// ============================================

async function exportFilteredTransactions(
  action: string,
  dateFrom: Date,
  dateTo: Date
) {
  const result = await exportBlockchainTransactions({
    action,
    dateFrom,
    dateTo,
  });

  if (result.success) {
    console.log(`✅ ${result.count} transactions exportées`);
    // Télécharger le fichier...
  }
}

// ============================================
// 12. PAGINATION
// ============================================

async function pagineThrough(pageSize: number = 50) {
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await getBlockchainTransactions(page * pageSize, pageSize);

    if (result.success) {
      console.log(
        `📄 Page ${page + 1} de ${result.pages}: ${result.transactions.length} transactions`
      );
      page++;
      hasMore = page < result.pages;
    } else {
      hasMore = false;
    }
  }
}

// ============================================
// 13. CAS D'USAGE: AUDIT DE CONFORMITÉ
// ============================================

async function complianceAudit(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  console.log(`🔍 Audit de conformité pour ${month}/${year}`);

  // Récupérer toutes les transactions du mois
  const result = await getBlockchainTransactions(0, 1000, {
    dateFrom: startDate,
    dateTo: endDate,
  });

  if (result.success) {
    const stats = {
      totalTx: result.total,
      grants: result.transactions.filter(
        (t) => t.action === "BLOCKCHAIN_GRANT_ACCESS"
      ).length,
      revokes: result.transactions.filter(
        (t) => t.action === "BLOCKCHAIN_REVOKE_ACCESS"
      ).length,
      errors: result.transactions.filter((t) => t.action === "BLOCKCHAIN_ERROR")
        .length,
    };

    console.log(`
    📋 RAPPORT DE CONFORMITÉ
    =======================
    Mois: ${month}/${year}
    Total transactions: ${stats.totalTx}
    Accès accordés: ${stats.grants}
    Accès révoqués: ${stats.revokes}
    Erreurs: ${stats.errors}
    Ratio succès: ${(((stats.totalTx - stats.errors) / stats.totalTx) * 100).toFixed(2)}%
    `);

    // Exporter pour archivage
    const exportResult = await exportBlockchainTransactions({
      dateFrom: startDate,
      dateTo: endDate,
    });

    if (exportResult.success) {
      console.log("✅ Rapport exporté en CSV");
    }
  }
}

// ============================================
// 14. CAS D'USAGE: DÉTECTION D'ANOMALIES
// ============================================

async function detectAnomalies() {
  console.log("🔍 Détection d'anomalies...");

  // Récupérer les stats
  const statsResult = await getBlockchainStats();

  if (statsResult.success) {
    const stats = statsResult.stats;

    // Chercher un taux d'erreur élevé
    if (stats.totalErrors > stats.totalTransactions * 0.1) {
      console.log(
        `⚠️  ALERTE: Taux d'erreur élevé: ${((stats.totalErrors / stats.totalTransactions) * 100).toFixed(2)}%`
      );
    }

    // Chercher une inactivité
    if (
      stats.lastTransactionTime &&
      new Date().getTime() - new Date(stats.lastTransactionTime).getTime() >
        24 * 60 * 60 * 1000
    ) {
      console.log("⚠️  ALERTE: Aucune activité depuis plus de 24 heures");
    }

    // Chercher des révocations massives
    if (stats.totalRevokes > stats.totalGrants) {
      console.log("⚠️  ALERTE: Revokes supérieurs aux grants");
    }
  }
}

// ============================================
// 15. CAS D'USAGE: TROUBLESHOOTING
// ============================================

async function troubleshootBlockchainIssues() {
  console.log("🔧 Troubleshooting des problèmes blockchain...\n");

  // Obtenir les erreurs récentes
  const result = await getBlockchainTransactions(0, 20, {
    action: "BLOCKCHAIN_ERROR",
  });

  if (result.success && result.transactions.length > 0) {
    console.log(`❌ ${result.transactions.length} erreurs trouvées:\n`);

    result.transactions.forEach((tx) => {
      const errorDetails = tx.changes?.transaction?.newValue;
      console.log(`
      Timestamp: ${tx.createdAt}
      Utilisateur: ${tx.user?.name}
      Type d'erreur: ${errorDetails?.errorType}
      Message: ${errorDetails?.errorMessage}
      Contexte: ${JSON.stringify(errorDetails?.context)}
      `);
    });
  } else {
    console.log("✅ Aucune erreur trouvée!");
  }
}

// ============================================
// EXÉCUTION DES EXEMPLES
// ============================================

// Décommenter les fonctions à tester :

// await getAllTransactions();
// await getAccessGrants();
// await getTransactionsLastWeek();
// await showStatistics();
// await complianceAudit(4, 2024);
// await detectAnomalies();
// await troubleshootBlockchainIssues();

export {
  getAllTransactions,
  getAccessGrants,
  getTransactionsLastWeek,
  getUserTransactions,
  complexFiltering,
  showStatistics,
  getTransactionDetails,
  trackUserActivity,
  exportAllTransactions,
  exportFilteredTransactions,
  pagineThrough,
  complianceAudit,
  detectAnomalies,
  troubleshootBlockchainIssues,
};

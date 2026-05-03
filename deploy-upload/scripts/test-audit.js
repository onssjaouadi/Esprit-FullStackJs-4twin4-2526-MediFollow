#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n📋 Test du Système d'Audit MediFollow\n");

    // Get auditor account
    const auditor = await prisma.user.findUnique({
      where: { email: "audit@medifollow.health" },
    });

    if (!auditor) {
      console.log("❌ Auditeur non trouvé. Créez d'abord le compte avec:");
      console.log("   node scripts/create-auditor.js");
      process.exit(1);
    }

    // Get audit logs
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 20,
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

    console.log("✅ Auditeur trouvé: " + auditor.email);
    console.log("\n📊 Logs d'audit existants:");
    console.log("=".repeat(70));

    if (logs.length === 0) {
      console.log("Aucun log d'audit trouvé dans le système.");
    } else {
      logs.forEach((log, index) => {
        console.log(`\n${index + 1}. [${log.action}]`);
        console.log(`   👤 ${log.user.email}`);
        console.log(`   🕐 ${log.timestamp.toLocaleString("fr-FR")}`);
        console.log(`   📦 Entité: ${log.entityType}`);
        if (log.entityId) {
          console.log(`   🔑 ID: ${log.entityId.substring(0, 8)}...`);
        }
      });
    }

    // Statistics
    const allLogs = await prisma.auditLog.findMany();
    const loginLogs = await prisma.auditLog.findMany({
      where: { action: "LOGIN" },
    });

    const patientCreations = await prisma.auditLog.findMany({
      where: { action: "CREATE_PATIENT" },
    });

    const vitalsCreations = await prisma.auditLog.findMany({
      where: { action: "CREATE_VITAL_SIGN" },
    });

    const alerts = await prisma.auditLog.findMany({
      where: {
        action: { in: ["CREATE_ALERT", "ACKNOWLEDGE_ALERT", "RESOLVE_ALERT"] },
      },
    });

    console.log("\n\n📈 Statistiques d'Audit");
    console.log("=".repeat(70));
    console.log(`Total des actions enregistrées: ${allLogs.length}`);
    console.log(`  📊 Connexions: ${loginLogs.length}`);
    console.log(`  👥 Créations de patients: ${patientCreations.length}`);
    console.log(`  💚 Signes vitaux créés: ${vitalsCreations.length}`);
    console.log(`  ⚠️  Alertes (créées/traitées): ${alerts.length}`);

    // Users with most actions
    const userCounts = {};
    allLogs.forEach((log) => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topUsers.length > 0) {
      console.log("\n👥 Utilisateurs les plus actifs:");
      for (const [userId, count] of topUsers) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true, lastName: true },
        });
        console.log(
          `  ${user?.email} (${user?.firstName} ${user?.lastName}): ${count} actions`
        );
      }
    }

    // Actions by type
    const actionCounts = {};
    allLogs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    if (Object.keys(actionCounts).length > 0) {
      console.log("\n🎯 Actions les plus courantes:");
      Object.entries(actionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([action, count]) => {
          console.log(`  ${action}: ${count}`);
        });
    }

    console.log("\n✅ Dashboard d'audit accessible à: /admin/audit");
    console.log("🔗 Connectez-vous avec: audit@medifollow.health");
    console.log("\n" + "=".repeat(70));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

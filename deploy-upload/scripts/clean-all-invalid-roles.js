#!/usr/bin/env node
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n💣 SUPPRESSION DE TOUS LES RÔLES INVALIDES\n");

    const rolesInvalides = [
      "COORDINATOR",
      "NURSE",
      "TECHNICIAN",
      "RECEPTIONIST",
    ];
    let totalDeleted = 0;

    for (const role of rolesInvalides) {
      try {
        console.log(`⏳ Traitement du rôle "${role}"...`);
        const result = await prisma.$runCommandRaw({
          delete: "users",
          deletes: [{ q: { role: role }, limit: 0 }],
        });

        if (result.n > 0) {
          totalDeleted += result.n;
          console.log(`   ✅ ${result.n} supprimé(s)`);
        } else {
          console.log(`   ℹ️  Aucun`);
        }
      } catch (e) {
        console.log(`   ⚠️  Erreur: ${e.message}`);
      }
    }

    console.log("\n✅ Vérification des compte clés...");
    try {
      const auditor = await prisma.user.findUnique({
        where: { email: "audit@medifollow.health" },
      });
      if (auditor) {
        console.log(`   ✅ Auditor OK: ${auditor.email} (${auditor.role})`);
      }
    } catch (e) {
      console.log(`   ⚠️  Erreur auditor: ${e.message}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ NETTOYAGE COMPLET!");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Erreur fatal:", error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();

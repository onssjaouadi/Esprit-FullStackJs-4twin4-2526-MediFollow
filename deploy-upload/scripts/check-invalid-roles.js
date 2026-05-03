#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n🧹 NETTOYAGE DE LA BASE DE DONNÉES\n");

    console.log("Recherche des utilisateurs avec rôles invalides...");

    const invalidRoleUsers = await prisma.$runCommandRaw({
      find: "users",
      filter: {
        role: { $nin: ["PATIENT", "DOCTOR", "ADMIN", "AUDITOR"] },
      },
    });

    const users = invalidRoleUsers.cursor?.firstBatch || [];

    if (users.length === 0) {
      console.log("✅ Aucun utilisateur avec rôle invalide trouvé!\n");
      console.log("La base de données est propre.\n");
      process.exit(0);
    }

    console.log(`⚠️  ${users.length} utilisateur(s) avec rôle invalide trouvé(s):\n`);

    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} - Rôle: "${user.role}"`);
    });

    console.log("\n❌ OPTION 1: Supprimer les utilisateurs invalides");
    console.log("   npm run clean:db");

    console.log("\n✅ OPTION 2: Assigner un rôle valide");
    console.log("   npm run fix:roles");

    console.log("\n" + "=".repeat(70) + "\n");

  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

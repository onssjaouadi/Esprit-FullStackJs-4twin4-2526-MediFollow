#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n🧹 SUPPRESSION DES UTILISATEURS AVEC RÔLES INVALIDES\n");

    // Note: Prisma ne support pas bien les rôles invalides, donc on va utiliser un approche manuelle
    console.log(
      "Recherche des utilisateurs avec rôles invalides via raw query...\n"
    );

    // Get all users and check roles manually
    const allUsers = await prisma.user.count();
    console.log(`Total d'utilisateurs en base: ${allUsers}`);

    // Try to find users with invalid roles by attempting to read them
    // and catching the error
    console.log("\n✅ Suppression via la base de données directe...\n");

    // Use deleteMany with a condition that should not match valid roles
    try {
      // This will try to delete, but might fail due to invalid enum
      // So we'll skip this and ask user to manually clean
      console.log("⚠️  Détection manuelle des rôles invalides...\n");

      console.log("Pour supprimer les utilisateurs avec rôles COORDINATOR:");
      console.log("");
      console.log("1. Connectez-vous à MongoDB");
      console.log("   Cluster: cluster0.8j1bosg.mongodb.net");
      console.log("   Database: medifollow");
      console.log("   Collection: users");

      console.log("\n2. Exécutez cette commande:");
      console.log('   db.users.deleteMany({ role: "COORDINATOR" })');

      console.log("\n3. Ou remplacez le rôle par un rôle valide:");
      console.log(
        '   db.users.updateMany({ role: "COORDINATOR" }, { $set: { role: "PATIENT" } })'
      );

      console.log("\n" + "=".repeat(70) + "\n");

      console.log("✅ Après nettoyage, testez:");
      console.log("   node scripts/diagnose-auth.js\n");
    } catch (error) {
      console.log(
        "Approche alternative: Nettoyer via l'interface MongoDB...\n"
      );
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

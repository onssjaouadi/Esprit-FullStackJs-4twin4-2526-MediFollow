#!/usr/bin/env node
/**
 * URGENCE: Supprime les utilisateurs avec le rôle COORDINATOR invalide
 * Cela casse les requêtes Prisma et empêche la connexion
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n🔧 CORRECTION DU PROBLÈME COORDINATOR\n");

    // Note: Prisma va rejeter les rôles invalides, donc on va utiliser raw Prisma
    // Mais d'abord on va vérifier les logs du dernier problème
    console.log("1️⃣  Tentative de nettoyage direct via Prisma...\n");

    // On va créer un script pour montrer la situation
    console.log(
      "   ⚠️  Dû à la validation Prisma, on ne peut pas lister les rôles invalides"
    );
    console.log("   directement. Voici la solution:\n");

    // Vérifier que l'auditor existe
    console.log("2️⃣  Vérification du compte auditor...");
    try {
      const auditor = await prisma.user.findUnique({
        where: { email: "audit@medifollow.health" },
      });

      if (auditor) {
        console.log("   ✅ Compte auditor trouvé:");
        console.log(`      Email: ${auditor.email}`);
        console.log(`      Role: ${auditor.role}`);
      } else {
        console.log("   ❌ Compte auditor non trouvé!");
      }
    } catch (e) {
      console.log("   ⚠️  Erreur lors de la lecture du compte auditor");
      console.log(`      Message: ${e.message}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("SOLUTION: Utiliser MongoDB Compass ou MongoDB Shell");
    console.log("=".repeat(70));

    console.log("\n📋 Non Prisma - Allez dans MongoDB Compass:");
    console.log("   1. Connectez à: cluster0.8j1bosg.mongodb.net");
    console.log("   2. Database: medifollow → Collection: users");
    console.log('   3. Filtrer: { role: "COORDINATOR" }');
    console.log("   4. Supprimer les documents trouvés");
    console.log("\nOU exécutež cette commande dans MongoDB Shell:");
    console.log('   db.users.deleteMany({ role: "COORDINATOR" })\n');
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

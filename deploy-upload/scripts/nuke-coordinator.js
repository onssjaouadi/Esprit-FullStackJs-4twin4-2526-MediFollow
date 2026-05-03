#!/usr/bin/env node
/**
 * DESTRUCTEUR DE RÔLES INVALIDES
 * Utilise Prisma raw MongoDB query pour supprimer les COORDINATOR
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n💣 SUPPRESSION DES RÔLES COORDINATOR INVALIDES\n");

    console.log("1️⃣  Utilisation de la requête MongoDB raw...");

    // Utilise Prisma pour envoyer une requête raw MongoDB
    const result = await prisma.$runCommandRaw({
      delete: "users",
      deletes: [
        {
          q: { role: "COORDINATOR" },
          limit: 0, // 0 = supprimer tous les matching documents
        },
      ],
    });

    console.log(`   ✅ Requête exécutée`);
    console.log(`   📊 Résultat:`, result);

    // Vérifier que l'auditor existe toujours
    console.log("\n2️⃣  Vérification du compte auditor...");
    const auditor = await prisma.user.findUnique({
      where: { email: "audit@medifollow.health" },
    });

    if (auditor) {
      console.log("   ✅ Compte auditor toujours intact!");
      console.log(`      📧 ${auditor.email}`);
      console.log(`      👤 ${auditor.firstName} ${auditor.lastName}`);
      console.log(`      🔑 Rôle: ${auditor.role}`);

      console.log("\n" + "=".repeat(70));
      console.log("✅ Connexion devrait marcher maintenant!");
      console.log("=".repeat(70));
      console.log("\n📝 Testez avec:");
      console.log("   Email: audit@medifollow.health");
      console.log("   Mot de passe: Audit12345!\n");
    } else {
      console.log("   ❌ Compte auditor disparu!");
    }
  } catch (error) {
    console.log(
      "\n⚠️  Erreur avec $runCommandRaw, essai de l'approche manuelle...\n"
    );

    // Plan B: Utiliser Node.js child process pour mongosh
    console.log("3️⃣  Tentative avec mongosh CLI...");

    try {
      const { spawn } = require("child_process");

      // Construire la commande MongoDB
      const cmd = `db.users.deleteMany({ role: "COORDINATOR" })`;

      console.log(`   Commande: ${cmd}`);
      console.log("   ⏳ Execution...");

      // Essayer de lancer mongosh - c'est un attempt, ça peut échouer
      const child = spawn("mongosh", [process.env.DATABASE_URL, "--eval", cmd]);

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (data) => {
        output += data;
      });

      child.stderr.on("data", (data) => {
        errorOutput += data;
      });

      child.on("close", async (code) => {
        if (code === 0) {
          console.log("   ✅ Suppression réussie!");
          console.log("   " + output.split("\n").slice(-2).join("\n   "));
        } else {
          console.log("   ❌ mongosh non disponible");
          console.log(
            "\n💡 SOLUTION: Supprimer manuellement via MongoDB Compass:"
          );
          console.log("   1. Ouvrez MongoDB Compass");
          console.log("   2. Connectez: cluster0.8j1bosg.mongodb.net");
          console.log("   3. Database: medifollow → Collection: users");
          console.log('   4. Filtrer: { "role": "COORDINATOR" }');
          console.log("   5. Supprimer tous les documents trouvés");
        }

        await prisma.$disconnect();
      });
    } catch (e) {
      console.log("   ❌ mongosh not available:", e.message);
      console.log("\n💡 SOLUTION: Supprimer manuellement via MongoDB Compass");
      await prisma.$disconnect();
    }
  }
}

main();

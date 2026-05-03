#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n🔍 DIAGNOSTIC D'AUTHENTIFICATION\n");

    // 1. Vérifier la connexion à la base de données
    console.log("1️⃣  Vérification de la connexion à MongoDB...");
    try {
      const countUsers = await prisma.user.count();
      console.log("   ✅ Connexion MongoDB réussie\n");
    } catch (error) {
      console.log("❌ Erreur de connexion MongoDB:", error.message);
      process.exit(1);
    }

    // 2. Vérifier si le compte auditeur existe
    console.log("2️⃣  Recherche du compte auditeur...");
    const auditor = await prisma.user.findUnique({
      where: { email: "audit@medifollow.health" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!auditor) {
      console.log("❌ COMPTE AUDITEUR NON TROUVÉ!\n");
      console.log("Le compte audit@medifollow.health n'existe pas en base.\n");
      console.log("Solution: Créer le compte avec:");
      console.log("   node scripts/create-auditor.js\n");
      process.exit(1);
    }

    console.log("✅ Compte trouvé:\n");
    console.log(`   📧 Email: ${auditor.email}`);
    console.log(`   👤 Nom: ${auditor.firstName} ${auditor.lastName}`);
    console.log(`   🔑 Rôle: ${auditor.role}`);
    console.log(`   ✅ Actif: ${auditor.isActive}`);
    console.log(`   📅 Créé le: ${new Date(auditor.createdAt).toLocaleString("fr-FR")}\n`);

    // 3. Tester le mot de passe
    console.log("3️⃣  Vérification du mot de passe...");
    const testPassword = "Audit12345!";

    const userWithPassword = await prisma.user.findUnique({
      where: { email: "audit@medifollow.health" },
      select: {
        passwordHash: true,
      },
    });

    if (!userWithPassword?.passwordHash) {
      console.log("❌ Erreur: Hash du mot de passe vide!\n");
      process.exit(1);
    }

    const passwordMatch = await bcrypt.compare(testPassword, userWithPassword.passwordHash);

    if (passwordMatch) {
      console.log(`✅ Le mot de passe "${testPassword}" est correct\n`);
    } else {
      console.log(`❌ Le mot de passe "${testPassword}" est INCORRECT!\n`);
      console.log("Mots de passe à essayer:");
      console.log("   • Audit12345!");
      console.log("   • Test1234*");
      console.log("   • 12345678\n");
      console.log("Si le mot de passe correct est inconnu, réinitialiser le compte:");
      console.log("   node scripts/reset-auditor-password.js\n");
    }

    // 4. Vérifier les autres utilisateurs
    console.log("4️⃣  Utilisateurs dans le système...");
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
        take: 20,
      });

      if (users.length === 0) {
        console.log("⚠️  Aucun utilisateur en base!\n");
      } else {
        console.log(`✅ ${users.length} utilisateurs trouvés:\n`);
        users.forEach((user, i) => {
          console.log(`   ${i + 1}. ${user.email} (${user.role}) - ${user.isActive ? "🟢 Actif" : "🔴 Inactif"}`);
        });
        console.log("");
      }
    } catch (error) {
      console.log("⚠️  Erreur lors de la lecture des utilisateurs:", error.message);
      console.log("   (Il y a peut-être des rôles invalides en base de données)\n");
    }

    // 5. Vérifier les logs d'authentification (s'ils existent)
    console.log("5️⃣  Vérification des tentatives de connexion récentes...");
    try {
      const loginLogs = await prisma.auditLog.findMany({
        where: {
          action: "LOGIN",
        },
        orderBy: { timestamp: "desc" },
        take: 5,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (loginLogs.length === 0) {
        console.log("ℹ️  Aucun log de connexion enregistré (normal si c'est la première fois)\n");
      } else {
        console.log(`✅ ${loginLogs.length} connexions récentes:\n`);
        loginLogs.forEach((log, i) => {
          console.log(`   ${i + 1}. ${log.user.email} - ${new Date(log.timestamp).toLocaleString("fr-FR")}`);
        });
        console.log("");
      }
    } catch (error) {
      console.log("ℹ️  Logs de connexion non disponibles\n");
    }

    // 6. Diagnostic final
    console.log("\n" + "=".repeat(70));
    console.log("📊 DIAGNOSTIC FINAL");
    console.log("=".repeat(70));

    const issues = [];

    if (!auditor) {
      issues.push("Compte auditeur n'existe pas");
    } else if (!auditor.isActive) {
      issues.push("Compte auditeur est désactivé");
    }

    if (userWithPassword && !passwordMatch) {
      issues.push("Mot de passe incorrect");
    }

    if (issues.length === 0) {
      console.log("✅ AUCUN PROBLÈME DÉTECTÉ\n");
      console.log("Essayez de vous reconnecter avec:");
      console.log("   Email: audit@medifollow.health");
      console.log("   Mot de passe: Audit12345!\n");
      console.log("Si le problème persiste, vérifier:");
      console.log("   • Console du navigateur (erreurs JavaScript)");
      console.log("   • Logs du serveur Next.js");
      console.log("   • .env.local (DATABASE_URL correct?)");
      console.log("   • Cookies/LocalStorage (les supprimer et réessayer)");
    } else {
      console.log("❌ PROBLÈMES DÉTECTÉS:\n");
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      console.log("");
    }

    console.log("=".repeat(70) + "\n");

  } catch (error) {
    console.error("❌ Erreur lors du diagnostic:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

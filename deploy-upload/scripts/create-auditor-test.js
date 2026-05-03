#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n📋 Création du compte Auditeur Test...\n");

    // Create test auditor account
    const email = "auditor.test@medifollow.health";
    const password = "Auditor@123456";

    // Check if auditor already exists
    const existingAuditor = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAuditor) {
      console.log(`⚠️  Auditeur existe déjà: ${email}`);
      console.log(`\n📧 Email: ${email}`);
      console.log(`🔐 Mot de passe: ${password}`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create auditor user
    const auditor = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: "Test",
        lastName: "Auditor",
        role: "AUDITOR",
        isActive: true,
      },
    });

    console.log("✅ Compte Auditeur Test créé avec succès!");
    console.log("\n📊 Informations d'accès:");
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔐 Mot de passe: ${password}`);
    console.log(`   👤 Rôle: AUDITOR`);
    console.log("\n🎯 Fonctionnalités disponibles:");
    console.log("   ✅ Tableau de bord d'audit");
    console.log("   ✅ Consulter tous les logs d'audit");
    console.log("   ✅ Gérer les utilisateurs");
    console.log("   ✅ Voir l'historique des modifications");
    console.log("   ✅ Générer des rapports");
    console.log("   ✅ Consulter les incidents");
    console.log("   ✅ Voir les patients (lecture seule)");
    console.log("\n🌐 Lien d'accès: http://localhost:3000/login\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

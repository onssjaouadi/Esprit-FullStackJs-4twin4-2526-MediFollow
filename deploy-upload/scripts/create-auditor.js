#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n📋 Création du compte Auditeur...\n");

    // Create auditor account
    const email = "audit@medifollow.health";
    const password = "Audit12345!";

    // Check if auditor already exists
    const existingAuditor = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAuditor) {
      console.log(`⚠️  Auditeur existe déjà: ${email}`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create auditor user
    const auditor = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: "Audit",
        lastName: "Manager",
        role: "AUDITOR",
        isActive: true,
      },
    });

    console.log("✅ Compte Auditeur créé avec succès!");
    console.log("\n📊 Informations d'accès:");
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔐 Mot de passe: ${password}`);
    console.log(`   👤 Rôle: AUDITOR`);
    console.log("\n🎯 Accès disponibles:");
    console.log("   ✅ Consulter tous les logs d'audit");
    console.log("   ✅ Voir l'historique des connexions");
    console.log("   ✅ Consulter les modifications de patients");
    console.log("   ✅ Vérifier les modifications de signes vitaux");
    console.log("   ✅ Voir l'historique des alertes");
    console.log("   ✅ Générer des rapports d'audit");
    console.log("\n🔗 URL d'accès: /admin/audit");
    console.log("=".repeat(70));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

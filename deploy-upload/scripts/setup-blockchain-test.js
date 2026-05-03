#!/usr/bin/env node

/**
 * Script pour configurer la blockchain pour les tests
 * Assigne l'adresse uniquement à walaeddine1207@gmail.com
 * Les autres utilisateurs n'auront pas d'accès blockchain
 */

// Load environment variables
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Configuration de la blockchain pour les tests...\n");
  console.log("=".repeat(60));

  const platformAddress = process.env.APTOS_ACCOUNT_ADDRESS;
  const authorizedEmail = "walaeddine1207@gmail.com";

  if (!platformAddress) {
    console.error("❌ APTOS_ACCOUNT_ADDRESS not found in .env");
    process.exit(1);
  }

  console.log(`\n📋 Platform Address: ${platformAddress}`);
  console.log(`✅ Authorized Doctor: ${authorizedEmail}`);

  // 1. Supprimer toutes les adresses blockchain
  console.log("\n📝 Step 1: Removing all blockchain addresses...");
  await prisma.user.updateMany({
    data: { blockchainAddress: null },
  });
  console.log("✅ All blockchain addresses removed");

  // 2. Assigner l'adresse uniquement au docteur autorisé
  console.log(
    `\n📝 Step 2: Assigning blockchain address to ${authorizedEmail}...`
  );
  const authorizedDoctor = await prisma.user.findUnique({
    where: { email: authorizedEmail },
  });

  if (!authorizedDoctor) {
    console.error(`❌ User ${authorizedEmail} not found`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email: authorizedEmail },
    data: { blockchainAddress: platformAddress },
  });
  console.log(`✅ ${authorizedEmail} -> ${platformAddress}`);

  // 3. Afficher le résumé
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Configuration réussie!\n");

  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      blockchainAddress: true,
    },
    orderBy: { role: "asc" },
  });

  console.log("📊 État des utilisateurs:");
  console.log("");
  for (const user of allUsers) {
    const hasAccess = user.blockchainAddress ? "✅" : "❌";
    const address = user.blockchainAddress ? "0x43f2...347f1" : "Aucune";
    console.log(
      `  ${hasAccess} [${user.role.padEnd(7)}] ${user.email.padEnd(35)} - ${address}`
    );
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Configuration terminée!");
  console.log(
    `\n⚠️  Seul ${authorizedEmail} peut accéder aux données blockchain`
  );
  console.log(
    '   Les autres utilisateurs verront "Blockchain verification disabled"\n'
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("\n💥 Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

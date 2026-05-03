#!/usr/bin/env node

/**
 * Script pour assigner les adresses blockchain aux utilisateurs
 * Assigne l'adresse blockchain de la plateforme aux docteurs
 */

// Load environment variables
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔗 Assigning blockchain addresses to users...\n");
  console.log("=".repeat(60));

  const platformAddress = process.env.APTOS_ACCOUNT_ADDRESS;

  if (!platformAddress) {
    console.error("❌ APTOS_ACCOUNT_ADDRESS not found in .env");
    process.exit(1);
  }

  console.log(`\n📋 Platform Address: ${platformAddress}`);

  // Get all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      blockchainAddress: true,
    },
  });

  console.log(`\n📊 Total users: ${allUsers.length}`);

  const usersToUpdate = allUsers.filter(
    (user) => !user.blockchainAddress || user.blockchainAddress === ""
  );

  console.log(
    `\n🔄 Found ${usersToUpdate.length} user(s) without blockchain address`
  );

  if (usersToUpdate.length === 0) {
    console.log("✅ All users already have blockchain addresses");
    return;
  }

  // Update each user
  for (const user of usersToUpdate) {
    console.log(`\n  Updating ${user.role}: ${user.email}...`);
    await prisma.user.update({
      where: { id: user.id },
      data: { blockchainAddress: platformAddress },
    });
    console.log(`  ✅ ${user.email} -> ${platformAddress}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Blockchain addresses assigned successfully!\n");
  console.log("📋 Summary:");
  console.log(`   - ${usersToUpdate.length} user(s) updated`);
  console.log(`   - Platform address: ${platformAddress}`);
  console.log("\n✅ You can now use blockchain verification!");
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

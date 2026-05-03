#!/usr/bin/env node
/**
 * Assign an individual Aptos wallet to a specific user by email.
 * Usage: node scripts/assign-wallet-to-user.js <email>
 */

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { Account } = require("@aptos-labs/ts-sdk");
const crypto = require("crypto");

const prisma = new PrismaClient();

// ---------- encryption (mirrors lib/encryption.ts) ----------
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey() {
  const keyHex = process.env.WALLET_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      "WALLET_ENCRYPTION_KEY must be a 64-char hex string in .env"
    );
  }
  return Buffer.from(keyHex, "hex");
}

function encryptPrivateKey(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}
// ------------------------------------------------------------

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node scripts/assign-wallet-to-user.js <email>");
    process.exit(1);
  }

  console.log(`\n🔍 Looking up user: ${email}\n`);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      blockchainAddress: true,
    },
  });

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Found: ${user.firstName} ${user.lastName} (${user.role})`);

  if (user.blockchainAddress) {
    console.log(`⚠️  Already has wallet: ${user.blockchainAddress}`);
    console.log("   Pass --force to regenerate.");
    const force = process.argv.includes("--force");
    if (!force) {
      await prisma.$disconnect();
      return;
    }
    console.log("   --force flag detected, regenerating...\n");
  }

  // Generate new keypair
  const account = Account.generate();
  const address = account.accountAddress.toString();
  const privateKey = account.privateKey.toString();
  const encryptedKey = encryptPrivateKey(privateKey);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      blockchainAddress: address,
      blockchainPrivateKey: encryptedKey,
    },
  });

  console.log("🎉 Wallet assigned successfully!\n");
  console.log(`   Address   : ${address}`);
  console.log(`   Private Key (raw, keep secret): ${privateKey}`);
  console.log(`   Stored in DB (AES-256-GCM encrypted): ✅`);
  console.log(
    `\n🔗 Explorer: https://explorer.aptoslabs.com/account/${address}?network=testnet\n`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Assign individual Aptos wallets to ALL patients (and doctors) who don't have one.
 * Safe to run multiple times — skips users that already have a wallet.
 *
 * Usage:
 *   node scripts/assign-wallets-all-patients.js
 *   node scripts/assign-wallets-all-patients.js --role PATIENT   (patients only)
 *   node scripts/assign-wallets-all-patients.js --role DOCTOR    (doctors only)
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

async function assignWallet(user) {
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

  return address;
}

async function main() {
  const roleFilter = (() => {
    const idx = process.argv.indexOf("--role");
    return idx !== -1 ? process.argv[idx + 1] : null;
  })();

  console.log("\n🔗 Assigning Aptos wallets to users without one...");
  console.log("=".repeat(60));

  if (roleFilter) {
    console.log(`🎯 Filtering by role: ${roleFilter}`);
  }

  const whereClause = {
    blockchainAddress: null,
    ...(roleFilter ? { role: roleFilter } : {}),
  };

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      blockchainAddress: true,
    },
  });

  if (users.length === 0) {
    console.log("\n✅ All users already have wallets. Nothing to do.\n");
    return;
  }

  console.log(`\n📊 Found ${users.length} user(s) without a wallet:\n`);

  let assigned = 0;
  let errors = 0;

  for (const user of users) {
    process.stdout.write(
      `  [${user.role.padEnd(7)}] ${user.email.padEnd(40)} → `
    );
    try {
      const address = await assignWallet(user);
      console.log(`✅ ${address}`);
      assigned++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Done: ${assigned} wallet(s) assigned, ${errors} error(s).`);

  if (assigned > 0) {
    console.log("\n🔁 Re-run any time — already-assigned wallets are skipped.");
    console.log(
      "🔍 Verify on Aptos Explorer: https://explorer.aptoslabs.com/?network=testnet"
    );
  }

  console.log();
}

main()
  .catch((err) => {
    console.error("\n💥 Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

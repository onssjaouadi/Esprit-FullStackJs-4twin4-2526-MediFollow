#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { Account } = require("@aptos-labs/ts-sdk");
const crypto = require("crypto");

const prisma = new PrismaClient();

function encryptPrivateKey(plaintext) {
  const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
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

async function main() {
  const email = "walaeddinne.riahii@gmail.com";
  const password = "Wallou12@";
  const firstName = "Kamel";
  const lastName = "Gharbi";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("❌ Email déjà utilisé:", email);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const account = Account.generate();
  const address = account.accountAddress.toString();
  const privateKey = account.privateKey.toString();
  const encryptedKey = encryptPrivateKey(privateKey);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: "DOCTOR",
      isActive: true,
      blockchainAddress: address,
      blockchainPrivateKey: encryptedKey,
    },
  });

  console.log("\n✅ Docteur créé avec succès !");
  console.log("   ID     :", user.id);
  console.log("   Email  :", user.email);
  console.log("   Nom    :", user.firstName, user.lastName);
  console.log("   Rôle   :", user.role);
  console.log("   Wallet :", address);
  console.log(
    "\n🔗 Explorer:",
    `https://explorer.aptoslabs.com/account/${address}?network=testnet`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

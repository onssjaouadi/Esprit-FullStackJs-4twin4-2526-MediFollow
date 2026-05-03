#!/usr/bin/env node

/**
 * Script pour changer le password d'un utilisateur
 */

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const email = "patient.cardiac3@medifollow.health";
  const newPassword = "Test123*";

  console.log("\n" + "=".repeat(70));
  console.log("  🔑 Password Reset Script");
  console.log("=".repeat(70) + "\n");

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}\n`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);

    // Hash new password using bcrypt
    console.log("🔐 Hashing new password...");
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    // Update user password
    console.log("💾 Updating database...");
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
      select: { email: true, updatedAt: true },
    });

    console.log("\n" + "=".repeat(70));
    console.log("✅ PASSWORD UPDATED SUCCESSFULLY");
    console.log("=".repeat(70));
    console.log(`\n📧 Email: ${updatedUser.email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`⏰ Updated at: ${updatedUser.updatedAt}\n`);

    console.log("💡 The user can now login with the new password.\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

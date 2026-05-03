/**
 * MediFollow — SuperAdmin Seed Script
 * ─────────────────────────────────────────────────────────────
 * Creates the initial SuperAdmin account directly in the database.
 * SuperAdmin accounts CANNOT be created through the UI — only via this script.
 *
 * Usage:
 *   npx ts-node scripts/seed-superadmin.ts
 *   -- or with environment overrides --
 *   SA_EMAIL="sa@example.com" SA_PASSWORD="yourpassword" npx ts-node scripts/seed-superadmin.ts
 *
 * Environment variables (optional, defaults shown):
 *   SA_EMAIL       default: superadmin@medifolllow.local
 *   SA_PASSWORD    default: (auto-generated, printed to console)
 *   SA_FIRST_NAME  default: Super
 *   SA_LAST_NAME   default: Admin
 *   SA_MAX_COUNT   default: 3  (max simultaneous SuperAdmins allowed)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MAX_SUPERADMINS = parseInt(process.env.SA_MAX_COUNT ?? "3", 10);

function genPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  return Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   MediFollow — SuperAdmin Seed Script    ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Check existing SuperAdmin count
  const existing = await (prisma as any).user.count({
    where: { role: "SUPERADMIN", isDeleted: false },
  });

  if (existing >= MAX_SUPERADMINS) {
    console.error(
      `❌ Cannot create SuperAdmin: maximum of ${MAX_SUPERADMINS} already exist (found ${existing}).`
    );
    console.error(
      "   Increase SA_MAX_COUNT env variable or deactivate an existing SuperAdmin in the database."
    );
    process.exit(1);
  }

  const email = process.env.SA_EMAIL ?? "superadmin@medifollow.local";
  const firstName = process.env.SA_FIRST_NAME ?? "Super";
  const lastName = process.env.SA_LAST_NAME ?? "Admin";
  const plainPassword = process.env.SA_PASSWORD ?? genPassword();

  // Check if this email is already taken
  const emailTaken = await (prisma as any).user.findUnique({ where: { email } });
  if (emailTaken) {
    console.error(`❌ Email "${email}" is already in use by another account.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const superAdmin = await (prisma as any).user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: "SUPERADMIN",
      isActive: true,
      isSuspended: false,
      isDeleted: false,
      forcePasswordChange: !process.env.SA_PASSWORD, // force change only if auto-generated
      languagePreference: "en",
    },
  });

  // Write a self-audit log entry
  await (prisma as any).superAuditLog.create({
    data: {
      actorId: superAdmin.id,
      actorName: `${firstName} ${lastName}`,
      actorRole: "SUPERADMIN",
      action: "SUPERADMIN_SEEDED",
      targetId: superAdmin.id,
      targetName: `${firstName} ${lastName}`,
      targetRole: "SUPERADMIN",
      severity: "CRITICAL",
      reason: "Initial SuperAdmin account seeded via CLI script",
    },
  });

  console.log("✅ SuperAdmin created successfully!\n");
  console.log("  ID:         " + superAdmin.id);
  console.log("  Email:      " + email);
  console.log("  Name:       " + firstName + " " + lastName);
  if (!process.env.SA_PASSWORD) {
    console.log("\n  ⚠️  AUTO-GENERATED PASSWORD (save this now — it will not be shown again):");
    console.log("  Password:   " + plainPassword);
    console.log("\n  The user will be prompted to change their password on first login.");
  }
  console.log("\n  SuperAdmin count: " + (existing + 1) + " / " + MAX_SUPERADMINS);
  console.log("\nDone. Navigate to /superadmin after logging in.\n");
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

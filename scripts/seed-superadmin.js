// MediFollow — SuperAdmin Seed (plain JS, no compilation needed)
// Usage: node scripts/seed-superadmin.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const EMAIL    = process.env.SA_EMAIL    || "superadmin@medifollow.local";
const PASSWORD = process.env.SA_PASSWORD || "SuperAdmin@2026!";
const FIRST    = process.env.SA_FIRST    || "Super";
const LAST     = process.env.SA_LAST     || "Admin";

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   MediFollow — SuperAdmin Seed Script    ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    if (existing.role === "SUPERADMIN") {
      console.log("⚠️  SuperAdmin with this email already exists:");
      console.log("   ID:    " + existing.id);
      console.log("   Email: " + existing.email);
      console.log("\nUse the existing credentials to log in.\n");
      return;
    }
    console.error("❌ Email is already used by a " + existing.role + " account.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      email:              EMAIL,
      passwordHash,
      firstName:          FIRST,
      lastName:           LAST,
      role:               "SUPERADMIN",
      isActive:           true,
      isSuspended:        false,
      isDeleted:          false,
      forcePasswordChange: false,
      languagePreference: "en",
    },
  });

  console.log("✅ SuperAdmin created!\n");
  console.log("  Email:    " + user.email);
  console.log("  Password: " + PASSWORD);
  console.log("  Login at: http://localhost:3000/login");
  console.log("  Portal:   http://localhost:3000/superadmin\n");
}

main()
  .catch((e) => { console.error("Fatal:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());

#!/usr/bin/env node
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "arij@medifollow.health";

  const user = await prisma.user.findUnique({
    where: { email },
    include: { doctorProfile: true },
  });

  if (!user) {
    console.log("❌ Aucun utilisateur trouvé avec l'email:", email);
    process.exit(1);
  }

  console.log("\n✅ Compte médecin trouvé !");
  console.log("   ID      :", user.id);
  console.log("   Email   :", user.email);
  console.log("   Nom     :", user.firstName, user.lastName);
  console.log("   Rôle    :", user.role);
  console.log("   Actif   :", user.isActive);
  console.log("   Wallet  :", user.blockchainAddress);

  if (user.doctorProfile) {
    console.log("\n📋 Profil Médecin:");
    console.log(
      "   Spécialité:",
      user.doctorProfile.specialty || "Non définie"
    );
    console.log("   Bio       :", user.doctorProfile.bio || "Non définie");
    console.log("   Téléphone :", user.doctorProfile.phone || "Non défini");
    console.log(
      "   Localisation:",
      user.doctorProfile.location || "Non définie"
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

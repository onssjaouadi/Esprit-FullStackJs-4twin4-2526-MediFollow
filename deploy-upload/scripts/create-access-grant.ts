#!/usr/bin/env node

/**
 * Script pour créer un AccessGrant en base de données
 * Permet à un docteur/admin d'accéder aux données d'un patient
 *
 * Usage:
 * npx tsx scripts/create-access-grant.ts
 * ou
 * npx tsx scripts/create-access-grant.ts <doctorEmail> <patientEmail>
 */

import prisma from "@/lib/prisma";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  🔐 Créer un AccessGrant (Doctor -> Patient Access)");
  console.log("=".repeat(60) + "\n");

  try {
    // Get doctor email from args or prompt
    let doctorEmail = process.argv[2];
    if (!doctorEmail) {
      doctorEmail = await question("📧 Email du Docteur/Admin: ");
    }

    if (!doctorEmail.trim()) {
      console.error("\n❌ Email du docteur requis");
      process.exit(1);
    }

    // Get patient email from args or prompt
    let patientEmail = process.argv[3];
    if (!patientEmail) {
      patientEmail = await question("👤 Email du Patient: ");
    }

    if (!patientEmail.trim()) {
      console.error("\n❌ Email du patient requis");
      process.exit(1);
    }

    console.log("\n⏳ Traitement en cours...\n");

    // Find doctor
    const doctor = await prisma.user.findUnique({
      where: { email: doctorEmail.toLowerCase() },
      select: { id: true, email: true, role: true },
    });

    if (!doctor) {
      console.error(`❌ Docteur avec l'email "${doctorEmail}" non trouvé\n`);
      process.exit(1);
    }

    if (doctor.role !== "DOCTOR" && doctor.role !== "ADMIN") {
      console.error(
        `❌ L'utilisateur doit avoir le rôle DOCTOR ou ADMIN (rôle actuel: ${doctor.role})\n`
      );
      process.exit(1);
    }

    // Find patient
    const patient = await prisma.user.findUnique({
      where: { email: patientEmail.toLowerCase() },
      select: { id: true, email: true, role: true },
    });

    if (!patient) {
      console.error(`❌ Patient avec l'email "${patientEmail}" non trouvé\n`);
      process.exit(1);
    }

    if (patient.role !== "PATIENT") {
      console.error(
        `❌ L'utilisateur doit avoir le rôle PATIENT (rôle actuel: ${patient.role})\n`
      );
      process.exit(1);
    }

    // Check if AccessGrant already exists
    const existingGrant = await prisma.accessGrant.findFirst({
      where: {
        doctorId: doctor.id,
        patientId: patient.id,
      },
    });

    if (existingGrant) {
      console.log("⚠️  AccessGrant déjà existant:");
      console.log(`   ID: ${existingGrant.id}`);
      console.log(`   Docteur: ${doctor.email}`);
      console.log(`   Patient: ${patient.email}`);
      console.log(`   Actif: ${existingGrant.isActive ? "✅ Oui" : "❌ Non"}`);
      console.log(
        `   Accordé le: ${existingGrant.grantedAt.toLocaleDateString()}\n`
      );

      if (!existingGrant.isActive) {
        const reactivate = await question(
          "  Réactiver cet AccessGrant? (oui/non): "
        );
        if (
          reactivate.toLowerCase() === "oui" ||
          reactivate.toLowerCase() === "yes"
        ) {
          await prisma.accessGrant.update({
            where: { id: existingGrant.id },
            data: { isActive: true, updatedAt: new Date() },
          });
          console.log("\n✅ AccessGrant réactivé avec succès!\n");
        }
      }
      process.exit(0);
    }

    // Create AccessGrant
    const accessGrant = await prisma.accessGrant.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        isActive: true,
        grantedAt: new Date(),
      },
      select: {
        id: true,
        grantedAt: true,
        isActive: true,
      },
    });

    console.log("✅ AccessGrant créé avec succès!\n");
    console.log("📋 Détails:");
    console.log(`   ID: ${accessGrant.id}`);
    console.log(`   Docteur: ${doctor.email} (${doctor.role})`);
    console.log(`   Patient: ${patient.email}`);
    console.log(
      `   Statut: ${accessGrant.isActive ? "✅ Actif" : "❌ Inactif"}`
    );
    console.log(`   Accordé le: ${accessGrant.grantedAt.toLocaleDateString()}`);
    console.log("\n");

    // Ask to create more
    const createMore = await question(
      "Créer un autre AccessGrant? (oui/non): "
    );
    if (
      createMore.toLowerCase() === "oui" ||
      createMore.toLowerCase() === "yes"
    ) {
      rl.close();
      const newProcess = require("child_process").spawn("npx", [
        "tsx",
        "scripts/create-access-grant.ts",
      ]);
      newProcess.on("exit", (code) => process.exit(code));
    } else {
      console.log("👋 Au revoir!\n");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

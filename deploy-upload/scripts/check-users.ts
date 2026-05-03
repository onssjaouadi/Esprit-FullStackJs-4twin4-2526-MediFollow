#!/usr/bin/env node

/**
 * Check who is logged in by looking at the session/auth storage
 */

import prisma from "@/lib/prisma";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  👤 Users in Database");
  console.log("=".repeat(70) + "\n");

  try {
    // Get all users by role
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const patients = await prisma.user.findMany({
      where: { role: "PATIENT" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log("👨‍⚕️  DOCTORS:");
    doctors.forEach((user) => {
      console.log(`   ${user.email} (ID: ${user.id})`);
    });

    console.log("\n🧑‍🤝‍🧑 PATIENTS:");
    patients.forEach((user) => {
      console.log(`   ${user.email} (ID: ${user.id})`);
    });

    console.log("\n👨‍💼 ADMINS:");
    admins.forEach((user) => {
      console.log(`   ${user.email} (ID: ${user.id})`);
    });

    console.log("=".repeat(70));
    console.log("\n💡 Make sure you are logged in as the DOCTOR user!");
    console.log("   Credentials: doctor@medifollow.health\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

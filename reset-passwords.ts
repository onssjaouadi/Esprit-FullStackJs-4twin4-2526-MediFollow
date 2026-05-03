/**
 * Reset Demo User Passwords Script
 * Updates existing users to use the correct demo passwords
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPasswords() {
  console.log("🔑 Resetting demo user passwords...");

  try {
    // Hash the correct passwords
    const adminPassword = await bcrypt.hash("Admin@123456", 10);
    const doctorPassword = await bcrypt.hash("Doctor@123456", 10);
    const patientPassword = await bcrypt.hash("Patient@123456", 10);

    // Update admin user
    const adminUpdate = await prisma.user.updateMany({
      where: { email: "admin@medifollow.health" },
      data: { passwordHash: adminPassword, isActive: true }
    });
    console.log(`✅ Updated ${adminUpdate.count} admin user(s)`);

    // Update doctor user
    const doctorUpdate = await prisma.user.updateMany({
      where: { email: "doctor@medifollow.health" },
      data: { passwordHash: doctorPassword, isActive: true }
    });
    console.log(`✅ Updated ${doctorUpdate.count} doctor user(s)`);

    // Update patient user
    const patientUpdate = await prisma.user.updateMany({
      where: { email: "patient@medifollow.health" },
      data: { passwordHash: patientPassword, isActive: true }
    });
    console.log(`✅ Updated ${patientUpdate.count} patient user(s)`);

    console.log("\n🎉 Password reset complete!");
    console.log("Login credentials:");
    console.log("Admin: admin@medifollow.health / Admin@123456");
    console.log("Doctor: doctor@medifollow.health / Doctor@123456");
    console.log("Patient: patient@medifollow.health / Patient@123456");

  } catch (error) {
    console.error("❌ Error resetting passwords:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
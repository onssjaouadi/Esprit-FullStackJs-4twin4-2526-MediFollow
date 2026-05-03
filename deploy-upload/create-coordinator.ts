/**
 * Script to create or update coordinator account for testing
 * Run: npx ts-node create-coordinator.ts
 */

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/utils";

const COORDINATOR_EMAIL = "coordinator@medifollow.health";
const COORDINATOR_PASSWORD = "Coordinator@123456"; // Default test password

async function main() {
  try {
    console.log("🔧 Setting up coordinator account...");

    // Check if coordinator exists
    let coordinator = await prisma.user.findUnique({
      where: { email: COORDINATOR_EMAIL },
    });

    if (coordinator) {
      console.log(`✅ Coordinator already exists: ${coordinator.email}`);
      console.log(`📝 ID: ${coordinator.id}`);
    } else {
      console.log(`📝 Creating new coordinator account...`);

      const hashedPassword = await hashPassword(COORDINATOR_PASSWORD);

      coordinator = await prisma.user.create({
        data: {
          email: COORDINATOR_EMAIL,
          passwordHash: hashedPassword,
          firstName: "Dr.",
          lastName: "Coordinator",
          role: "COORDINATOR",
          isActive: true,
          isApproved: true,
        },
      });

      console.log(`✅ Coordinator created successfully!`);
      console.log(`📧 Email: ${coordinator.email}`);
      console.log(`🔑 Password: ${COORDINATOR_PASSWORD}`);
      console.log(`📝 ID: ${coordinator.id}`);
    }

    console.log("\n✨ You can now log in with:");
    console.log(`Email: ${COORDINATOR_EMAIL}`);
    console.log(`Password: ${COORDINATOR_PASSWORD}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

#!/usr/bin/env node

/**
 * Reset test nurse account - Remove and recreate test data
 * Usage: node scripts/reset-test-nurse.js
 */

const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient({
  errorFormat: "pretty",
});

async function hashPassword(password) {
  return bcryptjs.hash(password, 12);
}

async function resetTestNurse() {
  try {
    console.log("🔄 Resetting test nurse account...\n");

    const email = "nurse@test.com";

    // Find existing nurse
    const existingNurse = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingNurse) {
      console.log("ℹ️  No existing test nurse found. Creating new one...\n");
    } else {
      console.log("🗑️  Deleting existing test nurse...");

      // Delete patient reminders first
      await prisma.patientReminder.deleteMany({
        where: { nurseId: existingNurse.id },
      });
      console.log("   ✓ Deleted patient reminders");

      // Delete alerts acknowledged/resolved by this nurse
      await prisma.alert.deleteMany({
        where: {
          OR: [
            { acknowledgedById: existingNurse.id },
            { resolvedById: existingNurse.id },
          ],
        },
      });
      console.log("   ✓ Deleted related alerts");

      // Delete nurse profile
      await prisma.nurseProfile.delete({
        where: { userId: existingNurse.id },
      });
      console.log("   ✓ Deleted nurse profile");

      // Delete user
      await prisma.user.delete({
        where: { id: existingNurse.id },
      });
      console.log("   ✓ Deleted user account\n");
    }

    // Now create new test nurse
    const password = "TestNurse@2024";
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: "Infirmière",
        lastName: "Test",
        phoneNumber: "+33612345678",
        role: "NURSE",
        isActive: true,
        mustChangePassword: false,
      },
    });

    console.log("✅ User created:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}\n`);

    // Create nurse profile
    const nurseProfile = await prisma.nurseProfile.create({
      data: {
        userId: user.id,
        licenseNumber: "INF2024001",
        bio: "Infirmière de test pour développement",
        phone: "+33612345678",
        location: "Paris, France",
        specialization: "Soins généraux",
        assignedPatients: [],
      },
    });

    console.log("✅ Nurse profile created:");
    console.log(`   License: ${nurseProfile.licenseNumber}\n`);

    // Fetch patients
    const patients = await prisma.patient.findMany({
      take: 5,
      include: { user: true },
    });

    console.log(`📋 Found ${patients.length} patients\n`);

    // Create patient reminders
    for (const patient of patients) {
      await prisma.patientReminder.create({
        data: {
          nurseId: user.id,
          patientId: patient.id,
          title: `Initial check-in for ${patient.user?.firstName}`,
          message: "Patient assigned to this nurse",
          reminderType: "FOLLOW_UP",
          scheduledFor: new Date(),
          priority: "NORMAL",
          isSent: false,
          isRead: false,
        },
      });
      console.log(
        `   ✓ Assigned ${patient.user?.firstName} ${patient.user?.lastName}`
      );
    }

    console.log(`\n✅ Created ${patients.length} patient assignments\n`);

    // Create sample alerts
    const alertCount = Math.min(3, patients.length);
    for (let i = 0; i < alertCount; i++) {
      const patient = patients[i];
      await prisma.alert.create({
        data: {
          patientId: patient.id,
          alertType: ["VITAL", "SYMPTOM", "MEDICATION"][i % 3],
          severity: ["MEDIUM", "HIGH", "CRITICAL"][i % 3],
          message: `Test alert for ${patient.user?.firstName}`,
          status: i === 0 ? "OPEN" : i === 1 ? "ACKNOWLEDGED" : "RESOLVED",
          acknowledgedById: i > 0 ? user.id : null,
          acknowledgedAt: i > 0 ? new Date() : null,
        },
      });
      console.log(`   ✓ Created alert`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ TEST NURSE ACCOUNT RESET SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("\n📝 Test Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n🔗 Login: http://localhost:3000/login\n");
  } catch (error) {
    console.error("❌ Error resetting test nurse:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetTestNurse();

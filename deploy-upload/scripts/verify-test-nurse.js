#!/usr/bin/env node

/**
 * Verify test nurse account exists
 * Usage: node scripts/verify-test-nurse.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  errorFormat: "pretty",
});

async function verifyTestNurse() {
  try {
    console.log("🔍 Verifying test nurse account...\n");

    const email = "nurse@test.com";

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        nurseProfile: true,
      },
    });

    if (!user) {
      console.log("❌ Test nurse account NOT FOUND");
      console.log("\n📝 To create test account, run:");
      console.log("   node scripts/create-test-nurse.js\n");
      await prisma.$disconnect();
      return;
    }

    console.log("✅ TEST NURSE ACCOUNT EXISTS\n");
    console.log("📋 User Information:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Created: ${user.createdAt.toLocaleString("fr")}`);

    if (user.nurseProfile) {
      console.log("\n🏥 Nurse Profile:");
      console.log(`   License: ${user.nurseProfile.licenseNumber}`);
      console.log(`   Phone: ${user.nurseProfile.phone}`);
      console.log(`   Location: ${user.nurseProfile.location}`);
      console.log(`   Specialization: ${user.nurseProfile.specialization}`);
    }

    // Get assigned patients
    const reminders = await prisma.patientReminder.findMany({
      where: { nurseId: user.id },
      distinct: ["patientId"],
      select: {
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (reminders.length > 0) {
      console.log(`\n👥 Assigned Patients (${reminders.length}):`);
      reminders.forEach((r, i) => {
        console.log(
          `   ${i + 1}. ${r.patient.user.firstName} ${r.patient.user.lastName}`
        );
      });
    }

    // Get alerts
    const alerts = await prisma.alert.findMany({
      where: {
        OR: [{ acknowledgedById: user.id }, { resolvedById: user.id }],
      },
    });

    if (alerts.length > 0) {
      const openAlerts = alerts.filter((a) => a.status === "OPEN");
      const ackAlerts = alerts.filter((a) => a.status === "ACKNOWLEDGED");
      const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED");

      console.log(`\n🔔 Alert Statistics:`);
      console.log(`   Total: ${alerts.length}`);
      console.log(`   Open: ${openAlerts.length}`);
      console.log(`   Acknowledged: ${ackAlerts.length}`);
      console.log(`   Resolved: ${resolvedAlerts.length}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("📝 Login Credentials:");
    console.log("   Email: nurse@test.com");
    console.log("   Password: TestNurse@2024");
    console.log("\n🔗 Dashboard: http://localhost:3000/dashboard/nurse");
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("❌ Error verifying test nurse:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestNurse();

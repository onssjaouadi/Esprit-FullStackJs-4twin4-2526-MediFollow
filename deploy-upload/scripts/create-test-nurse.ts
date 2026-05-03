import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/utils";
import { encryptPrivateKey } from "@/lib/encryption";

/**
 * Create test nurse account for development
 */
async function createTestNurse() {
  try {
    console.log("🏥 Creating test nurse account...\n");

    // Test nurse credentials
    const email = "nurse@test.com";
    const password = "TestNurse@2024";
    const firstName = "Infirmière";
    const lastName = "Test";

    // Hash password
    const passwordHash = await hashPassword(password);

    // Check if nurse already exists
    const existingNurse = await prisma.user.findUnique({
      where: { email },
    });

    if (existingNurse) {
      console.log("⚠️  Nurse already exists with email:", email);
      console.log("Skipping creation...\n");
      return;
    }

    // Create user with NURSE role
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phoneNumber: "+33612345678",
        role: "NURSE",
        isActive: true,
        mustChangePassword: false,
      },
    });

    console.log("✅ User created:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}\n`);

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
    console.log(`   License: ${nurseProfile.licenseNumber}`);
    console.log(`   Specialization: ${nurseProfile.specialization}\n`);

    // Fetch test patients
    const patients = await prisma.patient.findMany({
      take: 5,
      include: {
        user: true,
      },
    });

    console.log(`📋 Found ${patients.length} patients to assign\n`);

    // Create patient reminders to assign patients to nurse
    const reminders = [];
    for (const patient of patients) {
      const reminder = await prisma.patientReminder.create({
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
      reminders.push(reminder);
      console.log(
        `   ✓ Assigned ${patient.user?.firstName} ${patient.user?.lastName}`
      );
    }

    console.log(`\n✅ Created ${reminders.length} patient assignments\n`);

    // Create sample alerts for assigned patients
    const alertCount = Math.min(3, patients.length);
    for (let i = 0; i < alertCount; i++) {
      const patient = patients[i];
      const alert = await prisma.alert.create({
        data: {
          patientId: patient.id,
          type: ["VITAL", "SYMPTOM", "MEDICATION"][i % 3],
          severity: ["MEDIUM", "HIGH", "CRITICAL"][i % 3],
          message: `Test alert for ${patient.user?.firstName}`,
          status: i === 0 ? "OPEN" : i === 1 ? "ACKNOWLEDGED" : "RESOLVED",
          acknowledgedById: i > 0 ? user.id : null,
          acknowledgedAt: i > 0 ? new Date() : null,
        },
      });
      console.log(`   ✓ Created alert: ${alert.message}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ TEST NURSE ACCOUNT CREATED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("\n📝 Test Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: NURSE`);
    console.log("\n🔗 Login URL: http://localhost:3000/login");
    console.log("🚀 Dashboard URL: http://localhost:3000/dashboard/nurse\n");
  } catch (error) {
    console.error("❌ Error creating test nurse:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestNurse();

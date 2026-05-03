/**
 * Script to create test users for Nurse and Coordinator roles
 * Run with: npx ts-node scripts/create-test-users.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log("🚀 Creating test users...\n");

  try {
    // 1. Create Admin User
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@medifollow.com" },
      update: {},
      create: {
        email: "admin@medifollow.com",
        passwordHash: adminPassword,
        firstName: "Admin",
        lastName: "MediFollow",
        role: "ADMIN",
        phoneNumber: "+33123456789",
        isActive: true,
      },
    });
    console.log("✅ Admin created:", admin.email);
    console.log("   Password: admin123\n");

    // 2. Create Nurse User
    const nursePassword = await bcrypt.hash("nurse123", 10);
    const nurse = await prisma.user.upsert({
      where: { email: "eya@medifollow.com" },
      update: {},
      create: {
        email: "eya@medifollow.com",
        passwordHash: nursePassword,
        firstName: "Sophie",
        lastName: "Martin",
        role: "NURSE",
        phoneNumber: "+33123456790",
        isActive: true,
        nurseProfile: {
          create: {
            department: "Cardiologie",
            shift: "morning",
            phone: "+33123456790",
          },
        },
      },
      include: {
        nurseProfile: true,
      },
    });
    console.log("✅ Nurse created:", nurse.email);
    console.log("   Password: nurse123");
    console.log("   Department:", nurse.nurseProfile?.department);
    console.log("   Shift:", nurse.nurseProfile?.shift, "\n");

    // 3. Create Coordinator User
    const coordinatorPassword = await bcrypt.hash("coordinator123", 10);
    const coordinator = await prisma.user.upsert({
      where: { email: "coordinator@medifollow.com" },
      update: {},
      create: {
        email: "coordinator@medifollow.com",
        passwordHash: coordinatorPassword,
        firstName: "Marie",
        lastName: "Dubois",
        role: "COORDINATOR",
        phoneNumber: "+33123456791",
        isActive: true,
        coordinatorProfile: {
          create: {
            department: "Services aux patients",
            phone: "+33123456791",
          },
        },
      },
      include: {
        coordinatorProfile: true,
      },
    });
    console.log("✅ Coordinator created:", coordinator.email);
    console.log("   Password: coordinator123");
    console.log("   Department:", coordinator.coordinatorProfile?.department, "\n");

    // 4. Get existing patients to assign to nurse
    const patients = await prisma.patient.findMany({
      take: 3,
      where: { isActive: true },
      include: { user: true },
    });

    if (patients.length > 0) {
      console.log(`📋 Assigning ${patients.length} patients to nurse...\n`);

      for (const patient of patients) {
        await prisma.nurseAssignment.upsert({
          where: {
            nurseId_patientId: {
              nurseId: nurse.id,
              patientId: patient.id,
            },
          },
          update: { isActive: true },
          create: {
            nurseId: nurse.id,
            patientId: patient.id,
            assignedBy: admin.id,
            isActive: true,
          },
        });

        console.log(
          `   ✓ Assigned: ${patient.user.firstName} ${patient.user.lastName} (${patient.medicalRecordNumber})`
        );
      }
    } else {
      console.log("⚠️  No patients found to assign to nurse");
    }

    console.log("\n🎉 All test users created successfully!\n");
    console.log("=== LOGIN CREDENTIALS ===");
    console.log("Admin:");
    console.log("  Email: admin@medifollow.com");
    console.log("  Password: admin123\n");
    console.log("Nurse:");
    console.log("  Email: eya@medifollow.com");
    console.log("  Password: nurse123\n");
    console.log("Coordinator:");
    console.log("  Email: coordinator@medifollow.com");
    console.log("  Password: coordinator123\n");
  } catch (error) {
    console.error("❌ Error creating test users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();

/**
 * Script to diagnose why nurse doesn't see assigned patients
 * Run with: npx ts-node scripts/diagnose-nurse-patients.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function diagnose() {
  console.log("🔍 DIAGNOSING NURSE PATIENT VISIBILITY ISSUE\n");

  try {
    // 1. Find the test nurse
    const nurse = await prisma.user.findUnique({
      where: { email: "eya@medifollow.com" },
    });

    if (!nurse) {
      console.log("❌ Test nurse not found (eya@medifollow.com)");
      console.log("   Please run: npx ts-node scripts/create-test-users.ts\n");
      return;
    }

    console.log("✅ Nurse found:", nurse.email, `(ID: ${nurse.id})\n`);

    // 2. Check nurse assignments
    const assignments = await prisma.nurseAssignment.findMany({
      where: { nurseId: nurse.id },
    });

    console.log(`📋 Nurse Assignments: ${assignments.length}`);
    if (assignments.length > 0) {
      assignments.forEach((a) => {
        console.log(`   - Patient ID: ${a.patientId}, isActive: ${a.isActive}`);
      });
    } else {
      console.log("   ⚠️  NO ASSIGNMENTS FOUND!");
    }
    console.log();

    // 3. Check nurse assignments with isActive: true
    const activeAssignments = await prisma.nurseAssignment.findMany({
      where: { nurseId: nurse.id, isActive: true },
    });

    console.log(`✅ Active Nurse Assignments: ${activeAssignments.length}\n`);

    // 4. Get patient IDs from active assignments
    const patientIds = activeAssignments.map((a) => a.patientId);

    // 5. Check if patients exist
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      include: { user: true },
    });

    console.log(`👥 Patients in assignments: ${patients.length}`);
    patients.forEach((p) => {
      console.log(
        `   - ${p.user.firstName} ${p.user.lastName} (MRN: ${p.medicalRecordNumber}, isActive: ${p.isActive})`
      );
    });
    console.log();

    // 6. Check for active, assigned patients
    const activePatients = patients.filter((p) => p.isActive);
    console.log(
      `✅ Active patients in assignments: ${activePatients.length}\n`
    );

    // 7. Double-check with getAssignedPatients logic
    console.log("🔄 Simulating getAssignedPatients() query:\n");

    const simulatedResult = await prisma.patient.findMany({
      where: {
        id: { in: patientIds },
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        vitalRecords: {
          take: 1,
          orderBy: { recordedAt: "desc" },
        },
        alerts: {
          where: { status: "OPEN" },
        },
      },
    });

    console.log(`Result: ${simulatedResult.length} patients\n`);
    if (simulatedResult.length > 0) {
      console.log("✅ PATIENTS SHOULD BE LOADED");
      simulatedResult.forEach((p) => {
        console.log(`   - ${p.user.firstName} ${p.user.lastName}`);
      });
    } else {
      console.log("❌ NO PATIENTS FOUND - THIS IS THE PROBLEM!\n");
      console.log("Possible causes:");

      // Check total patient count
      const totalPatients = await prisma.patient.count();
      console.log(`1. Total patients in DB: ${totalPatients}`);

      // Check active patients
      const activePatientCount = await prisma.patient.count({
        where: { isActive: true },
      });
      console.log(`2. Active patients in DB: ${activePatientCount}`);

      // Check assignments
      const totalAssignments = await prisma.nurseAssignment.count({
        where: { nurseId: nurse.id },
      });
      console.log(`3. All assignments for this nurse: ${totalAssignments}`);

      const activeAssignmentCount = await prisma.nurseAssignment.count({
        where: { nurseId: nurse.id, isActive: true },
      });
      console.log(
        `4. Active assignments for this nurse: ${activeAssignmentCount}`
      );

      if (activeAssignmentCount === 0) {
        console.log("\n→ ACTION: Run add-demo-data.js to create patients");
      } else if (patientIds.length > 0 && activePatients.length === 0) {
        console.log("\n→ ACTION: Check if patients have isActive: true");
        console.log(
          "          Update manually or run: npm run fix-appointments-attributes"
        );
      }
    }

    console.log("\n📊 SUMMARY:");
    console.log(
      `- Nurse assignments: ${assignments.length} (${activeAssignments.length} active)`
    );
    console.log(
      `- Patients found: ${patients.length} (${activePatients.length} active)`
    );
    console.log(
      `- Should display: ${simulatedResult.length} patients on enter-data page`
    );
  } catch (error) {
    console.error("❌ Error during diagnosis:", error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();

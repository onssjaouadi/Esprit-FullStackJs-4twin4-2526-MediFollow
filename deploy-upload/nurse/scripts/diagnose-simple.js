/**
 * Simple diagnostic script without ts-node (plain JavaScript)
 * Run with: node scripts/diagnose-simple.js
 */

const { PrismaClient } = require("@prisma/client");

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
      console.log("   Please check if test users were created.\n");

      // Check how many users exist
      const userCount = await prisma.user.count();
      console.log(`Total users in DB: ${userCount}`);

      if (userCount === 0) {
        console.log("   → Run: npm run create-test-users");
      }
      return;
    }

    console.log("✅ Nurse found:", nurse.email, `(ID: ${nurse.id})\n`);

    // 2. Check nurse assignments
    const assignments = await prisma.nurseAssignment.count({
      where: { nurseId: nurse.id },
    });

    console.log(`📋 Total Nurse Assignments: ${assignments}`);

    const activeAssignments = await prisma.nurseAssignment.count({
      where: { nurseId: nurse.id, isActive: true },
    });

    console.log(`✅ Active Assignments: ${activeAssignments}\n`);

    // 3. Get specific assignment details
    if (activeAssignments > 0) {
      const assignmentList = await prisma.nurseAssignment.findMany({
        where: { nurseId: nurse.id, isActive: true },
        take: 5,
      });

      console.log("Active assignment IDs:");
      assignmentList.forEach((a) => {
        console.log(`   - Patient ID: ${a.patientId}`);
      });
      console.log();
    }

    // 4. Check database stats
    console.log("📊 Database Statistics:");
    const totalPatients = await prisma.patient.count();
    console.log(`   - Total patients: ${totalPatients}`);

    const activePatients = await prisma.patient.count({
      where: { isActive: true },
    });
    console.log(`   - Active patients: ${activePatients}`);

    const inactivePatients = await prisma.patient.count({
      where: { isActive: false },
    });
    console.log(`   - Inactive patients: ${inactivePatients}\n`);

    // 5. Get first active assignment and check if patient exists
    if (activeAssignments > 0) {
      const firstAssignment = await prisma.nurseAssignment.findFirst({
        where: { nurseId: nurse.id, isActive: true },
      });

      if (firstAssignment) {
        const patient = await prisma.patient.findUnique({
          where: { id: firstAssignment.patientId },
          include: { user: { select: { firstName: true, lastName: true } } },
        });

        if (patient) {
          console.log("📌 Sample Patient from Assignment:");
          console.log(
            `   - Name: ${patient.user.firstName} ${patient.user.lastName}`
          );
          console.log(`   - MRN: ${patient.medicalRecordNumber}`);
          console.log(`   - isActive: ${patient.isActive}`);
          console.log();
        }
      }
    }

    // 6. Final test - simulate the exact query
    console.log("🔄 Testing getAssignedPatients() Query:\n");

    const assignmentIds = await prisma.nurseAssignment.findMany({
      where: { nurseId: nurse.id, isActive: true },
      select: { patientId: true },
    });

    const patientIds = assignmentIds.map((a) => a.patientId);

    if (patientIds.length === 0) {
      console.log("❌ NO ACTIVE ASSIGNMENTS - PATIENTS WON'T LOAD!");
      console.log("\nSOLUTION: Run the setup script to create demo data:");
      console.log("   npm run add-demo-data");
      console.log("   OR");
      console.log("   npx ts-node scripts/create-test-users.ts");
    } else {
      const patientsList = await prisma.patient.findMany({
        where: {
          id: { in: patientIds },
          isActive: true,
        },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      });

      console.log(`✅ This query returns: ${patientsList.length} patients\n`);

      if (patientsList.length === 0) {
        console.log(
          "⚠️  PROBLEM: Assignments exist but patients aren't Active!"
        );
        console.log("\nSOLUTION: Update patient isActive status:");
        console.log("   npm run fix-appointments-attributes");
      } else {
        console.log("Patients that should appear:");
        patientsList.forEach((p) => {
          console.log(`   ✓ ${p.user.firstName} ${p.user.lastName}`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Error during diagnosis:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();

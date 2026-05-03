#!/usr/bin/env node

/**
 * Script pour tester l'API /api/patients directement
 */

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  🧪 Test API /api/patients");
  console.log("=".repeat(70) + "\n");

  try {
    // Simulate being an admin
    // In real context, we'd use a token, but for this script we simulate

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true, role: true },
    });

    if (!admin) {
      console.error("❌ Aucun admin trouvé\n");
      process.exit(1);
    }

    console.log(`👨‍💼 Testant en tant que: ${admin.email} (${admin.role})\n`);

    // Simulate what the API does
    console.log("🔍 Simulating API logic...\n");

    // Step 1: Check user role
    if (!admin || (admin.role !== "DOCTOR" && admin.role !== "ADMIN")) {
      console.error("❌ Unauthorized\n");
      process.exit(1);
    }
    console.log("✅ Role check passed (ADMIN)");

    // Step 2: Fetch AccessGrants
    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        doctorId: admin.id,
        isActive: true,
      },
      select: {
        patientId: true,
      },
    });

    console.log(`✅ Found ${accessGrants.length} active AccessGrants`);

    const patientIds = accessGrants.map((grant) => grant.patientId);
    console.log(`   Patient IDs: ${patientIds.join(", ")}\n`);

    // Step 3: Fetch patient details
    const patients = await prisma.patient.findMany({
      where: {
        id: {
          in: patientIds,
        },
        isActive: true,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });

    console.log(`✅ Found ${patients.length} patient(s)\n`);

    if (patients.length === 0) {
      console.log("⚠️  NO PATIENTS RETURNED!\n");
    } else {
      console.log("📋 Patients that would be returned:\n");
      for (const patient of patients) {
        console.log(`   ✅ ${patient.user.firstName} ${patient.user.lastName}`);
        console.log(`      Email: ${patient.user.email}`);
        console.log(`      ID: ${patient.id}\n`);
      }
    }

    console.log("=".repeat(70));
    console.log("Response would be:\n");
    console.log(
      JSON.stringify(
        {
          success: true,
          data: patients,
        },
        null,
        2
      )
    );
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

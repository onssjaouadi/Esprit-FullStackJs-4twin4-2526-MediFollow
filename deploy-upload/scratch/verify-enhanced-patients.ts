import { getCoordinatorPatientsDetailed } from "./lib/actions/coordinator.actions";
import prisma from "./lib/prisma";

async function verify() {
  console.log("🔍 Verifying Coordinator Patients Data...");
  const result = await getCoordinatorPatientsDetailed();
  
  if (!result.success) {
    console.error("❌ Action failed:", result.error);
    return;
  }

  const patients = result.patients || [];
  console.log(`✅ Found ${patients.length} patients.`);

  if (patients.length > 0) {
    const p = patients[0];
    console.log("📄 Sample Patient Data:");
    console.log("- ID:", p.id);
    console.log("- MRN:", p.medicalRecordNumber);
    console.log("- Name:", p.user?.firstName, p.user?.lastName);
    console.log("- Department:", p.department || "N/A");
    console.log("- Assigned Doctors:", p.assignedDoctors?.join(", ") || "None");
    console.log("- Next Deadline:", p.nextDeadline || "None");
    
    // Check for specific fields used in UI
    const hasDept = 'department' in p;
    const hasDocs = Array.isArray(p.assignedDoctors);
    const hasDeadline = 'nextDeadline' in p;
    
    console.log("\n🧪 Field Checks:");
    console.log(`- has department field: ${hasDept}`);
    console.log(`- has assignedDoctors array: ${hasDocs}`);
    console.log(`- has nextDeadline field: ${hasDeadline}`);
  }
}

verify().catch(console.error).finally(() => prisma.$disconnect());

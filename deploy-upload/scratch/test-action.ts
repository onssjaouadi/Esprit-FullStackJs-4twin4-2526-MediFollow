import { getPatientBasicInfo } from "./lib/actions/coordinator.actions";
import prisma from "./lib/prisma";

async function test() {
  const patient = await prisma.patient.findFirst();
  if (!patient) {
    console.log("No patient found to test with.");
    return;
  }
  
  console.log(`Testing with patient ID: ${patient.id}`);
  const result = await getPatientBasicInfo(patient.id);
  console.log("Result:", JSON.stringify(result, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());

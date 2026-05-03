const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoles() {
  try {
    console.log("Checking unique roles in DB using aggregate...");
    const result = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        { $group: { _id: "$role" } }
      ],
      cursor: {}
    });

    console.log("Existing roles:", JSON.stringify(result));

    // Update lowercase to uppercase if any
    const updateResultStr = await prisma.$runCommandRaw({
      update: "users",
      updates: [
        {
          q: { role: { $type: "string", $nin: ["PATIENT", "DOCTOR", "NURSE", "COORDINATOR", "ADMIN"] } },
          u: [ { $set: { role: { $toUpper: "$role" } } } ],
          multi: true
        }
      ]
    });
    console.log("Update upper result:", JSON.stringify(updateResultStr));
    
    // Also, if any role is fully weird, we might need a manual fix.

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

fixRoles();

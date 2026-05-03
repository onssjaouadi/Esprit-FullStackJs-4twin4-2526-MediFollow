const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAuditor() {
  try {
    const result = await prisma.$runCommandRaw({
      update: "users",
      updates: [
        {
          q: { role: "AUDITOR" },
          u: [ { $set: { role: "ADMIN" } } ],
          multi: true
        }
      ]
    });
    console.log("Update AUDITOR result:", JSON.stringify(result));
    
    // Validate if any others exist
    const aggr = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        { $group: { _id: "$role" } }
      ],
      cursor: {}
    });
    console.log("Remaining roles:", JSON.stringify(aggr));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuditor();

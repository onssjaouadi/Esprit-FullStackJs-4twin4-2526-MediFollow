const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTemplates() {
  try {
    const result = await prisma.$runCommandRaw({
      update: 'questionnaire_templates',
      updates: [
        {
          q: { $or: [{ questions: null }, { questions: { $exists: false } }] },
          u: { $set: { questions: [] } },
          multi: true
        }
      ]
    });
    console.log("Fixed templates result:", result);
  } catch (error) {
    console.error("Failed to fix:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTemplates();

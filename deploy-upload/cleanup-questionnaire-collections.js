// Script to clean up questionnaire collections
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanup() {
  console.log("Cleaning up questionnaire collections...");

  try {
    // Delete all records to reset the collections
    const deletedResponses = await prisma.questionnaireResponse.deleteMany({});
    console.log(`Deleted ${deletedResponses.count} responses`);

    const deletedQuestions = await prisma.questionnaireQuestion.deleteMany({});
    console.log(`Deleted ${deletedQuestions.count} questions`);

    const deletedAssignments = await prisma.questionnaireAssignment.deleteMany(
      {}
    );
    console.log(`Deleted ${deletedAssignments.count} assignments`);

    const deletedTemplates = await prisma.questionnaireTemplate.deleteMany({});
    console.log(`Deleted ${deletedTemplates.count} templates`);

    console.log("✅ Cleanup complete!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanAll() {
  try {
    console.log("🧹 Suppression de toutes les questions et assignations...\n");

    // Delete all assignments first (foreign key)
    const delAssignments = await prisma.questionnaireAssignment.deleteMany({});
    console.log(`✅ Supprimé ${delAssignments.count} assignments`);

    // Delete all questions
    const delQuestions = await prisma.questionnaireQuestion.deleteMany({});
    console.log(`✅ Supprimé ${delQuestions.count} questions`);

    // NOW verify templates are still there
    console.log("\n📊 État final:");
    const templatesCount = await prisma.questionnaireTemplate.count();
    const questionsCount = await prisma.questionnaireQuestion.count();
    const assignmentsCount = await prisma.questionnaireAssignment.count();

    console.log(`📋 QuestionnaireTemplate: ${templatesCount}`);
    console.log(`❓ QuestionnaireQuestion: ${questionsCount}`);
    console.log(`👥 QuestionnaireAssignment: ${assignmentsCount}`);

    if (templatesCount > 0) {
      console.log(
        "\n✅ Les templates sont toujours là, prêts à être utilisés!"
      );
      console.log(
        "Vous pouvez maintenant créer de nouvelles questions pour chaque template."
      );
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAll();

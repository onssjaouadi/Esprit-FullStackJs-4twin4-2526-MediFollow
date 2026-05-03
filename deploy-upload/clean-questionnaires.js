const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanQuestionnaires() {
  try {
    console.log("🧹 Nettoyage des questionnaires...\n");

    // Delete orphaned questions (questions without a valid templateId)
    const orphanedQuestions = await prisma.questionnaireQuestion.deleteMany({
      where: {
        templateId: null,
      },
    });
    console.log(`✅ Supprimé ${orphanedQuestions.count} questions orphelines`);

    // Delete questions with invalid templateIds
    const invalidQuestions = await prisma.questionnaireQuestion.deleteMany({
      where: {
        templateId: { equals: "" },
      },
    });
    console.log(
      `✅ Supprimé ${invalidQuestions.count} questions avec templateId vide`
    );

    // Now verify
    console.log("\n📊 Vérification après nettoyage:");
    const templatesCount = await prisma.questionnaireTemplate.count();
    console.log(`📋 QuestionnaireTemplate: ${templatesCount}`);

    const questionsCount = await prisma.questionnaireQuestion.count();
    console.log(`❓ QuestionnaireQuestion: ${questionsCount}`);

    const assignmentsCount = await prisma.questionnaireAssignment.count();
    console.log(`👥 QuestionnaireAssignment: ${assignmentsCount}`);

    // Try to get templates
    console.log("\n📋 Chargement des questionnaires:");
    const templates = await prisma.questionnaireTemplate.findMany({
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    templates.forEach((t) => {
      console.log(`\n  ✅ ${t.title}`);
      console.log(`     Questions: ${t.questions.length}`);
      t.questions.forEach((q, idx) => {
        console.log(`     ${idx + 1}. ${q.questionText} (${q.questionType})`);
      });
    });

    console.log("\n✅ Nettoyage terminé!");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanQuestionnaires();

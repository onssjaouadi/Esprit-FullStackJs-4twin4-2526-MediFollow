const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkQuestionnaires() {
  try {
    console.log("🔍 Vérification des questionnaires...\n");

    // Count templates
    const templatesCount = await prisma.questionnaireTemplate.count();
    console.log(`📋 Nombre de QuestionnaireTemplate: ${templatesCount}`);

    // Count questions
    const questionsCount = await prisma.questionnaireQuestion.count();
    console.log(`❓ Nombre de QuestionnaireQuestion: ${questionsCount}`);

    // Count assignments
    const assignmentsCount = await prisma.questionnaireAssignment.count();
    console.log(`👥 Nombre de QuestionnaireAssignment: ${assignmentsCount}`);

    // Get all templates with their details
    if (templatesCount > 0) {
      console.log("\n📊 Détails des questionnaires:");
      const templates = await prisma.questionnaireTemplate.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          isActive: true,
          createdAt: true,
        },
      });

      templates.forEach((t, idx) => {
        console.log(`\n  ${idx + 1}. ${t.title}`);
        console.log(`     ID: ${t.id}`);
        console.log(`     Description: ${t.description || "N/A"}`);
        console.log(`     Actif: ${t.isActive ? "✅ Oui" : "❌ Non"}`);
        console.log(`     Créé: ${t.createdAt.toLocaleString()}`);
      });
    } else {
      console.log("\n⚠️  Aucun questionnaire trouvé!");
    }

    // Check for corrupted questions
    console.log("\n🔧 Vérification des questions:");
    const allQuestions = await prisma.questionnaireQuestion.findMany({
      select: {
        id: true,
        templateId: true,
        questionText: true,
        questionType: true,
        options: true,
      },
    });

    if (allQuestions.length > 0) {
      console.log(`   Total de questions: ${allQuestions.length}`);

      // Check for problematic options
      let problematicCount = 0;
      allQuestions.forEach((q) => {
        if (q.options) {
          const optionsStr = JSON.stringify(q.options);
          if (
            optionsStr.includes('"value"') &&
            optionsStr.includes('"label"')
          ) {
            problematicCount++;
            console.log(`   ⚠️  Question ${q.id} a des options mal formatées`);
          }
        }
      });

      if (problematicCount === 0) {
        console.log("   ✅ Toutes les questions sont bien formatées");
      } else {
        console.log(
          `   ❌ ${problematicCount} questions ont des options mal formatées`
        );
      }
    } else {
      console.log("   aucune question trouvée");
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestionnaires();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testTemplates() {
  try {
    console.log("🔍 Test - Récupération des templates...\n");

    // Count templates directly
    const templates = await prisma.questionnaireTemplate.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Templates trouvés: ${templates.length}`);

    templates.forEach((t, idx) => {
      console.log(`${idx + 1}. ${t.title} (${t.id})`);
    });

    if (templates.length === 0) {
      console.log("\n⚠️  Aucun template! C'est bizarre...");
    } else {
      console.log(`\n✅ ${templates.length} templates prêts à être affichés`);
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTemplates();

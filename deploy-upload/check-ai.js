const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkServices() {
  try {
    console.log("🔍 Vérification de l'AI Agent...\n");

    // Check services
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        serviceName: true,
        description: true,
      },
    });

    console.log(`📋 Services actifs: ${services.length}\n`);
    services.forEach((s, idx) => {
      console.log(`${idx + 1}. ${s.serviceName}`);
      console.log(
        `   Description: ${s.description ? s.description.substring(0, 60) + "..." : "N/A"}`
      );
      console.log();
    });

    if (services.length === 0) {
      console.log("⚠️  Aucun service actif trouvé!");
      console.log(
        "L'agent AI a besoin de services pour générer des questionnaires."
      );
    } else {
      console.log(
        `✅ ${services.length} services trouvés - L'AI devrait pouvoir générer des questionnaires.`
      );
    }

    // Check env variables for Azure OpenAI
    console.log("\n🔐 Configuration Azure OpenAI:");
    const hasEndpoint = !!process.env.AZURE_OPENAI_ENDPOINT;
    const hasApiKey = !!process.env.AZURE_OPENAI_API_KEY;
    const hasDeployment = !!process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

    console.log(
      `   AZURE_OPENAI_ENDPOINT: ${hasEndpoint ? "✅ Configuré" : "❌ Manquant"}`
    );
    console.log(
      `   AZURE_OPENAI_API_KEY: ${hasApiKey ? "✅ Configuré" : "❌ Manquant"}`
    );
    console.log(
      `   AZURE_OPENAI_DEPLOYMENT_NAME: ${hasDeployment ? "✅ Configuré" : "❌ Manquant"}`
    );

    if (!hasEndpoint || !hasApiKey || !hasDeployment) {
      console.log(
        "\n⚠️  L'AI ne peut pas fonctionner sans les env vars Azure OpenAI!"
      );
    } else {
      console.log(
        "\n✅ Configuration Azure complète - L'AI devrait fonctionner!"
      );
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();

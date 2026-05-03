/**
 * Script pour créer les attributs manquants de la collection APPOINTMENTS
 */

const sdk = require("node-appwrite");
require("dotenv").config();

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.PROJECT_ID)
  .setKey(process.env.API_KEY);

const DATABASE_ID = process.env.DATABASE_ID;
const APPOINTMENT_COLLECTION_ID = process.env.APPOINTMENT_COLLECTION_ID;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createMissingAttributes() {
  console.log("🔧 Création des attributs manquants pour APPOINTMENTS...\n");

  try {
    // Récupérer les attributs existants
    const collection = await databases.getCollection(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID
    );
    const existingAttributes = collection.attributes.map((attr) => attr.key);

    console.log(
      "📋 Attributs existants:",
      existingAttributes.join(", ") || "Aucun"
    );
    console.log("\n⏳ Création des attributs nécessaires...\n");

    // Liste des attributs à créer
    const attributesToCreate = [
      { key: "patient", type: "string", size: 255, required: true },
      { key: "schedule", type: "datetime", required: true },
      {
        key: "status",
        type: "enum",
        elements: ["pending", "scheduled", "cancelled"],
        required: true,
      },
      { key: "primaryPhysician", type: "string", size: 255, required: true },
      { key: "reason", type: "string", size: 1000, required: true },
      { key: "note", type: "string", size: 1000, required: false },
      { key: "userId", type: "string", size: 255, required: true },
      {
        key: "cancellationReason",
        type: "string",
        size: 1000,
        required: false,
      },
    ];

    let created = 0;

    for (const attr of attributesToCreate) {
      if (existingAttributes.includes(attr.key)) {
        console.log(`   ⏭️  ${attr.key} existe déjà`);
        continue;
      }

      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            APPOINTMENT_COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            APPOINTMENT_COLLECTION_ID,
            attr.key,
            attr.required
          );
        } else if (attr.type === "enum") {
          await databases.createEnumAttribute(
            DATABASE_ID,
            APPOINTMENT_COLLECTION_ID,
            attr.key,
            attr.elements,
            attr.required
          );
        }

        console.log(`   ✅ ${attr.key} créé (${attr.type})`);
        created++;
        await wait(1500); // Attendre plus longtemps entre chaque création
      } catch (error) {
        console.log(`   ❌ ${attr.key}: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ ATTRIBUTS CRÉÉS !");
    console.log("=".repeat(70));
    console.log(`\n📊 ${created} nouveaux attributs ajoutés`);
    console.log(
      "\n⏰ Attendez 1-2 minutes que les attributs soient disponibles,"
    );
    console.log("   puis exécutez: node add-appointments.js\n");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

createMissingAttributes();

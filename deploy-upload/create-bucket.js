/**
 * Script pour créer uniquement le bucket de stockage
 */

const sdk = require("node-appwrite");
require("dotenv").config();

const client = new sdk.Client();
const storage = new sdk.Storage(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.PROJECT_ID)
  .setKey(process.env.API_KEY);

async function createBucket() {
  console.log("📦 Création du bucket de stockage...\n");

  try {
    const bucket = await storage.createBucket(
      sdk.ID.unique(),
      "patient-documents",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      false,
      true,
      null,
      ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
    );

    console.log("✅ Bucket créé:", bucket.$id);
    console.log("\n" + "=".repeat(70));
    console.log("🎉 CONFIGURATION TERMINÉE !");
    console.log("=".repeat(70));
    console.log("\n📝 Tous vos IDs :\n");
    console.log(`PATIENT_COLLECTION_ID=69a44eef0007e88d2a1e`);
    console.log(`DOCTOR_COLLECTION_ID=69a44f0b001b21022a8c`);
    console.log(`APPOINTMENT_COLLECTION_ID=69a44f1300357ed151e0`);
    console.log(`NEXT_PUBLIC_BUCKET_ID=${bucket.$id}`);
    console.log("\n" + "=".repeat(70));
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

createBucket();

/**
 * Script de correction pour terminer la configuration de la collection APPOINTMENTS
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
const APPOINTMENT_COLLECTION_ID = "69a44f1300357ed151e0";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fixAppointmentsCollection() {
  console.log("🔧 Correction de la collection APPOINTMENTS...\n");

  try {
    // Création des attributs pour APPOINTMENTS (sans valeur par défaut pour status)
    console.log("   Création des attributs manquants...");

    await databases.createStringAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "patient",
      255,
      true
    );
    await wait(1000);

    await databases.createDatetimeAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "schedule",
      true
    );
    await wait(1000);

    // Status SANS valeur par défaut
    await databases.createEnumAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "status",
      ["pending", "scheduled", "cancelled"],
      true
    );
    await wait(1000);

    await databases.createStringAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "primaryPhysician",
      255,
      true
    );
    await wait(1000);

    await databases.createStringAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "reason",
      1000,
      true
    );
    await wait(1000);

    await databases.createStringAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "note",
      1000,
      false
    );
    await wait(1000);

    await databases.createStringAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "userId",
      255,
      true
    );
    await wait(1000);

    await databases.createStringAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "cancellationReason",
      1000,
      false
    );
    await wait(1000);

    console.log("✅ Attributs APPOINTMENTS créés\n");

    // Création du bucket de stockage
    const storage = new sdk.Storage(client);
    console.log("📦 Création du bucket de stockage...");

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
    const BUCKET_ID = bucket.$id;
    console.log("✅ Bucket créé:", BUCKET_ID);

    console.log("\n" + "=".repeat(70));
    console.log("🎉 CONFIGURATION TERMINÉE !");
    console.log("=".repeat(70));
    console.log("\n📝 IDs de vos collections :\n");
    console.log(`PATIENT_COLLECTION_ID=69a44eef0007e88d2a1e`);
    console.log(`DOCTOR_COLLECTION_ID=69a44f0b001b21022a8c`);
    console.log(`APPOINTMENT_COLLECTION_ID=69a44f1300357ed151e0`);
    console.log(`NEXT_PUBLIC_BUCKET_ID=${BUCKET_ID}`);
    console.log("\n" + "=".repeat(70));
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    if (error.response) {
      console.error("Détails:", error.response);
    }
  }
}

fixAppointmentsCollection();

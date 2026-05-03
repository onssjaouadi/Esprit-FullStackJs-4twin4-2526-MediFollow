/**
 * Script d'initialisation de la base de données Appwrite
 * Ce script crée automatiquement toutes les collections et leurs attributs
 *
 * Exécuter avec: node setup-appwrite.js
 */

const sdk = require("node-appwrite");
require("dotenv").config();

// Configuration du client Appwrite
const client = new sdk.Client();
const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.PROJECT_ID)
  .setKey(process.env.API_KEY);

const DATABASE_ID = process.env.DATABASE_ID;

// Fonction pour attendre entre les créations d'attributs
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createCollections() {
  console.log("🚀 Début de la création des collections Appwrite...\n");

  try {
    // =============================
    // 1. COLLECTION PATIENTS
    // =============================
    console.log("📋 Création de la collection PATIENTS...");
    const patientsCollection = await databases.createCollection(
      DATABASE_ID,
      sdk.ID.unique(),
      "patients",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    const PATIENT_COLLECTION_ID = patientsCollection.$id;
    console.log("✅ Collection PATIENTS créée:", PATIENT_COLLECTION_ID);

    // Création des attributs pour PATIENTS
    console.log("   Création des attributs...");
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "userId",
      255,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "name",
      255,
      true
    );
    await wait(1000);
    await databases.createEmailAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "email",
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "phone",
      20,
      true
    );
    await wait(1000);
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "birthDate",
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "gender",
      20,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "address",
      500,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "occupation",
      255,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "emergencyContactName",
      255,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "emergencyContactNumber",
      20,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "primaryPhysician",
      255,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "insuranceProvider",
      255,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "insurancePolicyNumber",
      100,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "allergies",
      1000,
      false
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "currentMedication",
      1000,
      false
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "familyMedicalHistory",
      1000,
      false
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "pastMedicalHistory",
      1000,
      false
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "identificationType",
      100,
      false
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "identificationNumber",
      100,
      false
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "identificationDocumentId",
      255,
      false
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "identificationDocumentUrl",
      1000,
      false
    );
    await wait(1000);
    await databases.createBooleanAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "privacyConsent",
      true
    );
    await wait(1000);
    await databases.createBooleanAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "disclosureConsent",
      true
    );
    await wait(1000);
    await databases.createBooleanAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "treatmentConsent",
      true
    );
    await wait(1000);
    console.log("✅ Attributs PATIENTS créés\n");

    // =============================
    // 2. COLLECTION DOCTORS
    // =============================
    console.log("👨‍⚕️ Création de la collection DOCTORS...");
    const doctorsCollection = await databases.createCollection(
      DATABASE_ID,
      sdk.ID.unique(),
      "doctors",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    const DOCTOR_COLLECTION_ID = doctorsCollection.$id;
    console.log("✅ Collection DOCTORS créée:", DOCTOR_COLLECTION_ID);

    // Création des attributs pour DOCTORS
    console.log("   Création des attributs...");
    await databases.createStringAttribute(
      DATABASE_ID,
      DOCTOR_COLLECTION_ID,
      "name",
      255,
      true
    );
    await wait(1000);
    await databases.createStringAttribute(
      DATABASE_ID,
      DOCTOR_COLLECTION_ID,
      "image",
      500,
      true
    );
    await wait(1000);
    console.log("✅ Attributs DOCTORS créés\n");

    // Création des documents doctors initiaux
    console.log("   Ajout des médecins...");
    const doctors = [
      { name: "John Green", image: "/assets/images/dr-green.png" },
      { name: "Leila Cameron", image: "/assets/images/dr-cameron.png" },
      { name: "David Livingston", image: "/assets/images/dr-livingston.png" },
      { name: "Evan Peter", image: "/assets/images/dr-peter.png" },
      { name: "Jane Powell", image: "/assets/images/dr-powell.png" },
      { name: "Alex Ramirez", image: "/assets/images/dr-remirez.png" },
      { name: "Jasmine Lee", image: "/assets/images/dr-lee.png" },
      { name: "Alyana Cruz", image: "/assets/images/dr-cruz.png" },
      { name: "Hardik Sharma", image: "/assets/images/dr-sharma.png" },
    ];

    for (const doctor of doctors) {
      await databases.createDocument(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        sdk.ID.unique(),
        doctor
      );
      await wait(500);
    }
    console.log("✅ 9 médecins ajoutés\n");

    // =============================
    // 3. COLLECTION APPOINTMENTS
    // =============================
    console.log("📅 Création de la collection APPOINTMENTS...");
    const appointmentsCollection = await databases.createCollection(
      DATABASE_ID,
      sdk.ID.unique(),
      "appointments",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    const APPOINTMENT_COLLECTION_ID = appointmentsCollection.$id;
    console.log("✅ Collection APPOINTMENTS créée:", APPOINTMENT_COLLECTION_ID);

    // Création des attributs pour APPOINTMENTS
    console.log("   Création des attributs...");
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
    await databases.createEnumAttribute(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      "status",
      ["pending", "scheduled", "cancelled"],
      true,
      "pending"
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

    // =============================
    // 4. BUCKET DE STOCKAGE
    // =============================
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
      false, // fileSecurity
      true, // enabled
      null, // maximumFileSize (null = unlimited)
      ["image/png", "image/jpeg", "image/jpg", "application/pdf"], // allowedFileExtensions
      undefined, // compression
      undefined, // encryption
      undefined // antivirus
    );
    const BUCKET_ID = bucket.$id;
    console.log("✅ Bucket créé:", BUCKET_ID);

    // =============================
    // RÉSUMÉ
    // =============================
    console.log("\n" + "=".repeat(70));
    console.log("🎉 CONFIGURATION TERMINÉE !");
    console.log("=".repeat(70));
    console.log("\n📝 Copiez ces IDs dans votre fichier .env :\n");
    console.log(`PATIENT_COLLECTION_ID=${PATIENT_COLLECTION_ID}`);
    console.log(`DOCTOR_COLLECTION_ID=${DOCTOR_COLLECTION_ID}`);
    console.log(`APPOINTMENT_COLLECTION_ID=${APPOINTMENT_COLLECTION_ID}`);
    console.log(`NEXT_PUBLIC_BUCKET_ID=${BUCKET_ID}`);
    console.log("\n" + "=".repeat(70));
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    if (error.response) {
      console.error("Détails:", error.response);
    }
    process.exit(1);
  }
}

// Exécution du script
createCollections();

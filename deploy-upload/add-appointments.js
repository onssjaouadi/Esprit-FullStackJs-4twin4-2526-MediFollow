/**
 * Script pour créer les rendez-vous sans l'attribut userId
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

async function createAppointments() {
  console.log("📅 Création de rendez-vous de démonstration...\n");

  try {
    // Récupérer quelques patients existants
    const patients = await databases.listDocuments(
      DATABASE_ID,
      process.env.PATIENT_COLLECTION_ID
    );

    if (patients.documents.length === 0) {
      console.log("❌ Aucun patient trouvé. Exécutez d'abord add-demo-data.js");
      return;
    }

    const appointments = [
      {
        patient: patients.documents[0].$id,
        userId: patients.documents[0].userId,
        schedule: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        primaryPhysician: "John Green",
        reason: "Consultation générale et bilan de santé annuel",
        note: "Patient demande un bilan complet",
      },
      {
        patient: patients.documents[1]?.$id || patients.documents[0].$id,
        userId: patients.documents[1]?.userId || patients.documents[0].userId,
        schedule: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "scheduled",
        primaryPhysician: "Leila Cameron",
        reason: "Suivi de grossesse - 2ème trimestre",
        note: "Contrôle régulier",
      },
      {
        patient: patients.documents[2]?.$id || patients.documents[0].$id,
        userId: patients.documents[2]?.userId || patients.documents[0].userId,
        schedule: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "scheduled",
        primaryPhysician: "David Livingston",
        reason: "Contrôle diabète et renouvellement ordonnance",
        note: "Apporter les dernières analyses",
      },
      {
        patient: patients.documents[3]?.$id || patients.documents[0].$id,
        userId: patients.documents[3]?.userId || patients.documents[0].userId,
        schedule: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        primaryPhysician: "Jasmine Lee",
        reason: "Consultation dermatologie - allergies saisonnières",
        note: "Rendez-vous urgent",
      },
      {
        patient: patients.documents[4]?.$id || patients.documents[0].$id,
        userId: patients.documents[4]?.userId || patients.documents[0].userId,
        schedule: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "cancelled",
        primaryPhysician: "Evan Peter",
        reason: "Consultation orthopédie - douleurs au dos",
        cancellationReason: "Patient a dû annuler pour raisons personnelles",
      },
      {
        patient: patients.documents[0].$id,
        userId: patients.documents[0].userId,
        schedule: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "scheduled",
        primaryPhysician: "Jane Powell",
        reason: "Vaccination annuelle grippe",
        note: "Apporter le carnet de vaccination",
      },
      {
        patient: patients.documents[1]?.$id || patients.documents[0].$id,
        userId: patients.documents[1]?.userId || patients.documents[0].userId,
        schedule: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        primaryPhysician: "Alex Ramirez",
        reason: "Consultation cardiologie - check-up préventif",
        note: "",
      },
    ];

    let created = 0;
    for (let i = 0; i < appointments.length; i++) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          APPOINTMENT_COLLECTION_ID,
          sdk.ID.unique(),
          appointments[i]
        );
        created++;
        const statusEmoji =
          appointments[i].status === "pending"
            ? "⏳"
            : appointments[i].status === "scheduled"
              ? "✅"
              : "❌";
        console.log(
          `   ${statusEmoji} Rendez-vous ${i + 1}/${appointments.length} créé (${appointments[i].status})`
        );
        await wait(500);
      } catch (error) {
        console.log(`   ❌ Erreur rendez-vous ${i + 1}: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("🎉 RENDEZ-VOUS CRÉÉS !");
    console.log("=".repeat(70));
    console.log(`\n📊 Résumé :`);
    console.log(`   - ${created} rendez-vous créés`);
    console.log(`   - Statuts variés: pending, scheduled, cancelled`);
    console.log(`\n💡 Accédez à la page admin avec le code: 123456\n`);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

createAppointments();

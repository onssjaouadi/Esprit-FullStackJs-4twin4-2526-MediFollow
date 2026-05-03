/**
 * Script pour ajouter des données de démonstration dans la base de données
 */

const sdk = require("node-appwrite");
require("dotenv").config();

const client = new sdk.Client();
const databases = new sdk.Databases(client);
const users = new sdk.Users(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.PROJECT_ID)
  .setKey(process.env.API_KEY);

const DATABASE_ID = process.env.DATABASE_ID;
const PATIENT_COLLECTION_ID = process.env.PATIENT_COLLECTION_ID;
const APPOINTMENT_COLLECTION_ID = process.env.APPOINTMENT_COLLECTION_ID;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Données de démonstration
const demoPatients = [
  {
    name: "Ahmed Benali",
    email: "ahmed.benali@example.com",
    phone: "+212612345678",
    birthDate: "1985-03-15T00:00:00.000Z",
    gender: "Male",
    address: "123 Rue Mohammed V, Casablanca, Maroc",
    occupation: "Ingénieur",
    emergencyContactName: "Fatima Benali",
    emergencyContactNumber: "+212623456789",
    primaryPhysician: "John Green",
    insuranceProvider: "CNSS",
    insurancePolicyNumber: "POL-2024-001",
    allergies: "Pénicilline",
    currentMedication: "Paracétamol 500mg",
    familyMedicalHistory: "Diabète type 2 (père)",
    pastMedicalHistory: "Appendicectomie en 2010",
    identificationType: "National Identity Card",
    identificationNumber: "AB123456",
    privacyConsent: true,
    disclosureConsent: true,
    treatmentConsent: true,
  },
  {
    name: "Samira El Amrani",
    email: "samira.elamrani@example.com",
    phone: "+212687654321",
    birthDate: "1992-07-22T00:00:00.000Z",
    gender: "Female",
    address: "45 Avenue Hassan II, Rabat, Maroc",
    occupation: "Professeur",
    emergencyContactName: "Karim El Amrani",
    emergencyContactNumber: "+212698765432",
    primaryPhysician: "Leila Cameron",
    insuranceProvider: "RMA Assurance",
    insurancePolicyNumber: "POL-2024-002",
    allergies: "Aucune allergie connue",
    currentMedication: "Vitamines quotidiennes",
    familyMedicalHistory: "Hypertension (mère)",
    pastMedicalHistory: "Aucun antécédent majeur",
    identificationType: "Passport",
    identificationNumber: "XX987654",
    privacyConsent: true,
    disclosureConsent: true,
    treatmentConsent: true,
  },
  {
    name: "Youssef Tazi",
    email: "youssef.tazi@example.com",
    phone: "+212654321098",
    birthDate: "1978-11-05T00:00:00.000Z",
    gender: "Male",
    address: "78 Boulevard Zerktouni, Marrakech, Maroc",
    occupation: "Commerçant",
    emergencyContactName: "Nadia Tazi",
    emergencyContactNumber: "+212665432109",
    primaryPhysician: "David Livingston",
    insuranceProvider: "Saham Assurance",
    insurancePolicyNumber: "POL-2024-003",
    allergies: "Aspirine, Fruits de mer",
    currentMedication: "Metformine pour diabète",
    familyMedicalHistory: "Diabète type 2, Maladies cardiaques",
    pastMedicalHistory: "Diabète diagnostiqué en 2015",
    identificationType: "Driver's License",
    identificationNumber: "DL789012",
    privacyConsent: true,
    disclosureConsent: true,
    treatmentConsent: true,
  },
  {
    name: "Leila Benjelloun",
    email: "leila.benjelloun@example.com",
    phone: "+212676543210",
    birthDate: "1995-04-18T00:00:00.000Z",
    gender: "Female",
    address: "56 Rue Allal Ben Abdallah, Fès, Maroc",
    occupation: "Architecte",
    emergencyContactName: "Omar Benjelloun",
    emergencyContactNumber: "+212687654321",
    primaryPhysician: "Jasmine Lee",
    insuranceProvider: "AXA Assurance",
    insurancePolicyNumber: "POL-2024-004",
    allergies: "Pollen",
    currentMedication: "Antihistaminiques saisonniers",
    familyMedicalHistory: "Asthme (frère)",
    pastMedicalHistory: "Rhinite allergique",
    identificationType: "National Identity Card",
    identificationNumber: "CD456789",
    privacyConsent: true,
    disclosureConsent: true,
    treatmentConsent: true,
  },
  {
    name: "Hamza Alaoui",
    email: "hamza.alaoui@example.com",
    phone: "+212698765432",
    birthDate: "1988-09-30T00:00:00.000Z",
    gender: "Male",
    address: "34 Avenue des FAR, Tanger, Maroc",
    occupation: "Développeur",
    emergencyContactName: "Sara Alaoui",
    emergencyContactNumber: "+212609876543",
    primaryPhysician: "Evan Peter",
    insuranceProvider: "Wafa Assurance",
    insurancePolicyNumber: "POL-2024-005",
    allergies: "Latex",
    currentMedication: "Aucun",
    familyMedicalHistory: "Aucun antécédent notable",
    pastMedicalHistory: "Fracture du bras gauche en 2018",
    identificationType: "Passport",
    identificationNumber: "YY654321",
    privacyConsent: true,
    disclosureConsent: true,
    treatmentConsent: true,
  },
];

async function addDemoData() {
  console.log("🚀 Ajout de données de démonstration...\n");

  try {
    const createdPatients = [];

    // Création des utilisateurs et patients
    for (let i = 0; i < demoPatients.length; i++) {
      const patient = demoPatients[i];
      console.log(
        `👤 Création du patient ${i + 1}/${demoPatients.length}: ${patient.name}...`
      );

      try {
        // Créer l'utilisateur Appwrite
        const newUser = await users.create(
          sdk.ID.unique(),
          patient.email,
          patient.phone,
          undefined,
          patient.name
        );

        console.log(`   ✅ Utilisateur créé: ${newUser.$id}`);
        await wait(500);

        // Créer le document patient
        const newPatient = await databases.createDocument(
          DATABASE_ID,
          PATIENT_COLLECTION_ID,
          sdk.ID.unique(),
          {
            userId: newUser.$id,
            ...patient,
          }
        );

        console.log(`   ✅ Patient enregistré dans la base`);
        createdPatients.push({
          userId: newUser.$id,
          name: patient.name,
          patientId: newPatient.$id,
        });
        await wait(500);
      } catch (error) {
        if (error.code === 409) {
          console.log(`   ⚠️  Utilisateur existe déjà: ${patient.email}`);
        } else {
          console.log(`   ❌ Erreur: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ ${createdPatients.length} patients créés avec succès!\n`);

    // Création de rendez-vous de démonstration
    if (createdPatients.length > 0) {
      console.log("📅 Création de rendez-vous...\n");

      const appointments = [
        {
          patient: createdPatients[0]?.patientId,
          userId: createdPatients[0]?.userId,
          schedule: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(), // Dans 2 jours
          status: "pending",
          primaryPhysician: "John Green",
          reason: "Consultation générale et bilan de santé annuel",
          note: "Patient demande un bilan complet",
        },
        {
          patient: createdPatients[1]?.patientId,
          userId: createdPatients[1]?.userId,
          schedule: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toISOString(), // Dans 3 jours
          status: "scheduled",
          primaryPhysician: "Leila Cameron",
          reason: "Suivi de grossesse - 2ème trimestre",
          note: "Contrôle régulier",
        },
        {
          patient: createdPatients[2]?.patientId,
          userId: createdPatients[2]?.userId,
          schedule: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(), // Dans 5 jours
          status: "scheduled",
          primaryPhysician: "David Livingston",
          reason: "Contrôle diabète et renouvellement ordonnance",
          note: "Apporter les dernières analyses",
        },
        {
          patient: createdPatients[3]?.patientId,
          userId: createdPatients[3]?.userId,
          schedule: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // Dans 7 jours
          status: "pending",
          primaryPhysician: "Jasmine Lee",
          reason: "Consultation dermatologie - allergies saisonnières",
          note: "",
        },
        {
          patient: createdPatients[4]?.patientId,
          userId: createdPatients[4]?.userId,
          schedule: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(), // Il y a 2 jours
          status: "cancelled",
          primaryPhysician: "Evan Peter",
          reason: "Consultation orthopédie - douleurs au dos",
          note: "Urgence familiale",
          cancellationReason: "Patient a dû annuler pour raisons personnelles",
        },
      ];

      for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].patient) {
          try {
            await databases.createDocument(
              DATABASE_ID,
              APPOINTMENT_COLLECTION_ID,
              sdk.ID.unique(),
              appointments[i]
            );
            console.log(
              `   ✅ Rendez-vous ${i + 1}/${appointments.length} créé (${appointments[i].status})`
            );
            await wait(500);
          } catch (error) {
            console.log(`   ❌ Erreur création rendez-vous: ${error.message}`);
          }
        }
      }

      console.log("\n✅ Rendez-vous créés\n");
    }

    console.log("=".repeat(70));
    console.log("🎉 DONNÉES DE DÉMONSTRATION AJOUTÉES !");
    console.log("=".repeat(70));
    console.log(`\n📊 Résumé :`);
    console.log(`   - ${createdPatients.length} patients créés`);
    console.log(`   - 5 rendez-vous créés (en attente, programmés, annulés)`);
    console.log(
      `\n💡 Vous pouvez maintenant tester l'application avec ces données!`
    );
    console.log(`   Code admin: 123456\n`);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    if (error.response) {
      console.error("Détails:", error.response);
    }
  }
}

addDemoData();

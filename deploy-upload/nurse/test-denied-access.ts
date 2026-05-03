// Test d'accès refusé - Docteur sans permission
import "dotenv/config";
import { verifyDoctorAccess } from "./lib/actions/blockchain-access.actions";

async function main() {
  console.log("🧪 Test d'accès refusé...\n");

  // Adresse Aptos aléatoire (docteur non autorisé)
  const unauthorizedDoctor =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const patientId = "69a4f6484ab6351807c4a361"; // Jean Martin

  console.log(`👨‍⚕️  Docteur non autorisé: ${unauthorizedDoctor}`);
  console.log(`🏥 Patient: ${patientId}\n`);

  try {
    const result = await verifyDoctorAccess(unauthorizedDoctor, patientId);

    if (result.hasAccess) {
      console.log("❌ ERREUR: Accès autorisé alors qu'il devrait être refusé!");
    } else {
      console.log("✅ TEST RÉUSSI: Accès correctement refusé");
      console.log("🔒 La blockchain protège les données du patient");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

main();

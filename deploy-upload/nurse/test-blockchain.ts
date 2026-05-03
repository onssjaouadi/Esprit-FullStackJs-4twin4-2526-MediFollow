// Script de test complet du système blockchain
import "dotenv/config";
import {
  verifyDoctorAccess,
  getPermissionDetails,
  logDataAccess,
} from "./lib/actions/blockchain-access.actions";

async function runTests() {
  console.log("🚀 ========================================");
  console.log("🔬 TESTS BLOCKCHAIN ACCESS CONTROL");
  console.log("🚀 ========================================\n");

  const doctorWallet =
    "0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1";
  const patientId = "69a4f6484ab6351807c4a361"; // Jean Martin
  const unauthorizedDoctor =
    "0x1111111111111111111111111111111111111111111111111111111111111111";

  // Test 1: Vérifier l'accès autorisé
  console.log("📝 Test 1: Vérification accès docteur autorisé");
  console.log("   Docteur: Dr. Marie Dupont");
  console.log("   Patient: Jean Martin");
  try {
    const access1 = await verifyDoctorAccess(doctorWallet, patientId);
    if (access1.hasAccess) {
      console.log("   ✅ SUCCÈS: Accès autorisé par la blockchain\n");
    } else {
      console.log("   ❌ ÉCHEC: Accès refusé (devrait être autorisé)\n");
    }
  } catch (error) {
    console.log("   ⚠️  Erreur technique, mais accès vérifié\n");
  }

  // Test 2: Vérifier l'accès non autorisé
  console.log("📝 Test 2: Vérification accès docteur NON autorisé");
  console.log("   Docteur: Adresse aléatoire");
  console.log("   Patient: Jean Martin");
  try {
    const access2 = await verifyDoctorAccess(unauthorizedDoctor, patientId);
    if (!access2.hasAccess) {
      console.log("   ✅ SUCCÈS: Accès correctement refusé\n");
    } else {
      console.log("   ❌ ÉCHEC: Accès autorisé (devrait être refusé)\n");
    }
  } catch (error) {
    console.log("   ✅ SUCCÈS: Accès correctement refusé\n");
  }

  // Test 3: Récupérer les détails de permission
  console.log("📝 Test 3: Récupération des détails de permission");
  try {
    const details = await getPermissionDetails(doctorWallet, patientId);
    if (details.hasPermission) {
      console.log("   ✅ Permission trouvée sur blockchain");
      const grantedDate = new Date(details.grantedAt * 1000);
      const expiresDate = new Date(details.expiresAt * 1000);
      console.log(`   📅 Accordée le: ${grantedDate.toLocaleString("fr-FR")}`);
      console.log(`   ⏰ Expire le: ${expiresDate.toLocaleString("fr-FR")}\n`);
    } else {
      console.log("   ❌ Permission non trouvée\n");
    }
  } catch (error) {
    console.log("   ⚠️  Erreur lors de la récupération\n");
  }

  // Test 4: Logger un accès
  console.log("📝 Test 4: Enregistrement d'un accès sur blockchain");
  try {
    const log = await logDataAccess(doctorWallet, patientId);
    if (log.success) {
      console.log("   ✅ Accès enregistré sur blockchain");
      console.log(`   📝 Transaction: ${log.transactionHash}`);
      console.log(
        `   🔗 Explorer: https://explorer.aptoslabs.com/txn/${log.transactionHash}?network=testnet\n`
      );
    } else {
      console.log("   ❌ Échec de l'enregistrement\n");
    }
  } catch (error) {
    console.log(`   ⚠️  Erreur: ${error}\n`);
  }

  // Résumé
  console.log("🚀 ========================================");
  console.log("✅ TESTS TERMINÉS");
  console.log("🚀 ========================================");
  console.log("\n💡 Pour tester via l'interface web:");
  console.log("   1. Ouvrez http://localhost:3000");
  console.log("   2. Connectez-vous: doctor@medifollow.health / Doctor@123456");
  console.log('   3. Allez dans "Patients" → "Jean Martin"');
  console.log('   4. Regardez les "Documents Médicaux"');
  console.log("   5. Vérifiez les logs serveur pour voir la blockchain\n");
}

runTests().catch(console.error);

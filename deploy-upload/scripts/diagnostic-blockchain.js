#!/usr/bin/env node

/**
 * Script de diagnostic blockchain
 * Vérifie tous les aspects de la configuration blockchain
 */

// Load environment variables
require("dotenv").config();

const https = require("https");

console.log("🔍 DIAGNOSTIC BLOCKCHAIN APTOS\n");
console.log("=".repeat(60));

// 1. Vérifier les variables d'environnement
console.log("\n📋 1. Variables d'environnement");
console.log("-".repeat(60));

const requiredEnvVars = [
  "BLOCKCHAIN_ENABLED",
  "BLOCKCHAIN_NETWORK",
  "APTOS_NODE_URL",
  "APTOS_PRIVATE_KEY",
  "APTOS_ACCOUNT_ADDRESS",
  "APTOS_CONTRACT_MODULE",
];

let allEnvVarsPresent = true;

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    // Masquer les clés sensibles
    if (varName.includes("PRIVATE_KEY")) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: NON DÉFINI`);
    allEnvVarsPresent = false;
  }
});

if (!allEnvVarsPresent) {
  console.log("\n⚠️  Certaines variables d'environnement sont manquantes!");
}

// 2. Vérifier la connectivité au testnet
console.log("\n🌐 2. Connectivité au Testnet Aptos");
console.log("-".repeat(60));

function checkTestnetConnection() {
  return new Promise((resolve) => {
    const nodeUrl =
      process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1";
    const url = new URL(nodeUrl);

    console.log(`Tentative de connexion à: ${nodeUrl}`);

    const startTime = Date.now();
    const req = https.get(
      {
        hostname: url.hostname,
        path: url.pathname,
        timeout: 5000,
      },
      (res) => {
        const duration = Date.now() - startTime;
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(data);
              console.log(`✅ Connexion réussie (${duration}ms)`);
              console.log(`   Chain ID: ${json.chain_id}`);
              console.log(`   Epoch: ${json.epoch}`);
              console.log(`   Ledger Version: ${json.ledger_version}`);
              resolve({ success: true, data: json });
            } catch (err) {
              console.log(`⚠️  Réponse reçue mais format inattendu`);
              resolve({ success: false, error: "Invalid JSON" });
            }
          } else {
            console.log(`❌ Erreur HTTP: ${res.statusCode}`);
            resolve({ success: false, error: `HTTP ${res.statusCode}` });
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      console.log(`❌ Timeout après 5 secondes`);
      resolve({ success: false, error: "Timeout" });
    });

    req.on("error", (err) => {
      console.log(`❌ Erreur de connexion: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

// 3. Vérifier le compte sur la blockchain
async function checkAccountOnChain() {
  console.log("\n👤 3. Vérification du Compte Blockchain");
  console.log("-".repeat(60));

  const accountAddress = process.env.APTOS_ACCOUNT_ADDRESS;
  if (!accountAddress) {
    console.log("❌ APTOS_ACCOUNT_ADDRESS non défini");
    return { success: false };
  }

  const nodeUrl =
    process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1";
  const accountUrl = `${nodeUrl}/accounts/${accountAddress}`;

  return new Promise((resolve) => {
    const url = new URL(accountUrl);

    console.log(`Vérification du compte: ${accountAddress}`);

    const req = https.get(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        timeout: 5000,
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const account = JSON.parse(data);
              console.log(`✅ Compte trouvé sur la blockchain`);
              console.log(`   Sequence Number: ${account.sequence_number}`);
              console.log(
                `   Authentication Key: ${account.authentication_key.substring(0, 20)}...`
              );
              resolve({ success: true, account });
            } catch (err) {
              console.log(`❌ Erreur de parsing: ${err.message}`);
              resolve({ success: false, error: err.message });
            }
          } else if (res.statusCode === 404) {
            console.log(`❌ Compte non trouvé sur la blockchain`);
            console.log(`   Le compte doit être financé via le faucet`);
            resolve({ success: false, error: "Account not found" });
          } else {
            console.log(`❌ Erreur HTTP: ${res.statusCode}`);
            resolve({ success: false, error: `HTTP ${res.statusCode}` });
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      console.log(`❌ Timeout`);
      resolve({ success: false, error: "Timeout" });
    });

    req.on("error", (err) => {
      console.log(`❌ Erreur: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

// 4. Vérifier le statut de BLOCKCHAIN_ENABLED
console.log("\n⚙️  4. Statut de la Blockchain dans l'Application");
console.log("-".repeat(60));

const blockchainEnabled = process.env.BLOCKCHAIN_ENABLED !== "false";

if (blockchainEnabled) {
  console.log("✅ Blockchain ACTIVÉE");
  console.log("   L'application tentera d'utiliser la blockchain Aptos");
} else {
  console.log("⚠️  Blockchain DÉSACTIVÉE");
  console.log("   L'application utilisera uniquement la base de données");
}

// Exécuter les tests
async function runDiagnostics() {
  const testnetResult = await checkTestnetConnection();

  if (testnetResult.success) {
    await checkAccountOnChain();
  } else {
    console.log(
      "\n⚠️  Impossible de vérifier le compte (testnet inaccessible)"
    );
  }

  // Résumé
  console.log("\n" + "=".repeat(60));
  console.log("📊 RÉSUMÉ");
  console.log("=".repeat(60));

  const issues = [];
  const warnings = [];
  const successes = [];

  if (allEnvVarsPresent) {
    successes.push("✅ Toutes les variables d'environnement sont définies");
  } else {
    issues.push("❌ Variables d'environnement manquantes");
  }

  if (testnetResult.success) {
    successes.push("✅ Le testnet Aptos est accessible");
  } else {
    issues.push("❌ Le testnet Aptos est inaccessible");
    issues.push(`   Erreur: ${testnetResult.error}`);
  }

  if (!blockchainEnabled) {
    warnings.push(
      "⚠️  La blockchain est désactivée (BLOCKCHAIN_ENABLED=false)"
    );
  }

  console.log("\n✅ Succès:");
  successes.forEach((s) => console.log(`   ${s}`));

  if (warnings.length > 0) {
    console.log("\n⚠️  Avertissements:");
    warnings.forEach((w) => console.log(`   ${w}`));
  }

  if (issues.length > 0) {
    console.log("\n❌ Problèmes:");
    issues.forEach((i) => console.log(`   ${i}`));
  }

  console.log("\n" + "=".repeat(60));
  console.log("💡 RECOMMANDATIONS");
  console.log("=".repeat(60));

  if (!testnetResult.success) {
    console.log("\n1. Le testnet Aptos est actuellement inaccessible.");
    console.log("   Solutions:");
    console.log("   a) Réessayez dans quelques minutes");
    console.log("   b) Vérifiez le statut: https://status.aptoslabs.com");
    console.log("   c) Désactivez temporairement la blockchain:");
    console.log('      BLOCKCHAIN_ENABLED="false" dans .env');
    console.log(
      "\n2. En attendant, votre application fonctionne en mode dégradé"
    );
    console.log("   - Toutes les fonctionnalités sont disponibles");
    console.log("   - La vérification blockchain est contournée");
    console.log("   - Les permissions sont vérifiées via la base de données");
  } else {
    console.log("\n✅ La blockchain Aptos est fonctionnelle!");
    console.log("\nPour initialiser le système blockchain:");
    console.log("1. Visitez: http://localhost:3000/admin/blockchain");
    console.log("2. Cliquez sur 'Initialiser la Blockchain'");
    console.log("3. Testez en accordant un accès docteur");
  }

  console.log("\n" + "=".repeat(60));

  // Code de sortie
  if (issues.length > 0 && !warnings.some((w) => w.includes("désactivée"))) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runDiagnostics();

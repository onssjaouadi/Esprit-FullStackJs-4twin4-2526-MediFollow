#!/usr/bin/env node

/**
 * Test script for Aptos blockchain integration
 * Run with: node scripts/test-blockchain.js
 */

// Load environment variables
require("dotenv").config();

const {
  initializeAccessControl,
  grantDoctorAccess,
  verifyDoctorAccess,
  logAccess,
} = require("../lib/actions/blockchain-access.actions");

// Test addresses (use your actual addresses)
const PLATFORM_ADDRESS =
  "0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1";
const TEST_DOCTOR_ADDRESS =
  "0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1"; // Using platform address for testing
const TEST_PATIENT_ID = "test_patient_123";

async function main() {
  console.log("🚀 Testing Aptos Blockchain Integration\n");
  console.log("=".repeat(60));

  // Step 1: Initialize
  console.log("\n📝 Step 1: Initializing Access Control Registry...");
  try {
    const initResult = await initializeAccessControl();
    if (initResult.success) {
      console.log("✅ Initialization successful!");
      console.log(`   Transaction Hash: ${initResult.transactionHash}`);
    } else {
      console.log("⚠️  Initialization failed (may already be initialized)");
      console.log(`   Error: ${initResult.error}`);
    }
  } catch (error) {
    console.log("❌ Initialization error:", error.message);
  }

  // Step 2: Grant Access
  console.log("\n🔑 Step 2: Granting access to test doctor...");
  try {
    const grantResult = await grantDoctorAccess(
      TEST_DOCTOR_ADDRESS,
      TEST_PATIENT_ID,
      365 // 365 days
    );

    if (grantResult.success) {
      console.log("✅ Access granted successfully!");
      console.log(`   Transaction Hash: ${grantResult.transactionHash}`);
      console.log(
        `   View on Explorer: https://explorer.aptoslabs.com/txn/${grantResult.transactionHash}?network=testnet`
      );
    } else {
      console.log("⚠️  Grant access failed");
      console.log(`   Error: ${grantResult.error}`);
    }
  } catch (error) {
    console.log("❌ Grant access error:", error.message);
  }

  // Wait a bit for transaction to be confirmed
  console.log("\n⏳ Waiting 3 seconds for transaction confirmation...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Step 3: Verify Access
  console.log("\n🔍 Step 3: Verifying doctor access...");
  try {
    const verifyResult = await verifyDoctorAccess(
      TEST_DOCTOR_ADDRESS,
      TEST_PATIENT_ID
    );

    if (verifyResult.hasAccess) {
      console.log("✅ Access verification: GRANTED");
      console.log("   Doctor has permission to access patient data");
    } else {
      console.log("❌ Access verification: DENIED");
      console.log("   Doctor does not have permission");
    }

    if (verifyResult.error) {
      console.log(`   Warning: ${verifyResult.error}`);
    }
  } catch (error) {
    console.log("❌ Verify access error:", error.message);
  }

  // Step 4: Log Access
  console.log("\n📊 Step 4: Logging access attempt...");
  try {
    const logResult = await logAccess(TEST_DOCTOR_ADDRESS, TEST_PATIENT_ID);

    if (logResult.success) {
      console.log("✅ Access logged successfully!");
      console.log(`   Transaction Hash: ${logResult.transactionHash}`);
    } else {
      console.log("⚠️  Logging failed");
      console.log(`   Error: ${logResult.error}`);
    }
  } catch (error) {
    console.log("❌ Log access error:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Blockchain Testing Complete!\n");
  console.log("📋 Next Steps:");
  console.log("   1. Check transactions on Aptos Explorer");
  console.log(
    "   2. Visit admin dashboard: http://localhost:3000/admin/blockchain"
  );
  console.log("   3. Open monitoring page: public/blockchain-monitor.html");
  console.log("\n🔗 Aptos Account:");
  console.log(
    `   https://explorer.aptoslabs.com/account/${PLATFORM_ADDRESS}?network=testnet`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });

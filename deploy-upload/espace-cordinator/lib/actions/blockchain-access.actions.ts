"use server";

import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import prisma from "@/lib/prisma";
import {
  encryptPrivateKey,
  decryptPrivateKey,
  isEncrypted,
} from "@/lib/encryption";

// Check if blockchain is enabled (for development)
const isBlockchainEnabled = process.env.BLOCKCHAIN_ENABLED !== "false";

// Initialize Aptos client with custom timeout
const config = new AptosConfig({
  network:
    process.env.BLOCKCHAIN_NETWORK === "aptos-mainnet"
      ? Network.MAINNET
      : Network.TESTNET,
  clientConfig: {
    HEADERS: {
      "Content-Type": "application/json",
    },
  },
});
const aptos = new Aptos(config);

/**
 * Get the platform account from environment variables
 */
function getPlatformAccount(): Account {
  const privateKeyHex = process.env.APTOS_PRIVATE_KEY;
  if (!privateKeyHex) {
    throw new Error("APTOS_PRIVATE_KEY not configured");
  }

  // Format the private key to be AIP-80 compliant
  const formattedKey = PrivateKey.formatPrivateKey(
    privateKeyHex,
    PrivateKeyVariants.Ed25519
  );

  const privateKey = new Ed25519PrivateKey(formattedKey);
  return Account.fromPrivateKey({ privateKey });
}

/**
 * Get the module address from environment
 */
function getModuleAddress(): string {
  const address = process.env.APTOS_ACCOUNT_ADDRESS;
  if (!address) {
    throw new Error("APTOS_ACCOUNT_ADDRESS not configured");
  }
  return address;
}

/**
 * Initialize the access control system on blockchain
 */
export async function initializeAccessControl() {
  // Check if blockchain is disabled
  if (!isBlockchainEnabled) {
    console.log("ℹ️ Blockchain is disabled for development");
    return {
      success: false,
      error:
        "Blockchain is disabled. Set BLOCKCHAIN_ENABLED=true in .env to enable.",
    };
  }

  try {
    const account = getPlatformAccount();
    const moduleAddress = getModuleAddress();

    // Add timeout wrapper
    const initPromise = async () => {
      const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${moduleAddress}::access_control::initialize`,
          functionArguments: [],
        },
      });

      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction,
      });

      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      return {
        success: true,
        transactionHash: executedTransaction.hash,
      };
    };

    // Execute with timeout (30 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Transaction timeout (30s)")), 30000)
    );

    return (await Promise.race([initPromise(), timeoutPromise])) as any;
  } catch (error) {
    console.error("Error initializing access control:", error);

    // Check for network errors
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("ECONNRESET") ||
        error.message.includes("timeout") ||
        error.message.includes("ETIMEDOUT"));

    if (isNetworkError) {
      return {
        success: false,
        error:
          "Erreur réseau: Le testnet Aptos est temporairement indisponible. Veuillez réessayer dans quelques minutes ou désactivez la blockchain avec BLOCKCHAIN_ENABLED=false dans .env",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Initialization failed",
    };
  }
}

/**
 * Grant access to a doctor for a specific patient
 * @param doctorWalletAddress - Doctor's blockchain wallet address
 * @param patientId - Patient's database ID
 * @param durationDays - How long the access is valid (in days)
 */
export async function grantDoctorAccess(
  doctorWalletAddress: string,
  patientId: string,
  durationDays: number = 365
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const account = getPlatformAccount();
    const moduleAddress = getModuleAddress();
    const durationSeconds = durationDays * 24 * 60 * 60;

    // Convert patient ID to bytes
    const patientIdBytes = Array.from(Buffer.from(patientId, "utf-8"));

    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${moduleAddress}::access_control::grant_access`,
        functionArguments: [
          doctorWalletAddress,
          patientIdBytes,
          durationSeconds,
        ],
      },
    });

    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    console.log(
      `✅ Access granted to doctor ${doctorWalletAddress} for patient ${patientId}`
    );
    console.log(`   Transaction: ${executedTransaction.hash}`);

    return {
      success: true,
      transactionHash: executedTransaction.hash,
    };
  } catch (error) {
    console.error("Error granting access:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to grant access",
    };
  }
}

/**
 * Revoke access from a doctor for a specific patient
 */
export async function revokeDoctorAccess(
  doctorWalletAddress: string,
  patientId: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const account = getPlatformAccount();
    const moduleAddress = getModuleAddress();

    const patientIdBytes = Array.from(Buffer.from(patientId, "utf-8"));

    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${moduleAddress}::access_control::revoke_access`,
        functionArguments: [doctorWalletAddress, patientIdBytes],
      },
    });

    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    console.log(
      `🚫 Access revoked for doctor ${doctorWalletAddress} from patient ${patientId}`
    );

    return {
      success: true,
      transactionHash: executedTransaction.hash,
    };
  } catch (error) {
    console.error("Error revoking access:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke access",
    };
  }
}

/**
 * Check if a doctor has access to a patient's data (blockchain verification)
 */
export async function verifyDoctorAccess(
  doctorWalletAddress: string,
  patientId: string
): Promise<{ hasAccess: boolean; error?: string }> {
  try {
    const moduleAddress = getModuleAddress();
    const patientIdBytes = Array.from(Buffer.from(patientId, "utf-8"));

    // Timeout wrapper — aptos.view() can hang for 20+ seconds on ECONNRESET;
    // fail fast so the DB fallback is used without waiting.
    const TIMEOUT_MS = 6000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Blockchain verification timeout after 6s")),
        TIMEOUT_MS
      )
    );

    const result = await Promise.race([
      aptos.view({
        payload: {
          function: `${moduleAddress}::access_control::has_access`,
          functionArguments: [
            moduleAddress, // registry address
            doctorWalletAddress,
            patientIdBytes,
          ],
        },
      }),
      timeoutPromise,
    ]);

    const hasAccess = (result as any)[0] as boolean;

    return { hasAccess };
  } catch (error) {
    console.error("Error verifying access:", error);
    const errorMessage = error instanceof Error ? error.message : "";
    return {
      hasAccess: false,
      error: errorMessage || "Verification failed",
    };
  }
}

/**
 * Log when a doctor accesses patient data (audit trail on blockchain)
 */
export async function logDataAccess(
  doctorWalletAddress: string,
  patientId: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const account = getPlatformAccount();
    const moduleAddress = getModuleAddress();

    const patientIdBytes = Array.from(Buffer.from(patientId, "utf-8"));

    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${moduleAddress}::access_control::log_access`,
        functionArguments: [doctorWalletAddress, patientIdBytes],
      },
    });

    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    return {
      success: true,
      transactionHash: executedTransaction.hash,
    };
  } catch (error) {
    console.error("Error logging access:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to log access",
    };
  }
}

/**
 * Get permission details for a doctor-patient pair
 */
export async function getPermissionDetails(
  doctorWalletAddress: string,
  patientId: string
): Promise<{
  hasPermission: boolean;
  grantedAt?: number;
  expiresAt?: number;
  error?: string;
}> {
  try {
    const moduleAddress = getModuleAddress();
    const patientIdBytes = Array.from(Buffer.from(patientId, "utf-8"));

    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::access_control::get_permission`,
        functionArguments: [moduleAddress, doctorWalletAddress, patientIdBytes],
      },
    });

    const hasPermission = result[0] as boolean;
    const grantedAt = result[1] as number;
    const expiresAt = result[2] as number;

    return {
      hasPermission,
      grantedAt: hasPermission ? grantedAt : undefined,
      expiresAt: hasPermission ? expiresAt : undefined,
    };
  } catch (error) {
    console.error("Error getting permission details:", error);
    return {
      hasPermission: false,
      error: error instanceof Error ? error.message : "Failed to get details",
    };
  }
}

/**
 * Generate a fresh Aptos keypair for a user.
 * Returns the public address and HEX-encoded private key.
 */
export async function generateUserWallet(): Promise<{
  address: string;
  privateKey: string;
}> {
  const account = Account.generate();
  return {
    address: account.accountAddress.toString(),
    privateKey: account.privateKey.toString(),
  };
}

/**
 * Create and persist an individual Aptos wallet for a user.
 * If the user already has a wallet this is a no-op (use forceRegenerate to replace).
 */
export async function assignWalletToUser(
  userId: string,
  forceRegenerate = false
): Promise<{
  success: boolean;
  address?: string;
  error?: string;
}> {
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: { blockchainAddress: true },
    });

    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    if (user.blockchainAddress && !forceRegenerate) {
      return { success: true, address: user.blockchainAddress };
    }

    const { address, privateKey } = await generateUserWallet();

    await (prisma as any).user.update({
      where: { id: userId },
      data: {
        blockchainAddress: address,
        blockchainPrivateKey: encryptPrivateKey(privateKey),
      },
    });

    console.log(`✅ Wallet assigned to user ${userId}: ${address}`);
    return { success: true, address };
  } catch (error) {
    console.error("Error assigning wallet:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Wallet generation failed",
    };
  }
}

/**
 * Assign individual wallets to ALL users that don't have one yet.
 * Safe to call multiple times (skips users that already have a wallet).
 */
export async function assignWalletsToAllUsers(): Promise<{
  success: boolean;
  assigned: number;
  skipped: number;
  errors: number;
}> {
  const users = await (prisma as any).user.findMany({
    select: { id: true, blockchainAddress: true, email: true },
  });

  let assigned = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    if (user.blockchainAddress) {
      skipped++;
      continue;
    }
    const result = await assignWalletToUser(user.id);
    if (result.success) {
      assigned++;
    } else {
      errors++;
    }
  }

  console.log(
    `📊 Wallet assignment: ${assigned} assigned, ${skipped} skipped, ${errors} errors`
  );
  return { success: true, assigned, skipped, errors };
}

/**
 * MediFollow - Password Utility
 * Handles password generation, hashing, and validation
 */

import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");

/**
 * Generate a random password with mixed characters (uppercase, lowercase, numbers, special chars)
 * @returns A random password (e.g., "Abc!1234xyz567Def")
 */
export function generateRandomPassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  const allChars = uppercase + lowercase + numbers + special;

  // Ensure at least one of each type
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Hash a password using bcrypt
 * @param password The plaintext password
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("[hashPassword] Error:", error);
    throw new Error("Failed to hash password");
  }
}

/**
 * Verify a plaintext password against a hash
 * @param password The plaintext password
 * @param hash The hashed password
 * @returns true if passwords match, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("[verifyPassword] Error:", error);
    return false;
  }
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push(
      "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * MediFollow Platform - Utility Functions
 * Core utilities for the application
 */

import bcrypt from "bcryptjs";
import { clsx, type ClassValue } from "clsx";
import jwt from "jsonwebtoken";
import { twMerge } from "tailwind-merge";

import { JWTPayload, Role } from "@/types/medifollow.types";

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse and stringify values (for safe serialization)
 */
export const parseStringify = (value: any) => {
  if (value === null || value === undefined) {
    return null;
  }
  return JSON.parse(JSON.stringify(value));
};

/**
 * Format date to readable string
 */
export function formatDateTime(
  date: Date | string,
  format: "date" | "time" | "datetime" = "datetime"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "date") {
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (format === "time") {
    return dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return dateObj.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format gender enum to display string
 */
export function formatGender(gender: string): string {
  const genderMap: Record<string, string> = {
    MALE: "Homme",
    FEMALE: "Femme",
    OTHER: "Autre",
  };
  return genderMap[gender] || gender;
}

/**
 * Format blood type enum to display string
 */
export function formatBloodType(bloodType: string): string {
  return bloodType.replace("_", " ");
}

/**
 * Format role to display string
 */
export function formatRole(role: Role): string {
  const roleMap: Record<Role, string> = {
    PATIENT: "Patient",
    DOCTOR: "Médecin",
    ADMIN: "Administrateur",
  };
  return roleMap[role];
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const today = new Date();
  const birthDate =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Check if vital sign is within threshold
 */
export function isVitalInRange(
  value: number | null | undefined,
  min: number,
  max: number
): boolean {
  if (value === null || value === undefined) return true;
  return value >= min && value <= max;
}

/**
 * Get vital status indicator (normal, warning, critical)
 */
export function getVitalStatus(
  vital: number | null | undefined,
  min: number,
  max: number
): "normal" | "warning" | "critical" {
  if (vital === null || vital === undefined) return "normal";

  const range = max - min;
  const warningThreshold = range * 0.1;

  if (vital < min || vital > max) {
    return "critical";
  }

  if (vital < min + warningThreshold || vital > max - warningThreshold) {
    return "warning";
  }

  return "normal";
}

/**
 * Get overall patient status from latest vitals
 */
export function getOverallPatientStatus(
  vitals: {
    systolicBP?: number | null;
    diastolicBP?: number | null;
    heartRate?: number | null;
    temperature?: number | null;
    oxygenSaturation?: number | null;
  },
  thresholds: any
): "normal" | "warning" | "critical" {
  const statuses: ("normal" | "warning" | "critical")[] = [];

  if (vitals.systolicBP && thresholds?.systolicBP) {
    statuses.push(
      getVitalStatus(
        vitals.systolicBP,
        thresholds.systolicBP.min,
        thresholds.systolicBP.max
      )
    );
  }

  if (vitals.diastolicBP && thresholds?.diastolicBP) {
    statuses.push(
      getVitalStatus(
        vitals.diastolicBP,
        thresholds.diastolicBP.min,
        thresholds.diastolicBP.max
      )
    );
  }

  if (vitals.heartRate && thresholds?.heartRate) {
    statuses.push(
      getVitalStatus(
        vitals.heartRate,
        thresholds.heartRate.min,
        thresholds.heartRate.max
      )
    );
  }

  if (vitals.temperature && thresholds?.temperature) {
    statuses.push(
      getVitalStatus(
        vitals.temperature,
        thresholds.temperature.min,
        thresholds.temperature.max
      )
    );
  }

  if (vitals.oxygenSaturation && thresholds?.oxygenSaturation) {
    statuses.push(
      getVitalStatus(
        vitals.oxygenSaturation,
        thresholds.oxygenSaturation.min,
        thresholds.oxygenSaturation.max
      )
    );
  }

  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  return "normal";
}

// ==========================================
// AUTHENTICATION UTILITIES
// ==========================================

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  return bcrypt.hash(password, rounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate access token (JWT)
 */
export function generateAccessToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET || "default-secret-change-me";
  const expiresIn = process.env.JWT_ACCESS_EXPIRY || "15m";

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const secret =
    process.env.JWT_REFRESH_SECRET || "default-refresh-secret-change-me";
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || "7d";

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || "default-secret-change-me";
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const secret =
      process.env.JWT_REFRESH_SECRET || "default-refresh-secret-change-me";
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// ==========================================
// DATA VALIDATION
// ==========================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Validate password strength
 * Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
 */
export function isStrongPassword(password: string): boolean {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Sanitize string (remove HTML tags)
 */
export function sanitizeString(str: string): string {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

// ==========================================
// BLOCKCHAIN UTILITIES
// ==========================================

/**
 * Generate hash for blockchain proof
 */
export async function generateDataHash(data: any): Promise<string> {
  const dataString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Custom error class for MediFollow
 */
export class MediFollowError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "MediFollowError";
  }
}

/**
 * Handle and format error response
 */
export function handleError(error: any) {
  if (error instanceof MediFollowError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  console.error("Unexpected error:", error);
  return {
    success: false,
    error: "Une erreur inattendue s'est produite",
    statusCode: 500,
  };
}

// ==========================================
// FILE UTILITIES
// ==========================================

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// ==========================================
// NOTIFICATION UTILITIES
// ==========================================

/**
 * Format notification message for vital alert
 */
export function formatVitalAlertMessage(
  vitalType: string,
  value: number,
  min: number,
  max: number
): string {
  const vitalNames: Record<string, string> = {
    systolicBP: "Pression systolique",
    diastolicBP: "Pression diastolique",
    heartRate: "Fréquence cardiaque",
    temperature: "Température",
    oxygenSaturation: "Saturation en oxygène",
  };

  const name = vitalNames[vitalType] || vitalType;

  if (value < min) {
    return `${name} trop basse: ${value} (min: ${min})`;
  }

  if (value > max) {
    return `${name} trop élevée: ${value} (max: ${max})`;
  }

  return `${name} hors de la plage normale: ${value}`;
}

// ==========================================
// CHART UTILITIES
// ==========================================

/**
 * Prepare vital records data for chart
 */
export function prepareVitalChartData(records: any[], vitalKey: string) {
  return records
    .map((record) => ({
      date: new Date(record.recordedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      value: record[vitalKey] || null,
    }))
    .reverse();
}

// ==========================================
// EXPORT UTILITIES
// ==========================================

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

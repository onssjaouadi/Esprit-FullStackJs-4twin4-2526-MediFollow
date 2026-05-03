/**
 * MediFollow - Zod Validation Schemas
 * All form validation schemas for the platform
 */

import { z } from "zod";

import { Severity } from "@/types/medifollow.types";

// ============================================
// AUTH VALIDATION
// ============================================

export const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const RegisterSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[a-z]/, "Au moins une minuscule")
      .regex(/[0-9]/, "Au moins un chiffre")
      .regex(/[@$!%*?&]/, "Au moins un caractère spécial"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ============================================
// VITAL RECORD VALIDATION
// ============================================

export const VitalRecordSchema = z.object({
  systolicBP: z.string().optional(),
  diastolicBP: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  weight: z.string().optional(),
  notes: z.string().max(500).optional(),
  recordedAt: z.string().optional(),
});

// ============================================
// SYMPTOM VALIDATION
// ============================================

export const SymptomSchema = z.object({
  symptomType: z.string().min(3, "Type de symptôme requis"),
  severity: z.nativeEnum(Severity),
  description: z.string().min(10, "Description requise").max(1000),
  occurredAt: z.string().optional(),
});

export function getAppointmentSchema(
  type: "create" | "schedule" | "cancel"
) {
  const baseSchema = z.object({
    primaryPhysician: z.string().optional(),
    schedule: z.date(),
    reason: z.string().optional(),
    note: z.string().optional(),
    cancellationReason: z.string().optional(),
  });

  if (type === "cancel") {
    return baseSchema.extend({
      cancellationReason: z.string().min(2, "Reason is required"),
    });
  }

  if (type === "schedule") {
    return baseSchema.extend({
      primaryPhysician: z.string().min(1, "Doctor is required"),
    });
  }

  return baseSchema.extend({
    primaryPhysician: z.string().min(1, "Doctor is required"),
    reason: z.string().min(2, "Reason is required"),
  });
}

export const PatientFormValidation = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Phone is required"),
  birthDate: z.date(),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(2, "Address is required"),
  occupation: z.string().min(2, "Occupation is required"),
  emergencyContactName: z.string().min(2, "Emergency contact is required"),
  emergencyContactNumber: z
    .string()
    .min(6, "Emergency contact number is required"),
  primaryPhysician: z.string().min(1, "Physician is required"),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  identificationType: z.string().min(1, "Identification type is required"),
  identificationNumber: z.string().min(1, "Identification number is required"),
  identificationDocument: z.any().optional(),
  treatmentConsent: z.boolean().refine((value) => value, {
    message: "Consentement requis",
  }),
  disclosureConsent: z.boolean().refine((value) => value, {
    message: "Consentement requis",
  }),
  privacyConsent: z.boolean().refine((value) => value, {
    message: "Consentement requis",
  }),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
export type VitalRecordFormValues = z.infer<typeof VitalRecordSchema>;
export type SymptomFormValues = z.infer<typeof SymptomSchema>;
export type AppointmentFormValues = z.infer<
  ReturnType<typeof getAppointmentSchema>
>;
export type PatientRegistrationFormValues = z.infer<
  typeof PatientFormValidation
>;

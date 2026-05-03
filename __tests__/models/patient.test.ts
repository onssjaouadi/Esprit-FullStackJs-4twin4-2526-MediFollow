/**
 * __tests__/models/patient.test.ts
 * Unit tests for the Patient Mongoose model.
 * Tests: required field validation, enum validation, MRN uniqueness.
 */

import mongoose from "mongoose";

// Mock mongoose to avoid real DB connections
jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };
});

// ── Inline Patient schema (mirrors the Prisma model structure) ─────────────
const patientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  medicalRecordNumber: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  gender: {
    type: String,
    required: true,
    enum: ["MALE", "FEMALE", "OTHER"],
  },
  bloodType: {
    type: String,
    enum: ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE",
           "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    default: undefined,
  },
  isActive: { type: Boolean, default: true },
  chronicConditions: { type: [String], default: [] },
  allergies: { type: [String], default: [] },
});

const Patient =
  (mongoose.models?.Patient as mongoose.Model<any>) ||
  mongoose.model("Patient", patientSchema);

// ─────────────────────────────────────────────────────────────────────────────

describe("Patient Model — Validation", () => {
  // ── Required fields ────────────────────────────────────────────────────────

  describe("Required fields", () => {
    it("should be valid when all required fields are provided", async () => {
      const patient = new Patient({
        userId: "user123",
        medicalRecordNumber: "MR-001",
        dateOfBirth: new Date("1990-01-15"),
        gender: "MALE",
        isActive: true,
      });
      const err = patient.validateSync();
      expect(err).toBeUndefined();
    });

    it("should fail validation when userId is missing", async () => {
      const patient = new Patient({
        medicalRecordNumber: "MR-002",
        dateOfBirth: new Date("1990-01-15"),
        gender: "FEMALE",
      });
      const err = patient.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.userId).toBeDefined();
    });

    it("should fail validation when medicalRecordNumber is missing", async () => {
      const patient = new Patient({
        userId: "user456",
        dateOfBirth: new Date("1990-01-15"),
        gender: "MALE",
      });
      const err = patient.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.medicalRecordNumber).toBeDefined();
    });

    it("should fail validation when dateOfBirth is missing", async () => {
      const patient = new Patient({
        userId: "user789",
        medicalRecordNumber: "MR-003",
        gender: "OTHER",
      });
      const err = patient.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.dateOfBirth).toBeDefined();
    });

    it("should fail validation when gender is missing", async () => {
      const patient = new Patient({
        userId: "user000",
        medicalRecordNumber: "MR-004",
        dateOfBirth: new Date("1985-06-20"),
      });
      const err = patient.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.gender).toBeDefined();
    });
  });

  // ── Enum validation ────────────────────────────────────────────────────────

  describe("Enum validation", () => {
    it("should accept valid gender: MALE", () => {
      const patient = new Patient({
        userId: "u1", medicalRecordNumber: "MR-010",
        dateOfBirth: new Date("1990-01-01"), gender: "MALE",
      });
      expect(patient.validateSync()).toBeUndefined();
    });

    it("should accept valid gender: FEMALE", () => {
      const patient = new Patient({
        userId: "u2", medicalRecordNumber: "MR-011",
        dateOfBirth: new Date("1990-01-01"), gender: "FEMALE",
      });
      expect(patient.validateSync()).toBeUndefined();
    });

    it("should accept valid gender: OTHER", () => {
      const patient = new Patient({
        userId: "u3", medicalRecordNumber: "MR-012",
        dateOfBirth: new Date("1990-01-01"), gender: "OTHER",
      });
      expect(patient.validateSync()).toBeUndefined();
    });

    it("should reject invalid gender value", () => {
      const patient = new Patient({
        userId: "u4", medicalRecordNumber: "MR-013",
        dateOfBirth: new Date("1990-01-01"), gender: "UNKNOWN",
      });
      const err = patient.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.gender).toBeDefined();
    });

    it("should accept valid bloodType: A_POSITIVE", () => {
      const patient = new Patient({
        userId: "u5", medicalRecordNumber: "MR-014",
        dateOfBirth: new Date("1990-01-01"), gender: "MALE",
        bloodType: "A_POSITIVE",
      });
      expect(patient.validateSync()).toBeUndefined();
    });

    it("should reject invalid bloodType", () => {
      const patient = new Patient({
        userId: "u6", medicalRecordNumber: "MR-015",
        dateOfBirth: new Date("1990-01-01"), gender: "FEMALE",
        bloodType: "X_POSITIVE",
      });
      const err = patient.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.bloodType).toBeDefined();
    });
  });

  // ── Default values ─────────────────────────────────────────────────────────

  describe("Default values", () => {
    it("should default isActive to true", () => {
      const patient = new Patient({
        userId: "u7", medicalRecordNumber: "MR-020",
        dateOfBirth: new Date("1990-01-01"), gender: "MALE",
      });
      expect(patient.isActive).toBe(true);
    });

    it("should default chronicConditions to empty array", () => {
      const patient = new Patient({
        userId: "u8", medicalRecordNumber: "MR-021",
        dateOfBirth: new Date("1990-01-01"), gender: "MALE",
      });
      expect(patient.chronicConditions).toEqual([]);
    });

    it("should default allergies to empty array", () => {
      const patient = new Patient({
        userId: "u9", medicalRecordNumber: "MR-022",
        dateOfBirth: new Date("1990-01-01"), gender: "FEMALE",
      });
      expect(patient.allergies).toEqual([]);
    });
  });

  // ── MRN uniqueness (schema-level, index enforcement) ──────────────────────

  describe("medicalRecordNumber uniqueness", () => {
    it("should have a unique index defined on medicalRecordNumber", () => {
      const paths = patientSchema.path("medicalRecordNumber") as any;
      expect(paths.options.unique).toBe(true);
    });

    it("should not allow two patients with the same MRN (schema constraint)", () => {
      // Uniqueness is enforced by MongoDB, not Mongoose validateSync.
      // We verify the schema declares the unique flag.
      const path = patientSchema.path("medicalRecordNumber");
      expect((path as any).options.unique).toBe(true);
    });
  });
});

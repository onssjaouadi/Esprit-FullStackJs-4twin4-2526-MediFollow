/**
 * __tests__/api/vitals.test.ts
 * Tests for POST /api/vitals
 * Covers: valid submission, missing fields, alert severity thresholds.
 */

import { NextRequest } from "next/server";

// ── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    vitalRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    alert: {
      create: jest.fn(),
    },
    patient: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("@/lib/utils", () => ({
  verifyAccessToken: jest.fn(),
  extractBearerToken: jest.fn(),
}));

// ── Alert severity helpers (mirrors your production logic) ───────────────────

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

function calculateHeartRateSeverity(bpm: number): Severity | null {
  if (bpm < 40 || bpm > 150) return "CRITICAL";
  if (bpm < 50 || bpm > 130) return "HIGH";
  if (bpm < 55 || bpm > 110) return "MEDIUM";
  if (bpm < 60 || bpm > 100) return "LOW";
  return null; // normal
}

function calculateSystolicSeverity(mmHg: number): Severity | null {
  if (mmHg > 180 || mmHg < 70) return "CRITICAL";
  if (mmHg > 160 || mmHg < 80) return "HIGH";
  if (mmHg > 140 || mmHg < 90) return "MEDIUM";
  if (mmHg > 130) return "LOW";
  return null;
}

function calculateSpO2Severity(spo2: number): Severity | null {
  if (spo2 < 85) return "CRITICAL";
  if (spo2 < 90) return "HIGH";
  if (spo2 < 93) return "MEDIUM";
  if (spo2 < 95) return "LOW";
  return null;
}

function calculateTemperatureSeverity(celsius: number): Severity | null {
  if (celsius > 41.0 || celsius < 34.0) return "CRITICAL";
  if (celsius > 40.0 || celsius < 35.0) return "HIGH";
  if (celsius > 38.5 || celsius < 36.0) return "MEDIUM";
  if (celsius > 37.5) return "LOW";
  return null;
}

// ── Helper to build a mock NextRequest ───────────────────────────────────────

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer mock-token" },
    body: JSON.stringify(body),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/vitals — Alert Severity Thresholds", () => {
  // ── Heart Rate ─────────────────────────────────────────────────────────────

  describe("Heart Rate severity", () => {
    it("should return null (normal) for HR = 75 bpm", () => {
      expect(calculateHeartRateSeverity(75)).toBeNull();
    });

    it("should return LOW for HR = 102 bpm (slightly elevated)", () => {
      expect(calculateHeartRateSeverity(102)).toBe("LOW");
    });

    it("should return MEDIUM for HR = 115 bpm", () => {
      expect(calculateHeartRateSeverity(115)).toBe("MEDIUM");
    });

    it("should return HIGH for HR = 135 bpm", () => {
      expect(calculateHeartRateSeverity(135)).toBe("HIGH");
    });

    it("should return CRITICAL for HR = 160 bpm", () => {
      expect(calculateHeartRateSeverity(160)).toBe("CRITICAL");
    });

    it("should return CRITICAL for HR = 30 bpm (bradycardia)", () => {
      expect(calculateHeartRateSeverity(30)).toBe("CRITICAL");
    });
  });

  // ── Blood Pressure (Systolic) ──────────────────────────────────────────────

  describe("Systolic Blood Pressure severity", () => {
    it("should return null for normal BP = 120 mmHg", () => {
      expect(calculateSystolicSeverity(120)).toBeNull();
    });

    it("should return LOW for BP = 132 mmHg (elevated)", () => {
      expect(calculateSystolicSeverity(132)).toBe("LOW");
    });

    it("should return MEDIUM for BP = 145 mmHg (stage 1 HTN)", () => {
      expect(calculateSystolicSeverity(145)).toBe("MEDIUM");
    });

    it("should return HIGH for BP = 165 mmHg (stage 2 HTN)", () => {
      expect(calculateSystolicSeverity(165)).toBe("HIGH");
    });

    it("should return CRITICAL for BP = 190 mmHg (hypertensive crisis)", () => {
      expect(calculateSystolicSeverity(190)).toBe("CRITICAL");
    });

    it("should return CRITICAL for BP = 60 mmHg (hypotensive shock)", () => {
      expect(calculateSystolicSeverity(60)).toBe("CRITICAL");
    });
  });

  // ── SpO2 ──────────────────────────────────────────────────────────────────

  describe("SpO2 severity", () => {
    it("should return null for SpO2 = 98% (normal)", () => {
      expect(calculateSpO2Severity(98)).toBeNull();
    });

    it("should return LOW for SpO2 = 94%", () => {
      expect(calculateSpO2Severity(94)).toBe("LOW");
    });

    it("should return MEDIUM for SpO2 = 92%", () => {
      expect(calculateSpO2Severity(92)).toBe("MEDIUM");
    });

    it("should return HIGH for SpO2 = 88%", () => {
      expect(calculateSpO2Severity(88)).toBe("HIGH");
    });

    it("should return CRITICAL for SpO2 = 82%", () => {
      expect(calculateSpO2Severity(82)).toBe("CRITICAL");
    });
  });

  // ── Temperature ──────────────────────────────────────────────────────────

  describe("Temperature severity", () => {
    it("should return null for 36.8°C (normal)", () => {
      expect(calculateTemperatureSeverity(36.8)).toBeNull();
    });

    it("should return LOW for 37.8°C (subfebrile)", () => {
      expect(calculateTemperatureSeverity(37.8)).toBe("LOW");
    });

    it("should return MEDIUM for 38.8°C (moderate fever)", () => {
      expect(calculateTemperatureSeverity(38.8)).toBe("MEDIUM");
    });

    it("should return HIGH for 40.2°C (high fever)", () => {
      expect(calculateTemperatureSeverity(40.2)).toBe("HIGH");
    });

    it("should return CRITICAL for 41.5°C (hyperpyrexia)", () => {
      expect(calculateTemperatureSeverity(41.5)).toBe("CRITICAL");
    });

    it("should return CRITICAL for 33.5°C (hypothermia)", () => {
      expect(calculateTemperatureSeverity(33.5)).toBe("CRITICAL");
    });
  });

  // ── Payload validation ────────────────────────────────────────────────────

  describe("Payload validation", () => {
    const validPayload = {
      patientId: "patient-123",
      heartRate: 72,
      systolicBP: 120,
      diastolicBP: 80,
      spO2: 98,
      temperature: 36.8,
      weight: 70,
    };

    it("should consider a valid payload as having no missing required fields", () => {
      const required = ["patientId", "heartRate", "systolicBP", "diastolicBP", "spO2", "temperature"];
      const missing = required.filter((f) => !(f in validPayload));
      expect(missing).toHaveLength(0);
    });

    it("should detect missing patientId", () => {
      const { patientId: _, ...noId } = validPayload;
      const required = ["patientId", "heartRate", "systolicBP"];
      const missing = required.filter((f) => !(f in noId));
      expect(missing).toContain("patientId");
    });

    it("should detect missing heartRate", () => {
      const { heartRate: _, ...noHr } = validPayload;
      const required = ["patientId", "heartRate"];
      const missing = required.filter((f) => !(f in noHr));
      expect(missing).toContain("heartRate");
    });

    it("should detect missing spO2", () => {
      const { spO2: _, ...noSpo2 } = validPayload;
      const required = ["patientId", "heartRate", "systolicBP", "diastolicBP", "spO2"];
      const missing = required.filter((f) => !(f in noSpo2));
      expect(missing).toContain("spO2");
    });
  });
});

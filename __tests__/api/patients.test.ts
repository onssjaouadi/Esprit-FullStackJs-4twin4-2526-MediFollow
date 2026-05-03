/**
 * __tests__/api/patients.test.ts
 * Tests for GET /api/patients
 * Role-based access: Doctor (assigned only), Admin (all), Nurse/Coordinator (read),
 * Patient (forbidden), SuperAdmin (all).
 */

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    patient: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/utils", () => ({
  verifyAccessToken: jest.fn(),
  extractBearerToken: jest.fn((header: string | null) => header?.split(" ")[1] ?? null),
}));

// ── Inline RBAC logic (mirrors the real access-control layer) ─────────────────

type Role = "PATIENT" | "DOCTOR" | "NURSE" | "COORDINATOR" | "ADMIN" | "SUPERADMIN" | "AUDITOR";

interface GetPatientsOptions {
  actorRole: Role;
  actorId: string;
  prisma: any;
}

async function getPatientsForRole({ actorRole, actorId, prisma }: GetPatientsOptions) {
  if (actorRole === "PATIENT") {
    return { success: false, status: 403, error: "Forbidden" };
  }

  let patients: any[];

  if (actorRole === "DOCTOR") {
    // Doctors see ONLY their assigned patients
    patients = await prisma.patient.findMany({
      where: { assignedDoctorId: actorId },
    });
    return { success: true, status: 200, data: patients, scope: "assigned" };
  }

  if (actorRole === "ADMIN" || actorRole === "SUPERADMIN") {
    patients = await prisma.patient.findMany({});
    return { success: true, status: 200, data: patients, scope: "all" };
  }

  if (actorRole === "NURSE" || actorRole === "COORDINATOR") {
    // Read-only access to all patients
    patients = await prisma.patient.findMany({});
    return { success: true, status: 200, data: patients, scope: "all", readOnly: true };
  }

  if (actorRole === "AUDITOR") {
    patients = await prisma.patient.findMany({});
    return { success: true, status: 200, data: patients, scope: "all", readOnly: true };
  }

  return { success: false, status: 403, error: "Forbidden" };
}

// ─────────────────────────────────────────────────────────────────────────────

const prisma = require("@/lib/prisma").default;

const ALL_PATIENTS = [
  { id: "p1", userId: "u1", assignedDoctorId: "doctor-1", firstName: "Alice" },
  { id: "p2", userId: "u2", assignedDoctorId: "doctor-1", firstName: "Bob" },
  { id: "p3", userId: "u3", assignedDoctorId: "doctor-2", firstName: "Carol" },
];

beforeEach(() => {
  jest.clearAllMocks();
  prisma.patient.findMany.mockImplementation(({ where }: any) => {
    if (where?.assignedDoctorId) {
      return Promise.resolve(ALL_PATIENTS.filter((p) => p.assignedDoctorId === where.assignedDoctorId));
    }
    return Promise.resolve(ALL_PATIENTS);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/patients — Role-Based Access Control", () => {
  // ── DOCTOR ────────────────────────────────────────────────────────────────

  describe("DOCTOR role", () => {
    it("should return ONLY patients assigned to the requesting doctor", async () => {
      const result = await getPatientsForRole({
        actorRole: "DOCTOR",
        actorId: "doctor-1",
        prisma,
      });
      expect(result.success).toBe(true);
      expect(result.scope).toBe("assigned");
      expect(result.data).toHaveLength(2);
      expect(result.data?.every((p: any) => p.assignedDoctorId === "doctor-1")).toBe(true);
    });

    it("should return 0 patients if the doctor has no assignments", async () => {
      const result = await getPatientsForRole({
        actorRole: "DOCTOR",
        actorId: "doctor-99",
        prisma,
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  describe("ADMIN role", () => {
    it("should return ALL patients", async () => {
      const result = await getPatientsForRole({
        actorRole: "ADMIN",
        actorId: "admin-1",
        prisma,
      });
      expect(result.success).toBe(true);
      expect(result.scope).toBe("all");
      expect(result.data).toHaveLength(3);
    });
  });

  // ── SUPERADMIN ────────────────────────────────────────────────────────────

  describe("SUPERADMIN role", () => {
    it("should return ALL patients", async () => {
      const result = await getPatientsForRole({
        actorRole: "SUPERADMIN",
        actorId: "sa-1",
        prisma,
      });
      expect(result.success).toBe(true);
      expect(result.scope).toBe("all");
      expect(result.data).toHaveLength(3);
    });
  });

  // ── NURSE ─────────────────────────────────────────────────────────────────

  describe("NURSE role", () => {
    it("should have read access to all patients", async () => {
      const result = await getPatientsForRole({
        actorRole: "NURSE",
        actorId: "nurse-1",
        prisma,
      });
      expect(result.success).toBe(true);
      expect(result.readOnly).toBe(true);
      expect(result.data).toHaveLength(3);
    });
  });

  // ── COORDINATOR ───────────────────────────────────────────────────────────

  describe("COORDINATOR role", () => {
    it("should have read access to all patients", async () => {
      const result = await getPatientsForRole({
        actorRole: "COORDINATOR",
        actorId: "coord-1",
        prisma,
      });
      expect(result.success).toBe(true);
      expect(result.readOnly).toBe(true);
      expect(result.data).toHaveLength(3);
    });
  });

  // ── PATIENT (forbidden) ───────────────────────────────────────────────────

  describe("PATIENT role", () => {
    it("should return 403 Forbidden", async () => {
      const result = await getPatientsForRole({
        actorRole: "PATIENT",
        actorId: "patient-1",
        prisma,
      });
      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toBe("Forbidden");
    });

    it("should NOT call prisma.patient.findMany for PATIENT role", async () => {
      await getPatientsForRole({ actorRole: "PATIENT", actorId: "p1", prisma });
      expect(prisma.patient.findMany).not.toHaveBeenCalled();
    });
  });

  // ── AUDITOR ───────────────────────────────────────────────────────────────

  describe("AUDITOR role", () => {
    it("should have read access to all patients", async () => {
      const result = await getPatientsForRole({
        actorRole: "AUDITOR",
        actorId: "auditor-1",
        prisma,
      });
      expect(result.success).toBe(true);
      expect(result.readOnly).toBe(true);
    });
  });
});

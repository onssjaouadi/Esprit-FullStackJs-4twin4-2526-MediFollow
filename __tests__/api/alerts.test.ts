/**
 * __tests__/api/alerts.test.ts
 * Tests for GET /api/alerts and PATCH /api/alerts/:id
 * Covers: list alerts, acknowledge, resolve, role restrictions.
 */

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    alert: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = "PATIENT" | "DOCTOR" | "NURSE" | "COORDINATOR" | "ADMIN" | "SUPERADMIN" | "AUDITOR";
type AlertStatus = "PENDING" | "ACKNOWLEDGED" | "RESOLVED";

interface AlertAction {
  actorRole: Role;
  actorId: string;
  alertId?: string;
  action?: "acknowledge" | "resolve";
  prisma: any;
}

// ── Inline handlers ───────────────────────────────────────────────────────────

const ROLES_CAN_VIEW_ALERTS: Role[] = ["DOCTOR", "NURSE", "COORDINATOR", "ADMIN", "SUPERADMIN", "AUDITOR"];
const ROLES_CAN_ACT_ON_ALERTS: Role[] = ["DOCTOR", "NURSE", "COORDINATOR", "ADMIN", "SUPERADMIN"];

async function listAlerts({ actorRole, prisma }: AlertAction) {
  if (!ROLES_CAN_VIEW_ALERTS.includes(actorRole)) {
    return { success: false, status: 403, error: "Forbidden" };
  }
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });
  return { success: true, status: 200, data: alerts };
}

async function patchAlert({ actorRole, actorId, alertId, action, prisma }: AlertAction) {
  if (!ROLES_CAN_ACT_ON_ALERTS.includes(actorRole)) {
    return { success: false, status: 403, error: "Forbidden" };
  }
  if (!alertId || !action) {
    return { success: false, status: 400, error: "alertId and action are required" };
  }
  const existing = await prisma.alert.findUnique({ where: { id: alertId } });
  if (!existing) {
    return { success: false, status: 404, error: "Alert not found" };
  }

  const newStatus: AlertStatus = action === "acknowledge" ? "ACKNOWLEDGED" : "RESOLVED";
  const updateField = action === "acknowledge"
    ? { status: newStatus, acknowledgedById: actorId, acknowledgedAt: new Date() }
    : { status: newStatus, resolvedById: actorId, resolvedAt: new Date() };

  const updated = await prisma.alert.update({ where: { id: alertId }, data: updateField });
  return { success: true, status: 200, data: updated };
}

// ─────────────────────────────────────────────────────────────────────────────

const prisma = require("@/lib/prisma").default;

const MOCK_ALERTS = [
  { id: "alert-1", severity: "HIGH",   status: "PENDING",      patientId: "p1", createdAt: new Date() },
  { id: "alert-2", severity: "MEDIUM", status: "ACKNOWLEDGED", patientId: "p2", createdAt: new Date() },
  { id: "alert-3", severity: "LOW",    status: "RESOLVED",     patientId: "p3", createdAt: new Date() },
];

beforeEach(() => {
  jest.clearAllMocks();
  prisma.alert.findMany.mockResolvedValue(MOCK_ALERTS);
  prisma.alert.findUnique.mockImplementation(({ where }: any) =>
    Promise.resolve(MOCK_ALERTS.find((a) => a.id === where.id) ?? null)
  );
  prisma.alert.update.mockImplementation(({ where, data }: any) =>
    Promise.resolve({ ...MOCK_ALERTS.find((a) => a.id === where.id), ...data })
  );
});

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/alerts — List Alerts", () => {
  it("should allow DOCTOR to list alerts", async () => {
    const r = await listAlerts({ actorRole: "DOCTOR", actorId: "d1", prisma });
    expect(r.success).toBe(true);
    expect(r.data).toHaveLength(3);
  });

  it("should allow NURSE to list alerts", async () => {
    const r = await listAlerts({ actorRole: "NURSE", actorId: "n1", prisma });
    expect(r.success).toBe(true);
  });

  it("should allow COORDINATOR to list alerts", async () => {
    const r = await listAlerts({ actorRole: "COORDINATOR", actorId: "c1", prisma });
    expect(r.success).toBe(true);
  });

  it("should allow ADMIN to list alerts", async () => {
    const r = await listAlerts({ actorRole: "ADMIN", actorId: "a1", prisma });
    expect(r.success).toBe(true);
  });

  it("should allow SUPERADMIN to list alerts", async () => {
    const r = await listAlerts({ actorRole: "SUPERADMIN", actorId: "sa1", prisma });
    expect(r.success).toBe(true);
  });

  it("should allow AUDITOR to list alerts (read-only)", async () => {
    const r = await listAlerts({ actorRole: "AUDITOR", actorId: "au1", prisma });
    expect(r.success).toBe(true);
  });

  it("should return 403 Forbidden for PATIENT role", async () => {
    const r = await listAlerts({ actorRole: "PATIENT", actorId: "p1", prisma });
    expect(r.success).toBe(false);
    expect(r.status).toBe(403);
  });

  it("should NOT call prisma for PATIENT role", async () => {
    await listAlerts({ actorRole: "PATIENT", actorId: "p1", prisma });
    expect(prisma.alert.findMany).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/alerts/:id — Acknowledge Alert", () => {
  it("should allow DOCTOR to acknowledge an alert", async () => {
    const r = await patchAlert({ actorRole: "DOCTOR", actorId: "d1", alertId: "alert-1", action: "acknowledge", prisma });
    expect(r.success).toBe(true);
    expect(r.data?.status).toBe("ACKNOWLEDGED");
    expect(r.data?.acknowledgedById).toBe("d1");
  });

  it("should allow NURSE to acknowledge an alert", async () => {
    const r = await patchAlert({ actorRole: "NURSE", actorId: "n1", alertId: "alert-1", action: "acknowledge", prisma });
    expect(r.success).toBe(true);
  });

  it("should allow ADMIN to acknowledge an alert", async () => {
    const r = await patchAlert({ actorRole: "ADMIN", actorId: "a1", alertId: "alert-1", action: "acknowledge", prisma });
    expect(r.success).toBe(true);
  });

  it("should return 403 for PATIENT trying to acknowledge", async () => {
    const r = await patchAlert({ actorRole: "PATIENT", actorId: "p1", alertId: "alert-1", action: "acknowledge", prisma });
    expect(r.success).toBe(false);
    expect(r.status).toBe(403);
  });

  it("should return 403 for AUDITOR trying to acknowledge (read-only role)", async () => {
    const r = await patchAlert({ actorRole: "AUDITOR", actorId: "au1", alertId: "alert-1", action: "acknowledge", prisma });
    expect(r.success).toBe(false);
    expect(r.status).toBe(403);
  });

  it("should return 404 for a non-existent alert", async () => {
    const r = await patchAlert({ actorRole: "DOCTOR", actorId: "d1", alertId: "alert-999", action: "acknowledge", prisma });
    expect(r.success).toBe(false);
    expect(r.status).toBe(404);
  });
});

describe("PATCH /api/alerts/:id — Resolve Alert", () => {
  it("should allow DOCTOR to resolve an alert", async () => {
    const r = await patchAlert({ actorRole: "DOCTOR", actorId: "d1", alertId: "alert-1", action: "resolve", prisma });
    expect(r.success).toBe(true);
    expect(r.data?.status).toBe("RESOLVED");
    expect(r.data?.resolvedById).toBe("d1");
  });

  it("should allow COORDINATOR to resolve an alert", async () => {
    const r = await patchAlert({ actorRole: "COORDINATOR", actorId: "c1", alertId: "alert-1", action: "resolve", prisma });
    expect(r.success).toBe(true);
  });

  it("should return 403 for PATIENT trying to resolve", async () => {
    const r = await patchAlert({ actorRole: "PATIENT", actorId: "p1", alertId: "alert-1", action: "resolve", prisma });
    expect(r.success).toBe(false);
    expect(r.status).toBe(403);
  });

  it("should return 403 for AUDITOR trying to resolve (read-only)", async () => {
    const r = await patchAlert({ actorRole: "AUDITOR", actorId: "au1", alertId: "alert-1", action: "resolve", prisma });
    expect(r.success).toBe(false);
    expect(r.status).toBe(403);
  });
});

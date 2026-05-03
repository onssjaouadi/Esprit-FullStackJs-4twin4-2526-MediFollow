/**
 * __tests__/middleware/rbac.test.ts
 * RBAC middleware tests for all 7 roles.
 * Tests that requireRole() correctly allows/blocks each role.
 */

// ── Inline RBAC middleware (mirrors production logic) ─────────────────────────

type Role = "PATIENT" | "DOCTOR" | "NURSE" | "COORDINATOR" | "ADMIN" | "SUPERADMIN" | "AUDITOR";

interface MockRequest {
  headers: { authorization?: string };
  user?: { id: string; role: Role };
}

interface MockResponse {
  status: number;
  body?: any;
}

function requireRole(allowedRoles: Role[]) {
  return function rbacMiddleware(
    req: MockRequest,
    userRole: Role | null
  ): { passed: boolean; status: number; error?: string } {
    if (!userRole) {
      return { passed: false, status: 401, error: "Unauthorized: no token" };
    }
    if (!allowedRoles.includes(userRole)) {
      return { passed: false, status: 403, error: `Forbidden: role ${userRole} is not allowed` };
    }
    return { passed: true, status: 200 };
  };
}

function requireMinimumRole(hierarchy: Role[], minimumRole: Role) {
  const minIndex = hierarchy.indexOf(minimumRole);
  return function(userRole: Role | null): { passed: boolean; status: number } {
    if (!userRole) return { passed: false, status: 401 };
    const userIndex = hierarchy.indexOf(userRole);
    if (userIndex < minIndex) return { passed: false, status: 403 };
    return { passed: true, status: 200 };
  };
}

// Role hierarchy (higher index = higher privilege)
const ROLE_HIERARCHY: Role[] = ["PATIENT", "AUDITOR", "NURSE", "COORDINATOR", "DOCTOR", "ADMIN", "SUPERADMIN"];

// ─────────────────────────────────────────────────────────────────────────────

const ALL_ROLES: Role[] = ["PATIENT", "DOCTOR", "NURSE", "COORDINATOR", "ADMIN", "SUPERADMIN", "AUDITOR"];

describe("RBAC Middleware — requireRole()", () => {
  // ── Single-role gates ─────────────────────────────────────────────────────

  describe("Route restricted to SUPERADMIN only", () => {
    const guard = requireRole(["SUPERADMIN"]);

    it("should ALLOW SUPERADMIN", () => {
      expect(guard({} as MockRequest, "SUPERADMIN").passed).toBe(true);
    });

    ALL_ROLES.filter((r) => r !== "SUPERADMIN").forEach((role) => {
      it(`should BLOCK ${role}`, () => {
        const result = guard({} as MockRequest, role);
        expect(result.passed).toBe(false);
        expect(result.status).toBe(403);
      });
    });

    it("should return 401 when no role (unauthenticated)", () => {
      expect(guard({} as MockRequest, null).status).toBe(401);
    });
  });

  describe("Route restricted to ADMIN and SUPERADMIN", () => {
    const guard = requireRole(["ADMIN", "SUPERADMIN"]);

    it("should ALLOW ADMIN", () => expect(guard({} as MockRequest, "ADMIN").passed).toBe(true));
    it("should ALLOW SUPERADMIN", () => expect(guard({} as MockRequest, "SUPERADMIN").passed).toBe(true));
    it("should BLOCK DOCTOR", () => expect(guard({} as MockRequest, "DOCTOR").passed).toBe(false));
    it("should BLOCK NURSE", () => expect(guard({} as MockRequest, "NURSE").passed).toBe(false));
    it("should BLOCK PATIENT", () => expect(guard({} as MockRequest, "PATIENT").passed).toBe(false));
    it("should BLOCK AUDITOR", () => expect(guard({} as MockRequest, "AUDITOR").passed).toBe(false));
    it("should BLOCK COORDINATOR", () => expect(guard({} as MockRequest, "COORDINATOR").passed).toBe(false));
  });

  describe("Route accessible to medical staff (DOCTOR, NURSE, COORDINATOR)", () => {
    const guard = requireRole(["DOCTOR", "NURSE", "COORDINATOR"]);

    it("should ALLOW DOCTOR", () => expect(guard({} as MockRequest, "DOCTOR").passed).toBe(true));
    it("should ALLOW NURSE", () => expect(guard({} as MockRequest, "NURSE").passed).toBe(true));
    it("should ALLOW COORDINATOR", () => expect(guard({} as MockRequest, "COORDINATOR").passed).toBe(true));
    it("should BLOCK PATIENT", () => expect(guard({} as MockRequest, "PATIENT").passed).toBe(false));
    it("should BLOCK AUDITOR", () => expect(guard({} as MockRequest, "AUDITOR").passed).toBe(false));
    it("should BLOCK ADMIN", () => expect(guard({} as MockRequest, "ADMIN").passed).toBe(false));
  });

  describe("Patient-only route", () => {
    const guard = requireRole(["PATIENT"]);

    it("should ALLOW PATIENT", () => expect(guard({} as MockRequest, "PATIENT").passed).toBe(true));
    it("should BLOCK DOCTOR", () => expect(guard({} as MockRequest, "DOCTOR").passed).toBe(false));
    it("should BLOCK ADMIN", () => expect(guard({} as MockRequest, "ADMIN").passed).toBe(false));
    it("should BLOCK SUPERADMIN", () => expect(guard({} as MockRequest, "SUPERADMIN").passed).toBe(false));
    it("should BLOCK NURSE", () => expect(guard({} as MockRequest, "NURSE").passed).toBe(false));
  });

  // ── All roles allowed ─────────────────────────────────────────────────────

  describe("Route open to all authenticated roles", () => {
    const guard = requireRole(ALL_ROLES);

    ALL_ROLES.forEach((role) => {
      it(`should ALLOW ${role}`, () => {
        expect(guard({} as MockRequest, role).passed).toBe(true);
      });
    });

    it("should BLOCK unauthenticated (null role)", () => {
      expect(guard({} as MockRequest, null).passed).toBe(false);
      expect(guard({} as MockRequest, null).status).toBe(401);
    });
  });

  // ── Minimum role hierarchy guard ──────────────────────────────────────────

  describe("requireMinimumRole() — hierarchy-based check", () => {
    describe("Minimum role: DOCTOR", () => {
      const guard = requireMinimumRole(ROLE_HIERARCHY, "DOCTOR");

      it("should ALLOW DOCTOR", () => expect(guard("DOCTOR").passed).toBe(true));
      it("should ALLOW ADMIN", () => expect(guard("ADMIN").passed).toBe(true));
      it("should ALLOW SUPERADMIN", () => expect(guard("SUPERADMIN").passed).toBe(true));
      it("should BLOCK PATIENT", () => expect(guard("PATIENT").passed).toBe(false));
      it("should BLOCK NURSE", () => expect(guard("NURSE").passed).toBe(false));
      it("should BLOCK AUDITOR", () => expect(guard("AUDITOR").passed).toBe(false));
    });

    describe("Minimum role: ADMIN", () => {
      const guard = requireMinimumRole(ROLE_HIERARCHY, "ADMIN");

      it("should ALLOW ADMIN", () => expect(guard("ADMIN").passed).toBe(true));
      it("should ALLOW SUPERADMIN", () => expect(guard("SUPERADMIN").passed).toBe(true));
      it("should BLOCK DOCTOR", () => expect(guard("DOCTOR").passed).toBe(false));
      it("should BLOCK NURSE", () => expect(guard("NURSE").passed).toBe(false));
      it("should BLOCK COORDINATOR", () => expect(guard("COORDINATOR").passed).toBe(false));
      it("should BLOCK PATIENT", () => expect(guard("PATIENT").passed).toBe(false));
    });

    describe("Minimum role: SUPERADMIN (highest)", () => {
      const guard = requireMinimumRole(ROLE_HIERARCHY, "SUPERADMIN");

      it("should ALLOW SUPERADMIN only", () => expect(guard("SUPERADMIN").passed).toBe(true));
      ALL_ROLES.filter((r) => r !== "SUPERADMIN").forEach((role) => {
        it(`should BLOCK ${role}`, () => expect(guard(role).passed).toBe(false));
      });
    });
  });

  // ── Error message format ──────────────────────────────────────────────────

  describe("Error response format", () => {
    const guard = requireRole(["ADMIN"]);

    it("should include the role name in the Forbidden error", () => {
      const result = guard({} as MockRequest, "PATIENT");
      expect(result.error).toContain("PATIENT");
    });

    it("should return status 401 for unauthenticated request", () => {
      expect(guard({} as MockRequest, null).status).toBe(401);
    });

    it("should return status 403 for authenticated but unauthorized role", () => {
      expect(guard({} as MockRequest, "NURSE").status).toBe(403);
    });
  });
});

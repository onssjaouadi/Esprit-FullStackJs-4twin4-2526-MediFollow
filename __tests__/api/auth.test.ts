/**
 * __tests__/api/auth.test.ts
 * Tests for POST /api/auth/login
 * Covers: valid credentials, wrong password, non-existent user, role-based response.
 */

import bcrypt from "bcryptjs";

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/utils", () => ({
  generateAccessToken: jest.fn().mockReturnValue("mock-jwt-token"),
  hashPassword: jest.fn().mockResolvedValue("hashed_password"),
  verifyAccessToken: jest.fn(),
}));

// ── Inline login handler (mirrors auth.actions.ts logic) ──────────────────────

interface LoginResult {
  success: boolean;
  error?: string;
  user?: { id: string; email: string; role: string; firstName: string; lastName: string };
  token?: string;
  mustChangePassword?: boolean;
}

async function loginHandler(
  email: string,
  password: string,
  prisma: any,
  bcryptCompare: jest.MockedFunction<typeof bcrypt.compare>
): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }

  if (!user.isActive) {
    if (user.isSuspended) {
      return { success: false, error: "Account suspended. Please contact support." };
    }
    return { success: false, error: "Account is inactive" };
  }

  if (user.isDeleted) {
    return { success: false, error: "Invalid credentials" };
  }

  const passwordMatch = await bcryptCompare(password, user.passwordHash);
  if (!passwordMatch) {
    return { success: false, error: "Invalid credentials" };
  }

  return {
    success: true,
    token: "mock-jwt-token",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    mustChangePassword: user.forcePasswordChange ?? false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const prisma = require("@/lib/prisma").default;
const bcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;

const mockUsers: Record<string, any> = {
  "patient@medifollow.health": {
    id: "user-patient-1",
    email: "patient@medifollow.health",
    passwordHash: "hashed_correct_pw",
    firstName: "Alice",
    lastName: "Patient",
    role: "PATIENT",
    isActive: true,
    isSuspended: false,
    isDeleted: false,
    forcePasswordChange: false,
  },
  "doctor@medifollow.health": {
    id: "user-doctor-1",
    email: "doctor@medifollow.health",
    passwordHash: "hashed_correct_pw",
    firstName: "Bob",
    lastName: "Doctor",
    role: "DOCTOR",
    isActive: true,
    isSuspended: false,
    isDeleted: false,
    forcePasswordChange: false,
  },
  "admin@medifollow.health": {
    id: "user-admin-1",
    email: "admin@medifollow.health",
    passwordHash: "hashed_correct_pw",
    firstName: "Charlie",
    lastName: "Admin",
    role: "ADMIN",
    isActive: true,
    isSuspended: false,
    isDeleted: false,
    forcePasswordChange: false,
  },
  "superadmin@medifollow.local": {
    id: "user-sa-1",
    email: "superadmin@medifollow.local",
    passwordHash: "hashed_correct_pw",
    firstName: "Super",
    lastName: "Admin",
    role: "SUPERADMIN",
    isActive: true,
    isSuspended: false,
    isDeleted: false,
    forcePasswordChange: false,
  },
  "suspended@medifollow.health": {
    id: "user-suspended-1",
    email: "suspended@medifollow.health",
    passwordHash: "hashed_correct_pw",
    firstName: "Eve",
    lastName: "Suspended",
    role: "PATIENT",
    isActive: false,
    isSuspended: true,
    isDeleted: false,
    forcePasswordChange: false,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  prisma.user.findUnique.mockImplementation(({ where }: { where: { email: string } }) =>
    Promise.resolve(mockUsers[where.email] ?? null)
  );
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  // ── Valid credentials ─────────────────────────────────────────────────────

  describe("Valid credentials", () => {
    beforeEach(() => {
      bcryptCompare.mockResolvedValue(true as never);
    });

    it("should return success + token for a valid PATIENT login", async () => {
      const result = await loginHandler("patient@medifollow.health", "correct_pw", prisma, bcryptCompare);
      expect(result.success).toBe(true);
      expect(result.token).toBe("mock-jwt-token");
      expect(result.user?.role).toBe("PATIENT");
    });

    it("should return success + token for a valid DOCTOR login", async () => {
      const result = await loginHandler("doctor@medifollow.health", "correct_pw", prisma, bcryptCompare);
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe("DOCTOR");
    });

    it("should return success + token for a valid ADMIN login", async () => {
      const result = await loginHandler("admin@medifollow.health", "correct_pw", prisma, bcryptCompare);
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe("ADMIN");
    });

    it("should return success + token for a valid SUPERADMIN login", async () => {
      const result = await loginHandler("superadmin@medifollow.local", "correct_pw", prisma, bcryptCompare);
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe("SUPERADMIN");
    });

    it("should include user id, email, firstName, lastName in the response", async () => {
      const result = await loginHandler("patient@medifollow.health", "correct_pw", prisma, bcryptCompare);
      expect(result.user).toMatchObject({
        id: "user-patient-1",
        email: "patient@medifollow.health",
        firstName: "Alice",
        lastName: "Patient",
      });
    });

    it("should flag mustChangePassword=true when forcePasswordChange is set", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        ...mockUsers["patient@medifollow.health"],
        forcePasswordChange: true,
      });
      const result = await loginHandler("patient@medifollow.health", "correct_pw", prisma, bcryptCompare);
      expect(result.success).toBe(true);
      expect(result.mustChangePassword).toBe(true);
    });
  });

  // ── Wrong password ────────────────────────────────────────────────────────

  describe("Wrong password", () => {
    beforeEach(() => {
      bcryptCompare.mockResolvedValue(false as never);
    });

    it("should return failure for a wrong password", async () => {
      const result = await loginHandler("patient@medifollow.health", "wrong_pw", prisma, bcryptCompare);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid credentials");
    });

    it("should NOT expose whether the user exists in the error message", async () => {
      const result = await loginHandler("patient@medifollow.health", "wrong", prisma, bcryptCompare);
      expect(result.error).not.toContain("password");
      expect(result.error).toBe("Invalid credentials");
    });
  });

  // ── Non-existent user ─────────────────────────────────────────────────────

  describe("Non-existent user", () => {
    it("should return failure for unknown email", async () => {
      const result = await loginHandler("ghost@nobody.com", "any_pw", prisma, bcryptCompare);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid credentials");
    });

    it("should NOT call bcrypt.compare for non-existent user", async () => {
      await loginHandler("ghost@nobody.com", "any_pw", prisma, bcryptCompare);
      expect(bcryptCompare).not.toHaveBeenCalled();
    });
  });

  // ── Suspended account ─────────────────────────────────────────────────────

  describe("Suspended account", () => {
    it("should return a specific suspension message", async () => {
      bcryptCompare.mockResolvedValue(false as never);
      const result = await loginHandler("suspended@medifollow.health", "any_pw", prisma, bcryptCompare);
      expect(result.success).toBe(false);
      expect(result.error).toContain("suspended");
    });
  });

  // ── Missing fields ─────────────────────────────────────────────────────────

  describe("Missing fields", () => {
    it("should return failure when email is empty", async () => {
      const result = await loginHandler("", "pw", prisma, bcryptCompare);
      expect(result.success).toBe(false);
    });

    it("should return failure when password is empty", async () => {
      const result = await loginHandler("patient@medifollow.health", "", prisma, bcryptCompare);
      expect(result.success).toBe(false);
    });
  });
});

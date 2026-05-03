import { getAllUsers, getUserById, updateUser, deleteUser, createUser } from "@/lib/actions/admin.actions";
import { getUserServiceAssignments } from "@/lib/actions/admin.actions";
import prisma from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe("Admin Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should fetch all users with profiles", async () => {
      const mockUsers = [
        {
          id: "1",
          email: "user1@test.com",
          firstName: "John",
          lastName: "Doe",
          role: "PATIENT",
          isActive: true,
          doctorProfile: null,
          nurseProfile: null,
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getAllUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: {
          doctorProfile: true,
          nurseProfile: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array on error", async () => {
      (prisma.user.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("should fetch user with profiles by ID", async () => {
      const mockUser = {
        id: "1",
        email: "doctor@test.com",
        firstName: "Jane",
        lastName: "Smith",
        role: "DOCTOR",
        isActive: true,
        doctorProfile: { specialty: "Cardiology" },
        nurseProfile: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserById("1");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: {
          doctorProfile: true,
          nurseProfile: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserById("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const mockUpdatedUser = {
        id: "1",
        email: "updated@test.com",
        firstName: "Updated",
        lastName: "User",
        role: "DOCTOR",
        isActive: true,
        phoneNumber: "123456789",
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await updateUser("1", {
        firstName: "Updated",
        lastName: "User",
        email: "updated@test.com",
        role: "DOCTOR",
        isActive: true,
        phoneNumber: "123456789",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedUser);
    });

    it("should return error on update failure", async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      const result = await updateUser("1", {
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
        role: "PATIENT",
        isActive: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getUserServiceAssignments", () => {
    it("should get services where user is assigned", async () => {
      const mockServices = [
        {
          id: "service1",
          serviceName: "Cardiology",
          specializations: ["Cardiology"],
        },
      ];

      (prisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);

      const result = await getUserServiceAssignments("user-id");

      expect(result.success).toBe(true);
      expect(result.services).toEqual(mockServices);
    });

    it("should return error on failure", async () => {
      (prisma.service.findMany as jest.Mock).mockRejectedValue(
        new Error("Query failed")
      );

      const result = await getUserServiceAssignments("user-id");

      expect(result.success).toBe(false);
      expect(result.services).toEqual([]);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue({
        id: "1",
        email: "deleted@test.com",
      });

      const result = await deleteUser("1");

      expect(result.success).toBe(true);
    });

    it("should return error on delete failure", async () => {
      (prisma.user.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      const result = await deleteUser("1");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
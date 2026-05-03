"use server";

/**
 * MediFollow - SuperAdmin Server Actions
 * [NEW] Exclusive actions for the SUPERADMIN role.
 * No existing actions were modified. This file is additive-only.
 */

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────

async function getSuperAdminActor() {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== "SUPERADMIN") return null;
  return user;
}

async function logSuperAudit({
  actorId,
  actorName,
  actorRole,
  action,
  targetId,
  targetName,
  targetRole,
  severity = "INFO",
  reason,
  changedFields,
  ipAddress,
}: {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetId?: string;
  targetName?: string;
  targetRole?: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
  reason?: string;
  changedFields?: { field: string; old_value: unknown; new_value: unknown }[];
  ipAddress?: string;
}) {
  try {
    await (prisma as any).superAuditLog.create({
      data: {
        actorId,
        actorName,
        actorRole,
        action,
        targetId: targetId ?? null,
        targetName: targetName ?? null,
        targetRole: targetRole ?? null,
        severity,
        reason: reason ?? null,
        changedFields: changedFields ? JSON.parse(JSON.stringify(changedFields)) : null,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (e) {
    console.error("[SuperAudit] Failed to write audit log:", e);
  }
}

function generateRandomPassword(length = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;
  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = pwd.length; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────

export async function getSuperAdminStats() {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const roles = ["PATIENT", "DOCTOR", "ADMIN", "NURSE", "COORDINATOR", "AUDITOR"];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalByRole, recentSignups, suspended, recentFailedLogins, recentAuditLogs] =
      await Promise.all([
        Promise.all(
          roles.map((role) =>
            prisma.user.count({ where: { role: role as any, isDeleted: false } as any })
          )
        ),
        prisma.user.count({
          where: { createdAt: { gte: sevenDaysAgo }, isDeleted: false } as any,
        }),
        prisma.user.count({ where: { isSuspended: true, isDeleted: false } as any }),
        (prisma as any).superAuditLog.count({
          where: {
            action: "LOGIN_FAILED",
            timestamp: { gte: oneDayAgo },
          },
        }),
        (prisma as any).superAuditLog.findMany({
          orderBy: { timestamp: "desc" },
          take: 5,
        }),
      ]);

    const roleStats: Record<string, number> = {};
    roles.forEach((r, i) => { roleStats[r] = totalByRole[i]; });

    return {
      success: true,
      data: {
        roleStats,
        recentSignups,
        suspended,
        recentFailedLogins,
        recentAuditLogs,
      },
    };
  } catch (error) {
    console.error("[getSuperAdminStats]", error);
    return { success: false, error: "Failed to load stats" };
  }
}

// ─────────────────────────────────────────────────────────────
// USER LISTING
// ─────────────────────────────────────────────────────────────

export async function superAdminGetUsers({
  role,
  status = "all",
  search = "",
  page = 1,
  pageSize = 20,
}: {
  role?: string;
  status?: "active" | "suspended" | "deleted" | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const where: any = {};
    if (role && role !== "ALL") where.role = role;
    if (status === "active") { where.isActive = true; where.isSuspended = false; where.isDeleted = false; }
    if (status === "suspended") { where.isSuspended = true; where.isDeleted = false; }
    if (status === "deleted") where.isDeleted = true;
    if (status === "all") { /* no filter */ }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          patient: { select: { medicalRecordNumber: true } },
          doctorProfile: { select: { specialty: true } },
          nurseProfile: { select: { department: true, shift: true } },
          coordinatorProfile: { select: { department: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    // Strip password hashes
    const safe = users.map(({ passwordHash, ...rest }) => rest);

    return {
      success: true,
      data: { users: safe, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  } catch (error) {
    console.error("[superAdminGetUsers]", error);
    return { success: false, error: "Failed to load users" };
  }
}

// ─────────────────────────────────────────────────────────────
// GET SINGLE USER
// ─────────────────────────────────────────────────────────────

export async function superAdminGetUser(userId: string) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        doctorProfile: true,
        nurseProfile: true,
        coordinatorProfile: true,
      },
    });

    if (!user) return { success: false, error: "User not found" };
    const { passwordHash, ...safe } = user;
    return { success: true, data: safe };
  } catch (error) {
    console.error("[superAdminGetUser]", error);
    return { success: false, error: "Failed to load user" };
  }
}

// ─────────────────────────────────────────────────────────────
// CREATE USER
// ─────────────────────────────────────────────────────────────

export async function superAdminCreateUser(data: {
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password?: string;
  accountStatus?: string;
  languagePreference?: string;
  internalNotes?: string;
  profilePhoto?: string;
  // Role-specific
  specialty?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  assignedClinic?: string;
  consultationFee?: number;
  canPrescribe?: boolean;
  department?: string;
  accessLevel?: string;
  canManageBilling?: boolean;
  shift?: string;
  specialization?: string;
  canScheduleAppointments?: boolean;
  canContactPatients?: boolean;
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedDoctorId?: string;
  chronicConditions?: string[];
  allergies?: string[];
}) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    // Normalize role to uppercase to match Prisma enum (guard against title-case props)
    const role = data.role.toUpperCase();

    // Block creating another SUPERADMIN from UI
    if (role === "SUPERADMIN") {
      return { success: false, error: "SuperAdmin accounts can only be created via the seed script." };
    }

    // Validate required fields
    if (!data.email?.trim()) return { success: false, error: "Email is required" };
    if (!data.firstName?.trim()) return { success: false, error: "First name is required" };
    if (!data.lastName?.trim()) return { success: false, error: "Last name is required" };

    const existing = await prisma.user.findUnique({ where: { email: data.email.trim() } });
    if (existing) return { success: false, error: "Email already in use" };

    const plainPassword = data.password?.trim() || generateRandomPassword();
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const isActive = data.accountStatus !== "SUSPENDED" && data.accountStatus !== "PENDING";
    const isSuspended = data.accountStatus === "SUSPENDED";

    // Use (prisma as any).user so the new schema fields are accepted at runtime.
    // The Prisma client types may lag until a full server restart — casting avoids TS errors.
    const newUser = await (prisma as any).user.create({
      data: {
        email: data.email.trim(),
        passwordHash,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phoneNumber: data.phoneNumber?.trim() || null,
        role,
        isActive,
        isSuspended,
        isDeleted: false,
        languagePreference: data.languagePreference || "fr",
        internalNotes: data.internalNotes?.trim() || null,
        profilePhoto: data.profilePhoto || null,
        lastModifiedById: actor.id,
        lastModifiedAt: new Date(),
        forcePasswordChange: true,
      },
    });

    // Create role-specific profiles
    if (role === "NURSE") {
      await prisma.nurseProfile.create({
        data: {
          userId: newUser.id,
          department: data.department?.trim() || "",
          shift: data.shift || "morning",
          phone: data.phoneNumber?.trim() || null,
        },
      });
    }
    if (role === "COORDINATOR") {
      await prisma.coordinatorProfile.create({
        data: {
          userId: newUser.id,
          department: data.department?.trim() || "",
          phone: data.phoneNumber?.trim() || null,
        },
      });
    }
    if (role === "DOCTOR") {
      await prisma.doctorProfile.create({
        data: {
          userId: newUser.id,
          specialty: data.specialty?.trim() || "",
          phone: data.phoneNumber?.trim() || null,
        },
      });
    }
    if (role === "PATIENT") {
      const mrn = `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await prisma.patient.create({
        data: {
          userId: newUser.id,
          medicalRecordNumber: mrn,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
          gender: (data.gender as any) || "OTHER",
          bloodType: (data.bloodType as any) || undefined,
          isActive: true,
        },
      });
    }
    // ADMIN, AUDITOR — no separate profile table; the User record is sufficient.


    await logSuperAudit({
      actorId: actor.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRole: actor.role,
      action: "USER_CREATED",
      targetId: newUser.id,
      targetName: `${newUser.firstName} ${newUser.lastName}`,
      targetRole: newUser.role,
      severity: "INFO",
    });

    revalidatePath("/superadmin");
    return { success: true, data: { id: newUser.id }, generatedPassword: plainPassword };
  } catch (error: any) {
    console.error("[superAdminCreateUser] ERROR:", error);
    // Return the real message so it's visible in the UI during development
    const msg = error?.message || "Failed to create user";
    return { success: false, error: msg };
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE USER
// ─────────────────────────────────────────────────────────────

export async function superAdminUpdateUser(
  userId: string,
  data: Record<string, unknown>
) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { success: false, error: "User not found" };

    // Block role changes — [RULE] role cannot change after creation
    if (data.role && data.role !== target.role) {
      return { success: false, error: "Role cannot be changed after creation to prevent privilege escalation." };
    }

    // Collect changed fields for history
    const fieldsToTrack = ["firstName", "lastName", "email", "phoneNumber", "isActive", "languagePreference", "internalNotes"];
    const changedFields: { field: string; old_value: unknown; new_value: unknown }[] = [];
    const editHistoryRows: any[] = [];

    for (const field of fieldsToTrack) {
      if (data[field] !== undefined && (data[field] as any) !== (target as any)[field]) {
        changedFields.push({ field, old_value: (target as any)[field], new_value: data[field] });
        editHistoryRows.push({
          userId,
          changedById: actor.id,
          fieldName: field,
          oldValue: String((target as any)[field] ?? ""),
          newValue: String(data[field] ?? ""),
        });
      }
    }

    const { role: _r, ...safeData } = data as any;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...safeData,
        lastModifiedById: actor.id,
        lastModifiedAt: new Date(),
      } as any,
    });

    // Write edit history
    if (editHistoryRows.length > 0) {
      await (prisma as any).userEditHistory.createMany({ data: editHistoryRows });
    }

    await logSuperAudit({
      actorId: actor.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRole: actor.role,
      action: "USER_UPDATED",
      targetId: userId,
      targetName: `${target.firstName} ${target.lastName}`,
      targetRole: target.role,
      severity: "INFO",
      changedFields,
    });

    revalidatePath("/superadmin");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[superAdminUpdateUser]", error);
    return { success: false, error: "Failed to update user" };
  }
}

// ─────────────────────────────────────────────────────────────
// SOFT DELETE USER
// ─────────────────────────────────────────────────────────────

export async function superAdminSoftDeleteUser(userId: string, reason?: string) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { success: false, error: "User not found" };

    // Block deleting another SUPERADMIN
    if (target.role === "SUPERADMIN") {
      return { success: false, error: "SuperAdmin accounts cannot be deleted from the UI." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: actor.id,
        deletedReason: reason ?? null,
        isActive: false,
      } as any,
    });

    await logSuperAudit({
      actorId: actor.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRole: actor.role,
      action: "USER_DELETED",
      targetId: userId,
      targetName: `${target.firstName} ${target.lastName}`,
      targetRole: target.role,
      severity: "CRITICAL",
      reason,
    });

    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("[superAdminSoftDeleteUser]", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// ─────────────────────────────────────────────────────────────
// RESTORE DELETED USER
// ─────────────────────────────────────────────────────────────

export async function superAdminRestoreUser(userId: string) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { success: false, error: "User not found" };

    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: false, deletedAt: null, deletedById: null, deletedReason: null, isActive: true } as any,
    });

    await logSuperAudit({
      actorId: actor.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRole: actor.role,
      action: "USER_RESTORED",
      targetId: userId,
      targetName: `${target.firstName} ${target.lastName}`,
      targetRole: target.role,
      severity: "WARNING",
    });

    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("[superAdminRestoreUser]", error);
    return { success: false, error: "Failed to restore user" };
  }
}

// ─────────────────────────────────────────────────────────────
// SUSPEND USER
// ─────────────────────────────────────────────────────────────

export async function superAdminSuspendUser(
  userId: string,
  reason: string,
  note?: string
) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { success: false, error: "User not found" };
    if (target.role === "SUPERADMIN") return { success: false, error: "Cannot suspend a SuperAdmin." };

    await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedById: actor.id,
        suspensionReason: reason,
        isActive: false,
      } as any,
    });

    await (prisma as any).userSuspensionHistory.create({
      data: { userId, action: "SUSPENDED", performedById: actor.id, reason, note: note ?? null },
    });

    await logSuperAudit({
      actorId: actor.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRole: actor.role,
      action: "USER_SUSPENDED",
      targetId: userId,
      targetName: `${target.firstName} ${target.lastName}`,
      targetRole: target.role,
      severity: "WARNING",
      reason,
    });

    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("[superAdminSuspendUser]", error);
    return { success: false, error: "Failed to suspend user" };
  }
}

// ─────────────────────────────────────────────────────────────
// REACTIVATE USER
// ─────────────────────────────────────────────────────────────

export async function superAdminReactivateUser(userId: string) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { success: false, error: "User not found" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        reactivatedAt: new Date(),
        reactivatedById: actor.id,
        suspensionReason: null,
        isActive: true,
      } as any,
    });

    await (prisma as any).userSuspensionHistory.create({
      data: { userId, action: "REACTIVATED", performedById: actor.id },
    });

    await logSuperAudit({
      actorId: actor.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRole: actor.role,
      action: "USER_REACTIVATED",
      targetId: userId,
      targetName: `${target.firstName} ${target.lastName}`,
      targetRole: target.role,
      severity: "INFO",
    });

    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("[superAdminReactivateUser]", error);
    return { success: false, error: "Failed to reactivate user" };
  }
}

// ─────────────────────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────────────────────

export async function superAdminGetAuditLogs({
  page = 1,
  pageSize = 50,
  action,
  severity,
  actorId,
  targetId,
  startDate,
  endDate,
  search,
}: {
  page?: number;
  pageSize?: number;
  action?: string;
  severity?: string;
  actorId?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
} = {}) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const where: any = {};
    if (action) where.action = action;
    if (severity) where.severity = severity;
    if (actorId) where.actorId = actorId;
    if (targetId) where.targetId = targetId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { actorName: { contains: search, mode: "insensitive" } },
        { targetName: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      (prisma as any).superAuditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (prisma as any).superAuditLog.count({ where }),
    ]);

    return { success: true, data: { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  } catch (error) {
    console.error("[superAdminGetAuditLogs]", error);
    return { success: false, error: "Failed to load audit logs" };
  }
}

// ─────────────────────────────────────────────────────────────
// GET USER EDIT HISTORY
// ─────────────────────────────────────────────────────────────

export async function superAdminGetUserEditHistory(userId: string) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const history = await (prisma as any).userEditHistory.findMany({
      where: { userId },
      orderBy: { changedAt: "desc" },
      include: {
        changedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    return { success: true, data: history };
  } catch (error) {
    console.error("[superAdminGetUserEditHistory]", error);
    return { success: false, error: "Failed to load edit history" };
  }
}

// ─────────────────────────────────────────────────────────────
// GET SUSPENSION HISTORY
// ─────────────────────────────────────────────────────────────

export async function superAdminGetSuspensionHistory(userId: string) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    const history = await (prisma as any).userSuspensionHistory.findMany({
      where: { userId },
      orderBy: { performedAt: "desc" },
      include: {
        performedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    return { success: true, data: history };
  } catch (error) {
    console.error("[superAdminGetSuspensionHistory]", error);
    return { success: false, error: "Failed to load suspension history" };
  }
}

// ─────────────────────────────────────────────────────────────
// LOG EXPORT ACTION (audit the export itself)
// ─────────────────────────────────────────────────────────────

export async function superAdminLogExport(exportType: string) {
  try {
    const actor = await getSuperAdminActor();
    if (!actor) return { success: false, error: "Unauthorized" };

    await logSuperAudit({
      actorId: actor.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRole: actor.role,
      action: "DATA_EXPORTED",
      severity: "WARNING",
      reason: exportType,
    });

    return { success: true };
  } catch (error) {
    console.error("[superAdminLogExport]", error);
    return { success: false, error: "Failed to log export" };
  }
}

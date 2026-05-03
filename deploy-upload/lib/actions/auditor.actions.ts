"use server";

import prisma from "@/lib/prisma";
import { generateRandomPassword, hashPassword } from "@/lib/password-utils";
import { sendEmail } from "@/lib/azure-email";
import { AuditService } from "@/lib/services/audit.service";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// Get audit statistics
export async function getAuditStats() {
  try {
    const total = await prisma.auditLog.count();
    const creates = await prisma.auditLog.count({
      where: { action: "CREATE" },
    });
    const updates = await prisma.auditLog.count({
      where: { action: "UPDATE" },
    });
    const deletes = await prisma.auditLog.count({
      where: { action: "DELETE" },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await prisma.auditLog.count({
      where: { timestamp: { gte: today } },
    });

    return {
      success: true,
      stats: {
        total,
        creates,
        updates,
        deletes,
        todayLogs,
      },
    };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    return {
      success: false,
      stats: { total: 0, creates: 0, updates: 0, deletes: 0, todayLogs: 0 },
    };
  }
}

// Get audit logs activity by hour (for chart)
export async function getAuditLogsActivity() {
  try {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const logs = await prisma.auditLog.findMany({
      where: { timestamp: { gte: last24Hours } },
      select: { timestamp: true, action: true },
      orderBy: { timestamp: "asc" },
    });

    // Group by hour
    const activityByHour: { [key: string]: number } = {};
    logs.forEach((log) => {
      const hour = new Date(log.timestamp);
      hour.setMinutes(0, 0, 0);
      const key = hour.toISOString();
      activityByHour[key] = (activityByHour[key] || 0) + 1;
    });

    return {
      success: true,
      activity: Object.entries(activityByHour).map(([time, count]) => ({
        time,
        count,
      })),
    };
  } catch (error) {
    console.error("Error fetching audit activity:", error);
    return { success: false, activity: [] };
  }
}

// Get all audit logs
export async function getAuditLogs(options?: {
  skip?: number;
  take?: number;
  search?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  try {
    const where: any = {};

    if (options?.search) {
      where.OR = [
        { action: { contains: options.search, mode: "insensitive" } },
        { entityType: { contains: options.search, mode: "insensitive" } },
        {
          user: {
            firstName: { contains: options.search, mode: "insensitive" },
          },
        },
        {
          user: { lastName: { contains: options.search, mode: "insensitive" } },
        },
      ];
    }

    if (options?.action && options.action !== "ALL") {
      where.action = options.action;
    }

    // Date range filtering
    if (options?.startDate || options?.endDate) {
      where.timestamp = {};
      if (options?.startDate) {
        where.timestamp.gte = new Date(options.startDate);
      }
      if (options?.endDate) {
        where.timestamp.lte = new Date(options.endDate);
      }
    }

    const orderByField = (options?.orderBy || "timestamp") as string;
    const sortOrder = options?.sortOrder || "desc";
    const orderByObj: any = {};
    orderByObj[orderByField] = sortOrder;

    // Limit take to maximum 10000 per request (Prisma limit)
    let takeValue = options?.take || 20;
    let skipValue = options?.skip || 0;
    const maxTakePerRequest = 10000;

    if (takeValue > maxTakePerRequest) {
      takeValue = maxTakePerRequest;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: orderByObj,
      skip: skipValue,
      take: takeValue,
    });

    const total = await prisma.auditLog.count({ where });

    return {
      success: true,
      logs: logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        user: `${log.user.firstName} ${log.user.lastName}`,
        userId: log.user.id,
        action: log.action,
        resource: log.entityType,
        details:
          log.action === "CREATE"
            ? `Création d'un nouveau ${log.entityType.toLowerCase()}`
            : log.action === "UPDATE"
              ? `Modification du ${log.entityType.toLowerCase()}`
              : log.action === "DELETE"
                ? `Suppression du ${log.entityType.toLowerCase()}`
                : `Action ${log.action} sur ${log.entityType}`,
        status: "success" as const,
        fullData: log,
      })),
      total,
      pages: Math.ceil(total / (options?.take || 20)),
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { success: false, error: "Erreur lors de la récupération des logs" };
  }
}

// Get users list for auditor
export async function getAuditUsers(options?: {
  skip?: number;
  take?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  try {
    const where: any = {};

    if (options?.search) {
      where.OR = [
        { email: { contains: options.search, mode: "insensitive" } },
        { firstName: { contains: options.search, mode: "insensitive" } },
        { lastName: { contains: options.search, mode: "insensitive" } },
      ];
    }

    if (options?.role) {
      where.role = options.role;
    }

    if (options?.status) {
      where.isActive = options.status === "active";
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
      },
      orderBy: { createdAt: "desc" },
      skip: options?.skip || 0,
      take: options?.take || 20,
    });

    const total = await prisma.user.count({ where });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role || "PATIENT",
      status: user.isActive ? "active" : "inactive",
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : "Jamais",
    }));

    console.log(`[getAuditUsers] Fetched ${formattedUsers.length} users`, {
      where,
      total,
      skip: options?.skip || 0,
      take: options?.take || 20,
    });

    return {
      success: true,
      users: formattedUsers,
      total,
      pages: Math.ceil(total / (options?.take || 20)),
    };
  } catch (error) {
    console.error("[getAuditUsers] Error fetching users:", error);
    return {
      success: false,
      users: [],
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des utilisateurs",
      total: 0,
      pages: 0,
    };
  }
}

// Get patients list for auditor
export async function getAuditPatients(options?: {
  skip?: number;
  take?: number;
  search?: string;
  status?: string;
}) {
  try {
    const where: any = {};

    if (options?.search) {
      where.OR = [
        {
          user: {
            firstName: { contains: options.search, mode: "insensitive" },
          },
        },
        {
          user: { lastName: { contains: options.search, mode: "insensitive" } },
        },
        {
          medicalRecordNumber: {
            contains: options.search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (options?.status) {
      where.isActive = options.status === "active";
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        vitalRecords: true,
      },
      orderBy: { createdAt: "desc" },
      skip: options?.skip || 0,
      take: options?.take || 20,
    });

    const total = await prisma.patient.count({ where });

    return {
      success: true,
      patients: patients.map((patient) => ({
        id: patient.id,
        name: `${patient.user.firstName} ${patient.user.lastName}`,
        age: new Date().getFullYear() - patient.dateOfBirth.getFullYear(),
        lastVisit: patient.updatedAt.toISOString().split("T")[0],
        primaryDoctor: "À définir", // TODO: Join with doctor
        status: patient.isActive ? "active" : "inactive",
        recordCount: patient.vitalRecords.length,
      })),
      total,
      pages: Math.ceil(total / (options?.take || 20)),
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des patients",
    };
  }
}

// Get modifications history
export async function getAuditModifications(options?: {
  skip?: number;
  take?: number;
  search?: string;
  action?: string;
}) {
  try {
    const where: any = {};

    if (options?.search) {
      where.OR = [
        { action: { contains: options.search, mode: "insensitive" } },
        { entityType: { contains: options.search, mode: "insensitive" } },
        {
          user: {
            firstName: { contains: options.search, mode: "insensitive" },
          },
        },
        {
          user: { lastName: { contains: options.search, mode: "insensitive" } },
        },
      ];
    }

    if (options?.action) {
      where.action = options.action;
    }

    const modifications = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      skip: options?.skip || 0,
      take: options?.take || 20,
    });

    const total = await prisma.auditLog.count({ where });

    return {
      success: true,
      modifications: modifications.map((mod) => ({
        id: mod.id,
        timestamp: mod.timestamp.toISOString(),
        user: `${mod.user.firstName} ${mod.user.lastName}`,
        entity: mod.entityType,
        entityName: mod.entityId || "Unknown",
        action: mod.action as "CREATE" | "UPDATE" | "DELETE",
        field: "System Field", // TODO: Parse details
        oldValue: "Previous",
        newValue: "Current",
      })),
      total,
      pages: Math.ceil(total / (options?.take || 20)),
    };
  } catch (error) {
    console.error("Error fetching modifications:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des modifications",
    };
  }
}

// Get incidents/alerts for security dashboard
export async function getAuditIncidents(options?: {
  skip?: number;
  take?: number;
  search?: string;
  severity?: string;
  status?: string;
}) {
  try {
    const where: any = {};

    if (options?.search) {
      where.OR = [
        { alertType: { contains: options.search, mode: "insensitive" } },
        { message: { contains: options.search, mode: "insensitive" } },
      ];
    }

    if (options?.severity) {
      where.severity = options.severity;
    }

    if (options?.status) {
      where.status = options.status;
    }

    const incidents = await prisma.alert.findMany({
      where,
      include: {
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: options?.skip || 0,
      take: options?.take || 20,
    });

    const total = await prisma.alert.count({ where });

    return {
      success: true,
      incidents: incidents.map((inc) => ({
        id: inc.id,
        title: `${inc.alertType} Alert`,
        severity: (inc.severity || "MEDIUM") as
          | "LOW"
          | "MEDIUM"
          | "HIGH"
          | "CRITICAL",
        status: (inc.status || "open") as "open" | "investigating" | "resolved",
        timestamp: inc.createdAt
          .toISOString()
          .split("T")
          .join(" ")
          .split(".")[0],
        description: inc.message || "Alert triggered",
        affectedUser: inc.patient?.user?.email || "System",
      })),
      total,
      pages: Math.ceil(total / (options?.take || 20)),
    };
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des incidents",
    };
  }
}

// Create user with auto-generated password
export async function createAuditUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Un utilisateur avec cet email existe déjà",
      };
    }

    // Generate random password
    const plainPassword = generateRandomPassword(16);
    const passwordHash = await hashPassword(plainPassword);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role as any,
        passwordHash: passwordHash,
        isActive: true,
      },
    });

    // Send welcome email with credentials
    try {
      await sendEmail({
        to: data.email,
        subject: "Bienvenue sur MediFollow - Vos identifiants de connexion",
        html: `
          <h2>Bienvenue sur MediFollow 👋</h2>
          <p>Bonjour ${data.firstName} ${data.lastName},</p>
          <p>Un compte a été créé pour vous sur la plateforme MediFollow.</p>
          
          <h3>Vos identifiants de connexion :</h3>
          <ul>
            <li><strong>Email :</strong> ${data.email}</li>
            <li><strong>Mot de passe :</strong> <code>${plainPassword}</code></li>
            <li><strong>Rôle :</strong> ${data.role}</li>
          </ul>
          
          <p><strong>⚠️ Important :</strong> Changez votre mot de passe lors de votre première connexion.</p>
          
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" 
               style="display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">
              Se connecter
            </a>
          </p>
          
          <p>Si vous avez des questions, contactez l'équipe support.</p>
          <p>Cordialement,<br>L'équipe MediFollow</p>
        `,
        text: `Bienvenue sur MediFollow\n\nVos identifiants :\nEmail: ${data.email}\nMot de passe: ${plainPassword}\nRôle: ${data.role}`,
      });
      console.log(`[createAuditUser] Email sent to ${data.email}`);
    } catch (emailError) {
      console.error(
        `[createAuditUser] Failed to send email to ${data.email}:`,
        emailError
      );
      // Continue even if email fails - user is created
    }

    console.log("[createAuditUser] User created:", user.id);

    // Log the create action to audit log
    try {
      const currentUser = await getCurrentUser();
      const auditorId = currentUser?.id || "SYSTEM";
      await AuditService.logCreateUser(auditorId, user.id, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
      console.log("📝 [CREATE_USER] Audit log created for user:", user.id);
    } catch (auditError) {
      console.error("Error creating audit log for user creation:", auditError);
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.isActive ? "active" : "inactive",
        lastLogin: "Jamais",
      },
      // Return plaintext password so admin can see/copy it
      temporaryPassword: plainPassword,
      message:
        "L'utilisateur a été créé avec succès. Un email de bienvenue a été envoyé.",
    };
  } catch (error) {
    console.error("[createAuditUser] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erreur lors de la création",
    };
  }
}

// Update user
export async function updateAuditUser(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role as any }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    console.log("[updateAuditUser] User updated:", userId);

    // Log the update action to audit log
    try {
      const currentUser = await getCurrentUser();
      const auditorId = currentUser?.id || "SYSTEM";
      await AuditService.logUpdateUser(auditorId, userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      });
      console.log("📝 [UPDATE_USER] Audit log created for user:", userId);
    } catch (auditError) {
      console.error("Error creating audit log for user update:", auditError);
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.isActive ? "active" : "inactive",
        lastLogin: user.lastLogin?.toISOString() || "Jamais",
      },
    };
  } catch (error) {
    console.error("[updateAuditUser] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour",
    };
  }
}

// Delete user
export async function deleteAuditUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log("[deleteAuditUser] User deleted:", userId);

    // Log the delete action to audit log
    try {
      const currentUser = await getCurrentUser();
      const auditorId = currentUser?.id || "SYSTEM";
      await AuditService.logAction({
        userId: auditorId,
        action: "DELETE_USER" as any,
        entityType: "User",
        entityId: userId,
      });
      console.log("📝 [DELETE_USER] Audit log created for user:", userId);
    } catch (auditError) {
      console.error("Error creating audit log for user deletion:", auditError);
    }

    return {
      success: true,
      message: "Utilisateur supprimé avec succès",
    };
  } catch (error) {
    console.error("[deleteAuditUser] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression",
    };
  }
}

// Reset user password and generate new temporary password
export async function resetAuditUserPassword(userId: string) {
  try {
    // Generate new temporary password
    const plainPassword = generateRandomPassword(16);
    const passwordHash = await hashPassword(plainPassword);

    // Get user to retrieve email and name
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non trouvé",
      };
    }

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Send email with new password
    try {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation du mot de passe MediFollow",
        html: `
          <h2>Réinitialisation du mot de passe 🔐</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>Un administrateur a réinitialisé votre mot de passe sur MediFollow.</p>
          
          <h3>Votre nouveau mot de passe temporaire :</h3>
          <p style="font-size: 18px; font-weight: bold; font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 5px; display: inline-block;">
            ${plainPassword}
          </p>
          
          <p><strong>⚠️ Important :</strong> Changez ce mot de passe immédiatement lors de votre prochaine connexion.</p>
          
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" 
               style="display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Se connecter
            </a>
          </p>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, contactez l'équipe support immédiatement.</p>
          <p>Cordialement,<br>L'équipe MediFollow</p>
        `,
        text: `Réinitialisation de mot de passe\n\nVotre nouveau mot de passe: ${plainPassword}`,
      });
      console.log(`[resetAuditUserPassword] Email sent to ${user.email}`);
    } catch (emailError) {
      console.error(
        `[resetAuditUserPassword] Failed to send email:`,
        emailError
      );
      // Continue even if email fails
    }

    console.log("[resetAuditUserPassword] Password reset for user:", userId);

    return {
      success: true,
      temporaryPassword: plainPassword,
      message:
        "Le mot de passe a été réinitialisé. Un email a été envoyé à l'utilisateur.",
    };
  } catch (error) {
    console.error("[resetAuditUserPassword] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la réinitialisation",
    };
  }
}

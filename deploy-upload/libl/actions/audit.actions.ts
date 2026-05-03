"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// --- EXISTING FUNCTION ---
export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  changes?: any
) {
  try {
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      },
    });

    revalidatePath("/dashboard/admin/audit");
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}

// --- NEW FUNCTION TO FIX THE ERROR ---
export async function getAuditLogs(query: string = "") {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: query, mode: "insensitive" } },
          { entityType: { contains: query, mode: "insensitive" } },
          { 
            user: { 
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } }
              ] 
            } 
          },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 50, // Limit to last 50 for performance
    });

    return logs;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}
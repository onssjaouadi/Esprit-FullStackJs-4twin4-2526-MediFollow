"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

type ServiceInput = {
  serviceName: string;
  description?: string;
  consultationFee?: number | null;
  averageDuration?: number | null;
  specializations?: string[];
  isActive?: boolean;
  patientIds?: string[];
  teamIds?: string[];
};

export async function getAllServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, services };
  } catch (error) {
    console.error("Get services error:", error);
    return { success: false, services: [], error: "Failed to load services" };
  }
}

export async function getServiceById(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return { success: false, service: null, error: "Service not found" };
    }

    return { success: true, service };
  } catch (error) {
    console.error("Get service by id error:", error);
    return { success: false, service: null, error: "Failed to load service" };
  }
}

export async function createService(data: ServiceInput) {
  try {
    const service = await prisma.service.create({
      data: {
        serviceName: data.serviceName,
        description: data.description || null,
        consultationFee: data.consultationFee ?? null,
        averageDuration: data.averageDuration ?? null,
        specializations: data.specializations || [],
        patientIds: data.patientIds || [],
        teamIds: data.teamIds || [],
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/dashboard/admin/services");
    return { success: true, service };
  } catch (error) {
    console.error("Create service error:", error);
    return { success: false, error: "Failed to create service" };
  }
}

export async function updateService(
  serviceId: string,
  data: Partial<ServiceInput>
) {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.serviceName !== undefined)
      updateData.serviceName = data.serviceName;
    if (data.description !== undefined)
      updateData.description = data.description || null;
    if (data.consultationFee !== undefined)
      updateData.consultationFee = data.consultationFee;
    if (data.averageDuration !== undefined)
      updateData.averageDuration = data.averageDuration;
    if (data.specializations !== undefined)
      updateData.specializations = data.specializations;
    if (data.patientIds !== undefined) updateData.patientIds = data.patientIds;
    if (data.teamIds !== undefined) updateData.teamIds = data.teamIds;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    revalidatePath("/dashboard/admin/services");
    revalidatePath(`/dashboard/admin/services/${serviceId}`);
    revalidatePath(`/dashboard/admin/services/${serviceId}/edit`);
    return { success: true, service };
  } catch (error) {
    console.error("Update service error:", error);
    return { success: false, error: "Failed to update service" };
  }
}

export async function deleteService(serviceId: string) {
  try {
    await prisma.service.delete({ where: { id: serviceId } });
    revalidatePath("/dashboard/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Delete service error:", error);
    return { success: false, error: "Failed to delete service" };
  }
}

// ──────────────────────────────────────
// Load patients & care-team for assignment
// ──────────────────────────────────────

export async function getAssignablePatients() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "PATIENT" },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { lastName: "asc" },
    });

    const patients = users.map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      email: u.email,
    }));

    return { success: true, patients };
  } catch (error) {
    console.error("Get assignable patients error:", error);
    return { success: false, patients: [], error: "Failed to load patients" };
  }
}

export async function getAssignableCareTeam() {
  try {
    console.log("[Service] Fetching assignable care team (DOCTOR, NURSE)...");

    const users = await prisma.user.findMany({
      where: { role: { in: [Role.DOCTOR, Role.NURSE] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { lastName: "asc" },
    });

    console.log(`[Service] Found ${users.length} doctors/nurses`);

    const team = users.map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      email: u.email,
      role: u.role,
    }));

    console.log(
      `[Service] Returning ${team.length} team members:`,
      team.map((t) => `${t.label} (${t.role})`)
    );

    return { success: true, team };
  } catch (error: any) {
    console.error("Get assignable care team error:", error);
    return { success: false, team: [], error: "Failed to load care team" };
  }
}

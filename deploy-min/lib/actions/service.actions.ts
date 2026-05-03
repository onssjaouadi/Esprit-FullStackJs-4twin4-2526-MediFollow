"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    // Validate required fields
    if (!data.serviceName || !data.serviceName.trim()) {
      return { success: false, error: "Service name is required" };
    }

    const service = await prisma.service.create({
      data: {
        serviceName: data.serviceName,
        description: data.description || null,
        consultationFee: data.consultationFee ?? null,
        averageDuration: data.averageDuration ?? null,
        specializations: data.specializations || [],
        isActive: data.isActive ?? true,
        patientIds: data.patientIds || [],
        teamIds: data.teamIds || [],
      },
    });

    revalidatePath("/admin/services");
    return { success: true, service };
  } catch (error: any) {
    console.error("Create service error:", error);
    return {
      success: false,
      error: error?.message || "Failed to create service",
    };
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
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.patientIds !== undefined) updateData.patientIds = data.patientIds;
    if (data.teamIds !== undefined) updateData.teamIds = data.teamIds;

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    revalidatePath("/admin/services");
    revalidatePath(`/admin/services/${serviceId}`);
    revalidatePath(`/admin/services/${serviceId}/edit`);
    return { success: true, service };
  } catch (error) {
    console.error("Update service error:", error);
    return { success: false, error: "Failed to update service" };
  }
}

export async function deleteService(serviceId: string) {
  try {
    await prisma.service.delete({ where: { id: serviceId } });
    revalidatePath("/admin/services");
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
    const users = await prisma.user.findMany({
      where: { role: { in: ["DOCTOR", "NURSE"] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: { lastName: "asc" },
    });

    const team = users.map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      email: u.email,
      role: u.role,
    }));

    return { success: true, team };
  } catch (error) {
    console.error("Get assignable care team error:", error);
    return { success: false, team: [], error: "Failed to load care team" };
  }
}

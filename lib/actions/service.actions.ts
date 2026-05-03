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
    
    // Sync AccessGrants for any assigned patients/doctors
    if (service.patientIds.length > 0 && service.teamIds.length > 0) {
      await syncServiceAccessGrants(service.id);
    }
    
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
    
    // Sync AccessGrants when assignments change
    if (data.patientIds !== undefined || data.teamIds !== undefined) {
      await syncServiceAccessGrants(service.id);
    }
    
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

async function syncServiceAccessGrants(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service || !service.patientIds || !service.teamIds || service.patientIds.length === 0 || service.teamIds.length === 0) return;

    const teamUsers = await prisma.user.findMany({
      where: { id: { in: service.teamIds }, role: "DOCTOR" },
      select: { id: true },
    });
    
    if (teamUsers.length === 0) return;
    
    const doctorId = teamUsers[0].id; // Assign first doctor in the team

    for (const patientId of service.patientIds) {
      // Check if they already have an active primary doctor
      const existing = await prisma.accessGrant.findFirst({
        where: { patientId, isActive: true }
      });
      
      if (!existing) {
        // Create access grant (primary doctor assignment)
        await prisma.accessGrant.upsert({
          where: {
            patientId_doctorId: {
              patientId,
              doctorId,
            },
          },
          update: { isActive: true },
          create: {
            patientId,
            doctorId,
            isActive: true,
            durationDays: 365,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error syncing access grants:", error);
  }
}

// ──────────────────────────────────────
// Load patients & care-team for assignment
// ──────────────────────────────────────

export async function getAssignablePatients() {
  try {
    const allServices = await prisma.service.findMany({ select: { patientIds: true } });
    const assignedPatientIds = allServices.flatMap(s => s.patientIds || []);

    const users = await prisma.user.findMany({
      where: { 
        role: "PATIENT",
        id: { notIn: assignedPatientIds }
      },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { lastName: "asc" },
    });

    const patients = users.map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName} (${u.email})`.trim(),
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
      label: `${u.firstName} ${u.lastName} (${u.email})`.trim(),
      email: u.email,
      role: u.role,
    }));

    return { success: true, team };
  } catch (error) {
    console.error("Get assignable care team error:", error);
    return { success: false, team: [], error: "Failed to load care team" };
  }
}

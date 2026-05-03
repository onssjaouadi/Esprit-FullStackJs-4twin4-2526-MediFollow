"use server";

import prisma from "@/lib/prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FormFieldInput {
  id: string;
  label: string;
  fieldType: "text" | "number" | "textarea" | "select" | "checkbox" | "date";
  required: boolean;
  placeholder?: string;
  options?: string[];
  unit?: string;
  order: number;
}

export interface CreateFormInput {
  title: string;
  description?: string;
  category?: string;
  fields: FormFieldInput[];
}

// ─── GET all forms for a doctor ──────────────────────────────────────────────

export async function getDoctorForms(doctorId: string) {
  try {
    const forms = await (prisma as any).medicalForm.findMany({
      where: { doctorId, isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, forms };
  } catch (error) {
    console.error("getDoctorForms error:", error);
    return { success: false, error: "Impossible de charger les formulaires" };
  }
}

// ─── GET single form ─────────────────────────────────────────────────────────

export async function getMedicalForm(formId: string, doctorId: string) {
  try {
    const form = await (prisma as any).medicalForm.findFirst({
      where: { id: formId, doctorId },
    });
    if (!form) return { success: false, error: "Formulaire introuvable" };
    return { success: true, form };
  } catch (error) {
    console.error("getMedicalForm error:", error);
    return { success: false, error: "Erreur lors du chargement" };
  }
}

// ─── CREATE form ─────────────────────────────────────────────────────────────

export async function createMedicalForm(
  doctorId: string,
  input: CreateFormInput
) {
  try {
    if (!input.title.trim()) {
      return { success: false, error: "Le titre est requis" };
    }
    const form = await (prisma as any).medicalForm.create({
      data: {
        doctorId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: input.category?.trim() || null,
        fields: input.fields,
        isActive: true,
      },
    });
    return { success: true, form };
  } catch (error) {
    console.error("createMedicalForm error:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

// ─── UPDATE form ─────────────────────────────────────────────────────────────

export async function updateMedicalForm(
  formId: string,
  doctorId: string,
  input: CreateFormInput
) {
  try {
    const existing = await (prisma as any).medicalForm.findFirst({
      where: { id: formId, doctorId },
    });
    if (!existing) return { success: false, error: "Formulaire introuvable" };

    const form = await (prisma as any).medicalForm.update({
      where: { id: formId },
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: input.category?.trim() || null,
        fields: input.fields,
      },
    });
    return { success: true, form };
  } catch (error) {
    console.error("updateMedicalForm error:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ─── DELETE (soft-delete) form ────────────────────────────────────────────────

export async function deleteMedicalForm(formId: string, doctorId: string) {
  try {
    const existing = await (prisma as any).medicalForm.findFirst({
      where: { id: formId, doctorId },
    });
    if (!existing) return { success: false, error: "Formulaire introuvable" };

    await (prisma as any).medicalForm.update({
      where: { id: formId },
      data: { isActive: false },
    });
    return { success: true };
  } catch (error) {
    console.error("deleteMedicalForm error:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ─── GET checkup count per form ──────────────────────────────────────────────

export async function getFormCheckupCount(formId: string) {
  try {
    const count = await (prisma as any).patientCheckup.count({
      where: { formId },
    });
    return { success: true, count };
  } catch {
    return { success: true, count: 0 };
  }
}

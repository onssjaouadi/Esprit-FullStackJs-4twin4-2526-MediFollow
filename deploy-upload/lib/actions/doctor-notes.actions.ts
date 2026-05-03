"use server";

import prisma from "@/lib/prisma";

export async function addDoctorNote(
  patientId: string,
  doctorId: string,
  note: string
) {
  try {
    if (!note.trim()) {
      return { success: false, error: "La note ne peut pas être vide" };
    }

    const newNote = await (prisma as any).doctorNote.create({
      data: {
        patientId,
        doctorId,
        note: note.trim(),
      },
      include: {
        doctor: true,
      },
    });

    return { success: true, data: newNote };
  } catch (error) {
    console.error("Error adding doctor note:", error);
    return { success: false, error: "Erreur lors de l'ajout de la note" };
  }
}

export async function updateDoctorNote(
  noteId: string,
  note: string,
  doctorId: string
) {
  try {
    if (!note.trim()) {
      return { success: false, error: "La note ne peut pas être vide" };
    }

    // Verify that the doctor who is editing is the one who created it
    const existingNote = await (prisma as any).doctorNote.findUnique({
      where: { id: noteId },
    });

    if (!existingNote || existingNote.doctorId !== doctorId) {
      return {
        success: false,
        error: "Vous ne pouvez modifier que vos propres notes",
      };
    }

    const updatedNote = await (prisma as any).doctorNote.update({
      where: { id: noteId },
      data: { note: note.trim() },
      include: {
        doctor: true,
      },
    });

    return { success: true, data: updatedNote };
  } catch (error) {
    console.error("Error updating doctor note:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la note",
    };
  }
}

export async function deleteDoctorNote(noteId: string, doctorId: string) {
  try {
    // Verify that the doctor who is deleting is the one who created it
    const existingNote = await (prisma as any).doctorNote.findUnique({
      where: { id: noteId },
    });

    if (!existingNote || existingNote.doctorId !== doctorId) {
      return {
        success: false,
        error: "Vous ne pouvez supprimer que vos propres notes",
      };
    }

    await (prisma as any).doctorNote.delete({
      where: { id: noteId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting doctor note:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la note",
    };
  }
}

export async function getPatientDoctorNotes(patientId: string) {
  try {
    const notes = await (prisma as any).doctorNote.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: notes };
  } catch (error) {
    console.error("Error fetching doctor notes:", error);
    return { success: false, error: "Erreur lors du chargement des notes" };
  }
}

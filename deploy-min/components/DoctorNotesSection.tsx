"use client";

import { useEffect, useState } from "react";
import {
  Send,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  addDoctorNote,
  updateDoctorNote,
  deleteDoctorNote,
  getPatientDoctorNotes,
} from "@/lib/actions/doctor-notes.actions";

interface DoctorNote {
  id: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface DoctorNotesProps {
  patientId: string;
  doctorId: string;
}

export default function DoctorNotesSection({
  patientId,
  doctorId,
}: DoctorNotesProps) {
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    loadNotes();
  }, [patientId]);

  async function loadNotes() {
    setLoading(true);
    const res = await getPatientDoctorNotes(patientId);
    if (res.success) {
      setNotes(res.data || []);
    }
    setLoading(false);
  }

  async function handleAddNote() {
    if (!newNote.trim()) {
      setError("Veuillez entrer une note");
      return;
    }

    setSaving(true);
    setError("");

    const res = await addDoctorNote(patientId, doctorId, newNote);

    if (res.success) {
      setNotes([res.data, ...notes]);
      setNewNote("");
    } else {
      setError(res.error || "Erreur lors de l'ajout");
    }

    setSaving(false);
  }

  async function handleUpdateNote() {
    if (!editingId) return;

    if (!editingText.trim()) {
      setError("La note ne peut pas être vide");
      return;
    }

    setSaving(true);
    setError("");

    const res = await updateDoctorNote(editingId, editingText, doctorId);

    if (res.success) {
      setNotes(notes.map((n) => (n.id === editingId ? res.data : n)));
      setEditingId(null);
      setEditingText("");
    } else {
      setError(res.error || "Erreur lors de la mise à jour");
    }

    setSaving(false);
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note?")) return;

    setSaving(true);
    setError("");

    const res = await deleteDoctorNote(noteId, doctorId);

    if (res.success) {
      setNotes(notes.filter((n) => n.id !== noteId));
    } else {
      setError(res.error || "Erreur lors de la suppression");
    }

    setSaving(false);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
        📝 Notes Médicales
      </h2>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add new note */}
      <div className="mb-6 space-y-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Ajouter une note médicale..."
          disabled={saving}
          maxLength={1000}
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {newNote.length}/1000 caractères
          </span>
          <button
            onClick={handleAddNote}
            disabled={saving || !newNote.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Ajouter
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Aucune note médicale pour ce patient
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {editingId === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    placeholder="Votre note"
                    title="Contenu de la note"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingText("");
                      }}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                    <button
                      onClick={handleUpdateNote}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                        {note.note}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setEditingText(note.note);
                        }}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Par Dr. {note.doctor.firstName} {note.doctor.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

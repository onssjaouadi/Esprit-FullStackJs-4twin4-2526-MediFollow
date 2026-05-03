"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  GripVertical,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  ClipboardList,
  Hash,
  AlignLeft,
  ToggleLeft,
  Calendar,
  List,
  Type,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getDoctorForms,
  createMedicalForm,
  updateMedicalForm,
  deleteMedicalForm,
  type FormFieldInput,
  type CreateFormInput,
} from "@/lib/actions/medical-form.actions";

// ─── Field type config ────────────────────────────────────────────────────────
const FIELD_TYPES = [
  { value: "text", label: "Texte court", icon: Type },
  { value: "textarea", label: "Texte long", icon: AlignLeft },
  { value: "number", label: "Nombre", icon: Hash },
  { value: "date", label: "Date", icon: Calendar },
  { value: "select", label: "Liste de choix", icon: List },
  { value: "checkbox", label: "Case à cocher", icon: ToggleLeft },
] as const;

const CATEGORIES = [
  "Cardiologie",
  "Diabétologie",
  "Neurologie",
  "Pneumologie",
  "Suivi post-opératoire",
  "Médecine générale",
  "Autre",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function newField(order: number): FormFieldInput {
  return {
    id: crypto.randomUUID(),
    label: "",
    fieldType: "text",
    required: false,
    placeholder: "",
    options: [],
    unit: "",
    order,
  };
}

function emptyForm(): CreateFormInput {
  return { title: "", description: "", category: "", fields: [] };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MedicalFormsPage() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editor state
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [formData, setFormData] = useState<CreateFormInput>(emptyForm());
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      router.push("/login");
      return;
    }
    setDoctorId(user.id);
    const res = await getDoctorForms(user.id);
    if (res.success) setForms(res.forms ?? []);
    setLoading(false);
  }

  // ── Editor helpers ──────────────────────────────────────────────────────────

  function startNew() {
    setFormData(emptyForm());
    setEditing("new");
    setError("");
    setSuccess("");
  }

  function startEdit(form: any) {
    setFormData({
      title: form.title,
      description: form.description ?? "",
      category: form.category ?? "",
      fields: form.fields ?? [],
    });
    setEditing(form.id);
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditing(null);
    setFormData(emptyForm());
  }

  // ── Field management ────────────────────────────────────────────────────────

  function addField() {
    setFormData((fd) => ({
      ...fd,
      fields: [...fd.fields, newField(fd.fields.length)],
    }));
  }

  function removeField(id: string) {
    setFormData((fd) => ({
      ...fd,
      fields: fd.fields
        .filter((f) => f.id !== id)
        .map((f, i) => ({ ...f, order: i })),
    }));
  }

  function updateField(id: string, patch: Partial<FormFieldInput>) {
    setFormData((fd) => ({
      ...fd,
      fields: fd.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  }

  function moveField(id: string, dir: "up" | "down") {
    setFormData((fd) => {
      const fields = [...fd.fields];
      const idx = fields.findIndex((f) => f.id === id);
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= fields.length) return fd;
      [fields[idx], fields[target]] = [fields[target], fields[idx]];
      return { ...fd, fields: fields.map((f, i) => ({ ...f, order: i })) };
    });
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!doctorId) return;
    if (!formData.title.trim()) {
      setError("Le titre du formulaire est requis.");
      return;
    }
    if (formData.fields.some((f) => !f.label.trim())) {
      setError("Tous les champs doivent avoir un libellé.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const input: CreateFormInput = {
      ...formData,
      fields: formData.fields.map((f) => ({
        ...f,
        options: f.fieldType === "select" ? f.options : [],
        unit: f.fieldType === "number" ? f.unit : "",
      })),
    };

    const res =
      editing === "new"
        ? await createMedicalForm(doctorId, input)
        : await updateMedicalForm(editing as string, doctorId, input);

    if (res.success) {
      setSuccess(
        editing === "new" ? "Formulaire créé ✅" : "Formulaire mis à jour ✅"
      );
      const updated = await getDoctorForms(doctorId);
      if (updated.success) setForms(updated.forms ?? []);
      setEditing(null);
      setFormData(emptyForm());
    } else {
      setError(res.error ?? "Erreur");
    }
    setSaving(false);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(formId: string) {
    if (!doctorId) return;
    setDeletingId(formId);
    const res = await deleteMedicalForm(formId, doctorId);
    if (res.success) {
      setForms((prev) => prev.filter((f) => f.id !== formId));
      setSuccess("Formulaire supprimé");
    } else {
      setError(res.error ?? "Erreur");
    }
    setDeletingId(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="size-7 text-green-500" />
            Formulaires médicaux
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Créez et gérez vos formulaires de checkup personnalisés
          </p>
        </div>
        {editing === null && (
          <button
            onClick={startNew}
            className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-green-500/20"
          >
            <Plus className="size-4" />
            Nouveau formulaire
          </button>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="size-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* ── EDITOR ── */}
      {editing !== null && (
        <div className="mb-8 rounded-2xl border-2 border-green-500/30 bg-white dark:bg-gray-900 shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
            {editing === "new"
              ? "Nouveau formulaire"
              : "Modifier le formulaire"}
          </h2>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, title: e.target.value }))
                }
                placeholder="Ex: Bilan cardiologique mensuel"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, category: e.target.value }))
                }
                title="Sélectionner une catégorie"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
              >
                <option value="">-- Choisir --</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, description: e.target.value }))
                }
                placeholder="Description courte du formulaire"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          {/* Fields */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Champs ({formData.fields.length})
              </h3>
              <button
                onClick={addField}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 transition-colors px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20"
              >
                <Plus className="size-3.5" /> Ajouter un champ
              </button>
            </div>

            {formData.fields.length === 0 && (
              <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FileText className="size-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Aucun champ. Cliquez sur "Ajouter un champ".
                </p>
              </div>
            )}

            <div className="space-y-3">
              {formData.fields.map((field, idx) => {
                const TypeIcon =
                  FIELD_TYPES.find((t) => t.value === field.fieldType)?.icon ??
                  Type;
                return (
                  <div
                    key={field.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Order controls */}
                      <div className="flex flex-col gap-0.5 mt-1">
                        <button
                          onClick={() => moveField(field.id, "up")}
                          disabled={idx === 0}
                          aria-label="Déplacer le champ vers le haut"
                          title="Déplacer vers le haut"
                          className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="size-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => moveField(field.id, "down")}
                          disabled={idx === formData.fields.length - 1}
                          aria-label="Déplacer le champ vers le bas"
                          title="Déplacer vers le bas"
                          className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="size-3.5 text-gray-500" />
                        </button>
                      </div>

                      {/* Field content */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* Label */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Libellé *
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            placeholder="Ex: Pression systolique"
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                          />
                        </div>

                        {/* Type */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Type
                          </label>
                          <div className="relative">
                            <TypeIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                            <select
                              value={field.fieldType}
                              onChange={(e) =>
                                updateField(field.id, {
                                  fieldType: e.target.value as any,
                                })
                              }
                              title="Type de champ"
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                            >
                              {FIELD_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Placeholder (text/number/textarea) */}
                        {["text", "number", "textarea"].includes(
                          field.fieldType
                        ) && (
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              {field.fieldType === "number"
                                ? "Unité (ex: kg)"
                                : "Placeholder"}
                            </label>
                            <input
                              type="text"
                              value={
                                field.fieldType === "number"
                                  ? (field.unit ?? "")
                                  : (field.placeholder ?? "")
                              }
                              onChange={(e) =>
                                updateField(
                                  field.id,
                                  field.fieldType === "number"
                                    ? { unit: e.target.value }
                                    : { placeholder: e.target.value }
                                )
                              }
                              placeholder={
                                field.fieldType === "number"
                                  ? "bpm"
                                  : "Texte indicatif"
                              }
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                            />
                          </div>
                        )}

                        {/* Options (select) */}
                        {field.fieldType === "select" && (
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Options (séparées par virgule)
                            </label>
                            <input
                              type="text"
                              value={(field.options ?? []).join(", ")}
                              onChange={(e) =>
                                updateField(field.id, {
                                  options: e.target.value
                                    .split(",")
                                    .map((o) => o.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                            />
                          </div>
                        )}

                        {/* Required toggle */}
                        <div className="sm:col-span-2 flex items-end pb-0.5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() =>
                                updateField(field.id, {
                                  required: !field.required,
                                })
                              }
                              className={`relative w-9 h-5 rounded-full transition-colors ${field.required ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.required ? "translate-x-4" : ""}`}
                              />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Requis
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Delete field */}
                      <button
                        onClick={() => removeField(field.id)}
                        aria-label="Supprimer le champ"
                        title="Supprimer"
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              <X className="size-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* ── FORMS LIST ── */}
      {forms.length === 0 && editing === null ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <ClipboardList className="size-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Aucun formulaire créé
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-sm mt-1 mb-5">
            Créez votre premier formulaire de checkup
          </p>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <Plus className="size-4" /> Créer un formulaire
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const isExpanded = expandedForms.has(form.id);
            return (
              <div
                key={form.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
              >
                {/* Form header */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {form.title}
                      </h3>
                      {form.category && (
                        <span className="text-xs bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                          {form.category}
                        </span>
                      )}
                    </div>
                    {form.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {form.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                      {form.fields?.length ?? 0} champ
                      {(form.fields?.length ?? 0) !== 1 ? "s" : ""} · Mis à jour
                      le {new Date(form.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        setExpandedForms((s) => {
                          const next = new Set(s);
                          isExpanded ? next.delete(form.id) : next.add(form.id);
                          return next;
                        })
                      }
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Aperçu des champs"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(form)}
                      className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      disabled={deletingId === form.id}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 transition-colors"
                      title="Supprimer"
                    >
                      {deletingId === form.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded fields preview */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50 dark:bg-gray-800/50">
                    {!form.fields || form.fields.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        Aucun champ défini
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {form.fields.map((field: any) => {
                          const TypeIcon =
                            FIELD_TYPES.find((t) => t.value === field.fieldType)
                              ?.icon ?? Type;
                          return (
                            <div
                              key={field.id}
                              className="flex items-center gap-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2"
                            >
                              <TypeIcon className="size-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-xs text-gray-800 dark:text-gray-200 font-medium truncate flex-1">
                                {field.label}
                              </span>
                              {field.required && (
                                <span className="text-[10px] text-red-500 font-bold">
                                  *
                                </span>
                              )}
                              {field.unit && (
                                <span className="text-[10px] text-gray-400">
                                  ({field.unit})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

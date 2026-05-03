"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Save,
  X,
  CheckCircle,
  Users,
  Building2,
} from "lucide-react";
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAssignableOptions,
  generateStandardQuestionnairesForAllServices,
} from "@/lib/actions/questionnaire.actions";

type QuestionItem = {
  text: string;
  type: string;
  required: boolean;
  options: string[];
};

type Template = {
  id: string;
  title: string;
  description: string | null;
  questions: QuestionItem[];
  assignedServiceIds: string[];
  assignedPatientIds: string[];
  isActive: boolean;
  createdAt: Date;
};

type Option = { id: string; label: string };

const QUESTION_TYPES = ["TEXT", "NUMBER", "BOOLEAN", "CHOICE"];

export default function QuestionnaireManagementPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [patients, setPatients] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  async function loadData() {
    setLoading(true);
    const [templatesRes, optionsRes] = await Promise.all([
      getAllTemplates(),
      getAssignableOptions(),
    ]);
    if (templatesRes.success) setTemplates(templatesRes.templates as Template[]);
    if (optionsRes.success) {
      setServices(optionsRes.services as Option[]);
      setPatients(optionsRes.patients as Option[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setQuestions([]);
    setSelectedServiceIds([]);
    setSelectedPatientIds([]);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(t: Template) {
    setEditingId(t.id);
    setTitle(t.title);
    setDescription(t.description || "");
    setQuestions(t.questions || []);
    setSelectedServiceIds(t.assignedServiceIds || []);
    setSelectedPatientIds(t.assignedPatientIds || []);
    setShowForm(true);
  }

  function addQuestion() {
    setQuestions([...questions, { text: "", type: "TEXT", required: true, options: [] }]);
  }

  function updateQuestion(index: number, field: keyof QuestionItem, value: unknown) {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function toggleId(id: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) {
      alert("Title and at least one question required.");
      return;
    }
    if (selectedServiceIds.length === 0) {
      alert("Please assign at least one service to this questionnaire.");
      return;
    }
    if (selectedPatientIds.length === 0) {
      alert("Please assign at least one patient to this questionnaire.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      questions,
      assignedServiceIds: selectedServiceIds,
      assignedPatientIds: selectedPatientIds,
    };

    const result = editingId
      ? await updateTemplate(editingId, payload)
      : await createTemplate(payload);

    if (result.success) {
      resetForm();
      await loadData();
    } else {
      alert(result.error || "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this questionnaire template?")) return;
    await deleteTemplate(id);
    await loadData();
  }

  async function handleToggleActive(t: Template) {
    await updateTemplate(t.id, { isActive: !t.isActive });
    await loadData();
  }

  async function handleAIGenerateForServices() {
    setAiGenerating(true);
    try {
      const result = await generateStandardQuestionnairesForAllServices(false);
      if (!result.success) {
        alert(result.error || "AI generation failed.");
        return;
      }

      const summary = result.summary;
      alert(
        `AI generation completed.\n` +
          `Services: ${summary.totalServices}\n` +
          `Created/Updated: ${summary.createdOrUpdated}\n` +
          `Skipped: ${summary.skipped}\n` +
          `Failed: ${summary.failed}`
      );

      await loadData();
    } catch (error) {
      console.error("AI questionnaire generation error:", error);
      alert("AI generation failed.");
    } finally {
      setAiGenerating(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading questionnaires...</div>;
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Questionnaire Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create, edit, and assign questionnaires to services or patients.
            </p>
          </div>
          {!showForm && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => void handleAIGenerateForServices()}
                disabled={aiGenerating}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {aiGenerating ? "Generating..." : "AI: Generate Per Service"}
              </button>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={16} /> New Questionnaire
              </button>
            </div>
          )}
        </div>

        {!showForm && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <p className="font-semibold">AI standard questionnaires</p>
            <p className="mt-1">
              This creates one standard template per active service using Azure OpenAI. Existing service templates are skipped.
            </p>
          </div>
        )}

        {/* ─── Form ─── */}
        {showForm && (
          <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Questionnaire" : "Create Questionnaire"}
              </h2>
              <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Questionnaire title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              {/* Questions */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Questions ({questions.length})
                  </p>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Question
                  </button>
                </div>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Q{i + 1}</span>
                        <input
                          value={q.text}
                          onChange={(e) => updateQuestion(i, "text", e.target.value)}
                          placeholder="Question text"
                          className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                          required
                        />
                        <button type="button" onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(i, "type", e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        >
                          {QUESTION_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => updateQuestion(i, "required", e.target.checked)}
                          />
                          Required
                        </label>
                      </div>
                      {q.type === "CHOICE" && (
                        <input
                          value={q.options.join(", ")}
                          onChange={(e) =>
                            updateQuestion(i, "options", e.target.value.split(",").map((o) => o.trim()).filter(Boolean))
                          }
                          placeholder="Options (comma separated)"
                          className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <p className="text-xs text-slate-500">No questions yet. Click &quot;+ Add Question&quot; above.</p>
                  )}
                </div>
              </div>

              {/* Assign to Services */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Building2 size={14} /> Assign to Services <span className="text-red-500">*</span> ({selectedServiceIds.length})
                  </p>
                  <div className="max-h-32 space-y-1 overflow-auto">
                    {services.length === 0 && <p className="text-[11px] text-slate-500">No services.</p>}
                    {services.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(s.id)}
                          onChange={() => toggleId(s.id, selectedServiceIds, setSelectedServiceIds)}
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Users size={14} /> Assign to Patients <span className="text-red-500">*</span> ({selectedPatientIds.length})
                  </p>
                  <div className="max-h-32 space-y-1 overflow-auto">
                    {patients.length === 0 && <p className="text-[11px] text-slate-500">No patients.</p>}
                    {patients.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={selectedPatientIds.includes(p.id)}
                          onChange={() => toggleId(p.id, selectedPatientIds, setSelectedPatientIds)}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Save size={16} /> {editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ─── Template List ─── */}
        <div className="space-y-3">
          {templates.length === 0 && !showForm && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <FileText size={40} className="mx-auto mb-3 text-slate-400" />
              <p className="text-sm text-slate-500">No questionnaires yet. Create your first one.</p>
            </div>
          )}
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h3>
                  <p className="text-xs text-slate-500">{t.description || "No description"}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {t.questions.length} question{t.questions.length !== 1 ? "s" : ""}
                    </span>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {t.assignedServiceIds.length} service{t.assignedServiceIds.length !== 1 ? "s" : ""}
                    </span>
                    <span className="rounded bg-green-50 px-2 py-0.5 text-green-700 dark:bg-green-950 dark:text-green-300">
                      {t.assignedPatientIds.length} patient{t.assignedPatientIds.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(t)}
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      t.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {t.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="rounded p-1 text-indigo-600 hover:bg-indigo-50"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => void handleDelete(t.id)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Preview questions */}
              <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="mb-1 text-[11px] font-semibold text-slate-500">Questions preview:</p>
                <ul className="space-y-1">
                  {t.questions.slice(0, 5).map((q, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle size={12} className="text-slate-400" />
                      <span>{q.text}</span>
                      <span className="text-[10px] text-slate-400">({q.type}{q.required ? ", required" : ""})</span>
                    </li>
                  ))}
                  {t.questions.length > 5 && (
                    <li className="text-[11px] text-slate-400">+{t.questions.length - 5} more...</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

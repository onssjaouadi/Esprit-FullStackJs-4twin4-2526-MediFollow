"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Plus,
  Save,
  Trash2,
  Users,
  Stethoscope,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  createService,
  deleteService,
  getAllServices,
  getAssignableCareTeam,
  getAssignablePatients,
  updateService,
} from "@/lib/actions/service.actions";

type Service = {
  id: string;
  serviceName: string;
  description: string | null;
  consultationFee: number | null;
  averageDuration: number | null;
  isActive: boolean;
  specializations: string[];
  patientIds: string[];
  teamIds: string[];
};

type OptionItem = {
  id: string;
  label: string;
  email: string;
  role?: string;
};

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<OptionItem[]>([]);
  const [team, setTeam] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Selected existing service
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // New service form
  const [newServicePatientIds, setNewServicePatientIds] = useState<string[]>(
    []
  );
  const [newServiceTeamIds, setNewServiceTeamIds] = useState<string[]>([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    description: "",
    specializations: "",
  });

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || null;

  async function loadData() {
    setLoading(true);
    const [servicesRes, patientsRes, teamRes] = await Promise.all([
      getAllServices(),
      getAssignablePatients(),
      getAssignableCareTeam(),
    ]);

    if (servicesRes.success) {
      const list = servicesRes.services as Service[];
      setServices(list);
      if (!selectedServiceId && list.length > 0) {
        setSelectedServiceId(list[0].id);
        setSelectedPatientIds(list[0].patientIds || []);
        setSelectedTeamIds(list[0].teamIds || []);
      }
    }

    if (patientsRes.success) setPatients(patientsRes.patients as OptionItem[]);
    if (teamRes.success) setTeam(teamRes.team as OptionItem[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  // When selecting a different service, load its assignments from the service object
  function handleSelectService(serviceId: string) {
    setSelectedServiceId(serviceId);
    const svc = services.find((s) => s.id === serviceId);
    if (svc) {
      setSelectedPatientIds(svc.patientIds || []);
      setSelectedTeamIds(svc.teamIds || []);
    }
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault();
    if (!newService.serviceName.trim()) return;
    if (newServiceTeamIds.length === 0) {
      alert("Please assign at least one doctor or nurse to the care team.");
      return;
    }

    const result = await createService({
      serviceName: newService.serviceName.trim(),
      description: newService.description.trim() || undefined,
      specializations: newService.specializations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      patientIds: [],
      teamIds: newServiceTeamIds,
    });

    if (result.success) {
      setNewService({ serviceName: "", description: "", specializations: "" });
      setNewServiceTeamIds([]);
      await loadData();
      if (result.service?.id) handleSelectService(result.service.id);
    } else {
      alert(`Failed to create service: ${result.error || ""}`);
    }
  }

  async function handleToggleActive(service: Service) {
    await updateService(service.id, { isActive: !service.isActive });
    await loadData();
  }

  async function handleDeleteService(serviceId: string) {
    await deleteService(serviceId);
    if (selectedServiceId === serviceId) {
      setSelectedServiceId("");
      setSelectedPatientIds([]);
      setSelectedTeamIds([]);
    }
    await loadData();
  }

  async function handleSaveAssignments() {
    if (!selectedServiceId) return;
    setSaving(true);
    await updateService(selectedServiceId, {
      patientIds: selectedPatientIds,
      teamIds: selectedTeamIds,
    });
    await loadData();
    setSaving(false);
  }

  function toggle(
    id: string,
    current: string[],
    setter: (ids: string[]) => void
  ) {
    setter(
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );
  }

  async function handleAIAutoAssign() {
    setAiRunning(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai-assign", { method: "POST" });
      const data = await res.json();
      if (data.success && data.assignments) {
        const totalAssigned = data.assignments.reduce(
          (sum: number, a: any) => sum + a.patientUserIds.length,
          0
        );
        setAiResult({
          success: true,
          message: `AI assigned ${totalAssigned} patient(s) across ${data.assignments.length} service(s).`,
        });
        await loadData();
      } else {
        setAiResult({
          success: false,
          message: data.error || "AI assignment failed.",
        });
      }
    } catch {
      setAiResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setAiRunning(false);
      setTimeout(() => setAiResult(null), 8000);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">Loading services...</div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Service Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create services, assign patients and care teams.
            </p>
          </div>
          <button
            onClick={handleAIAutoAssign}
            disabled={aiRunning}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {aiRunning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {aiRunning ? "AI Analyzing..." : "AI Auto-Assign"}
          </button>
        </div>

        {/* AI Result Banner */}
        {aiResult && (
          <div
            className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
              aiResult.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
            }`}
          >
            {aiResult.success ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {aiResult.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ─── Create Service Form ─── */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Plus size={16} /> New Service
            </h2>
            <form onSubmit={handleCreateService} className="space-y-3">
              <input
                value={newService.serviceName}
                onChange={(e) =>
                  setNewService((p) => ({ ...p, serviceName: e.target.value }))
                }
                placeholder="Service name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
              <textarea
                value={newService.description}
                onChange={(e) =>
                  setNewService((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                rows={2}
              />
              <input
                value={newService.specializations}
                onChange={(e) =>
                  setNewService((p) => ({
                    ...p,
                    specializations: e.target.value,
                  }))
                }
                placeholder="Specializations (comma separated)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              {/* Care Team (required) */}
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Care Team <span className="text-red-500">*</span> (
                  {newServiceTeamIds.length} selected)
                </p>
                <div className="max-h-32 space-y-1 overflow-auto">
                  {team.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      No doctors/nurses found.
                    </p>
                  )}
                  {team.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <span>{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">
                          {m.role}
                        </span>
                        <input
                          type="checkbox"
                          checked={newServiceTeamIds.includes(m.id)}
                          onChange={() =>
                            toggle(
                              m.id,
                              newServiceTeamIds,
                              setNewServiceTeamIds
                            )
                          }
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                You can assign patients after creating the service.
              </p>

              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Create Service
              </button>
            </form>
          </div>

          {/* ─── Service List ─── */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Building2 size={16} /> Services ({services.length})
            </h2>
            <div className="space-y-2">
              {services.length === 0 ? (
                <p className="text-sm text-slate-500">No services yet.</p>
              ) : (
                services.map((svc) => (
                  <div
                    key={svc.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      selectedServiceId === svc.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectService(svc.id)}
                      className="text-left"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {svc.serviceName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {svc.description || "No description"} &middot;{" "}
                        {(svc.patientIds || []).length} patients &middot;{" "}
                        {(svc.teamIds || []).length} team
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/services/${svc.id}`}
                        className="rounded px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(svc)}
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          svc.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {svc.isActive ? "Active" : "Inactive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteService(svc.id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── Assignment Section for selected service ─── */}
        {selectedService && (
          <>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Assignments for &ldquo;{selectedService.serviceName}&rdquo;
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Patients box */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Users size={16} /> Patients ({selectedPatientIds.length}{" "}
                  assigned)
                </h3>
                <div className="max-h-72 space-y-2 overflow-auto">
                  {patients.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No patients in database.
                    </p>
                  )}
                  {patients.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm dark:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPatientIds.includes(p.id)}
                        onChange={() =>
                          toggle(
                            p.id,
                            selectedPatientIds,
                            setSelectedPatientIds
                          )
                        }
                      />
                      <span className="text-slate-800 dark:text-slate-200">
                        {p.label}
                      </span>
                      <span className="ml-auto text-xs text-slate-400">
                        {p.email}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Care Team box */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Stethoscope size={16} /> Doctors &amp; Nurses (
                  {selectedTeamIds.length} assigned)
                </h3>
                <div className="max-h-72 space-y-2 overflow-auto">
                  {team.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No doctors/nurses in database.
                    </p>
                  )}
                  {team.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center justify-between rounded border border-slate-200 p-2 text-sm dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTeamIds.includes(m.id)}
                          onChange={() =>
                            toggle(m.id, selectedTeamIds, setSelectedTeamIds)
                          }
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {m.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{m.role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveAssignments()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Assignments"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

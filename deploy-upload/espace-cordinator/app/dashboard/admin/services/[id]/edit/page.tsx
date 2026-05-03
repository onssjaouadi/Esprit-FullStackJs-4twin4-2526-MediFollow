"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  getServiceById,
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

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [patients, setPatients] = useState<OptionItem[]>([]);
  const [team, setTeam] = useState<OptionItem[]>([]);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    consultationFee: "",
    averageDuration: "",
    specializations: "",
    isActive: true,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [serviceRes, patientsRes, teamRes] = await Promise.all([
        getServiceById(params.id),
        getAssignablePatients(),
        getAssignableCareTeam(),
      ]);

      if (serviceRes.success) {
        const current = serviceRes.service as Service;
        setService(current);
        setFormData({
          serviceName: current.serviceName,
          description: current.description || "",
          consultationFee: current.consultationFee?.toString() || "",
          averageDuration: current.averageDuration?.toString() || "",
          specializations: current.specializations.join(", "),
          isActive: current.isActive,
        });
        setSelectedPatientIds(current.patientIds || []);
        setSelectedTeamIds(current.teamIds || []);
      }

      if (patientsRes.success) setPatients(patientsRes.patients as OptionItem[]);
      if (teamRes.success) setTeam(teamRes.team as OptionItem[]);

      setLoading(false);
    };

    void load();
  }, [params.id]);

  function toggleSelection(
    id: string,
    current: string[],
    setter: (ids: string[]) => void
  ) {
    if (current.includes(id)) {
      setter(current.filter((value) => value !== id));
    } else {
      setter([...current, id]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!service) return;
    setSaving(true);

    await updateService(service.id, {
      serviceName: formData.serviceName.trim(),
      description: formData.description.trim(),
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : null,
      averageDuration: formData.averageDuration ? Number(formData.averageDuration) : null,
      specializations: formData.specializations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isActive: formData.isActive,
      patientIds: selectedPatientIds,
      teamIds: selectedTeamIds,
    });

    setSaving(false);
    router.push(`/dashboard/admin/services/${service.id}`);
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading service...</div>;
  }

  if (!service) {
    return <div className="p-6 text-sm text-red-600">Service not found.</div>;
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/admin/services/${service.id}`} className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Service</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Update details, patients, and care team.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Service Details</h2>
              <div className="space-y-3">
                <input
                  value={formData.serviceName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, serviceName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Service name"
                  required
                />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows={3}
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={formData.consultationFee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, consultationFee: e.target.value }))}
                    type="number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Fee"
                  />
                  <input
                    value={formData.averageDuration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, averageDuration: e.target.value }))}
                    type="number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Duration"
                  />
                </div>
                <input
                  value={formData.specializations}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specializations: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Specializations (comma separated)"
                />
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active service
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Patients</h2>
                <div className="max-h-64 space-y-2 overflow-auto">
                  {patients.map((patient) => (
                    <label key={patient.id} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedPatientIds.includes(patient.id)}
                        onChange={() => toggleSelection(patient.id, selectedPatientIds, setSelectedPatientIds)}
                      />
                      <span>{patient.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Care Team</h2>
                <div className="max-h-64 space-y-2 overflow-auto">
                  {team.map((member) => (
                    <label key={member.id} className="flex items-center justify-between rounded border border-slate-200 p-2 text-sm dark:border-slate-700">
                      <span>{member.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{member.role}</span>
                        <input
                          type="checkbox"
                          checked={selectedTeamIds.includes(member.id)}
                          onChange={() => toggleSelection(member.id, selectedTeamIds, setSelectedTeamIds)}
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

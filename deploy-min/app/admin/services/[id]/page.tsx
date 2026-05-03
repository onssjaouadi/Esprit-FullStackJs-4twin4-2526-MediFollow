"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Edit3, Stethoscope, Users } from "lucide-react";
import {
  getAssignableCareTeam,
  getAssignablePatients,
  getServiceById,
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

export default function ServiceDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const [patients, setPatients] = useState<OptionItem[]>([]);
  const [team, setTeam] = useState<OptionItem[]>([]);

  const assignedPatients = useMemo(
    () => patients.filter((p) => (service?.patientIds || []).includes(p.id)),
    [patients, service]
  );

  const assignedTeam = useMemo(
    () => team.filter((m) => (service?.teamIds || []).includes(m.id)),
    [team, service]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [serviceRes, patientsRes, teamRes] = await Promise.all([
        getServiceById(params.id),
        getAssignablePatients(),
        getAssignableCareTeam(),
      ]);

      if (serviceRes.success) {
        // Ensure the service has patientIds and teamIds even if they're empty
        const service = {
          ...(serviceRes.service || {}),
          patientIds: (serviceRes.service as any)?.patientIds || [],
          teamIds: (serviceRes.service as any)?.teamIds || [],
        } as Service;
        setService(service);
      }
      if (patientsRes.success)
        setPatients(patientsRes.patients as OptionItem[]);
      if (teamRes.success) setTeam(teamRes.team as OptionItem[]);
      setLoading(false);
    };

    void load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading service details...
      </div>
    );
  }

  if (!service) {
    return <div className="p-6 text-sm text-red-600">Service not found.</div>;
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/services"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{service.serviceName}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Service details and assignments.
              </p>
            </div>
          </div>
          <Link
            href={`/admin/services/${service.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Edit3 size={16} />
            Edit Service
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Building2 size={16} />
              Service Info
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-slate-800 dark:text-slate-200">
                <span className="font-semibold">Name:</span>{" "}
                {service.serviceName}
              </p>
              <p className="text-slate-800 dark:text-slate-200">
                <span className="font-semibold">Description:</span>{" "}
                {service.description || "-"}
              </p>
              <p className="text-slate-800 dark:text-slate-200">
                <span className="font-semibold">Status:</span>{" "}
                {service.isActive ? "Active" : "Inactive"}
              </p>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Specializations:
                </p>
                {service.specializations.length === 0 ? (
                  <p className="text-slate-500">None</p>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {service.specializations.map((item) => (
                      <span
                        key={item}
                        className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Users size={16} />
              Assigned Patients ({assignedPatients.length})
            </h2>
            {assignedPatients.length === 0 ? (
              <p className="text-sm text-slate-500">No patients assigned.</p>
            ) : (
              <ul className="space-y-2">
                {assignedPatients.map((patient) => (
                  <li
                    key={patient.id}
                    className="rounded border border-slate-200 p-2 text-sm dark:border-slate-700"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {patient.label}
                    </p>
                    <p className="text-xs text-slate-500">{patient.email}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Stethoscope size={16} />
              Assigned Care Team ({assignedTeam.length})
            </h2>
            {assignedTeam.length === 0 ? (
              <p className="text-sm text-slate-500">
                No team members assigned.
              </p>
            ) : (
              <ul className="space-y-2">
                {assignedTeam.map((member) => (
                  <li
                    key={member.id}
                    className="rounded border border-slate-200 p-2 text-sm dark:border-slate-700"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {member.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.role} - {member.email}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

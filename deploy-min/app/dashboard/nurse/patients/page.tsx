"use client";

import {
  Search,
  AlertCircle,
  Activity,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAssignedPatients } from "@/lib/actions/nurse.actions";

export default function NursePatients() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== "NURSE") {
        router.push("/login");
        return;
      }

      const result = await getAssignedPatients(user.id);
      if (result.success && result.data) {
        setPatients(result.data);
      } else {
        console.error("Failed to load patients:", result.error);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return patients;
    }

    const query = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const fullName =
        `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
      const mrn = patient.medicalRecordNumber.toLowerCase();
      return fullName.includes(query) || mrn.includes(query);
    });
  }, [patients, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-black min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Assigned Patients
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          List of all patients under your responsibility
        </p>
      </div>

      <div>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or medical record number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "No patients found" : "No assigned patients"}
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const fullName = `${patient.user.firstName} ${patient.user.lastName}`;
              const activeAlerts =
                patient.alerts?.filter((a: any) => a.status === "OPEN")
                  .length || 0;
              const lastVital = patient.vitalRecords?.[0];
              const hasRecentVital =
                lastVital &&
                new Date(lastVital.recordedAt).getTime() >
                  Date.now() - 24 * 60 * 60 * 1000;

              return (
                <Link
                  key={patient.id}
                  href={`/dashboard/nurse/patients/${patient.id}`}
                  className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Patient Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-lg">
                        {patient.user.firstName.charAt(0)}
                        {patient.user.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {fullName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          MRN: {patient.medicalRecordNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {activeAlerts > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                          <AlertCircle size={14} />
                          {activeAlerts}
                        </div>
                      )}
                      {lastVital?.riskScore !== null &&
                        lastVital?.riskScore !== undefined && (
                          <div
                            className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${lastVital.riskScore >= 80 ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" : ""}
                          ${lastVital.riskScore >= 50 && lastVital.riskScore < 80 ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400" : ""}
                          ${lastVital.riskScore >= 30 && lastVital.riskScore < 50 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" : ""}
                          ${lastVital.riskScore < 30 ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : ""}
                        `}
                          >
                            Risk: {Math.round(lastVital.riskScore)}
                            {lastVital.trendIndicator && (
                              <span className="ml-1">
                                {lastVital.trendIndicator === "improving"
                                  ? "📉"
                                  : ""}
                                {lastVital.trendIndicator === "declining"
                                  ? "📈"
                                  : ""}
                                {lastVital.trendIndicator === "stable"
                                  ? "➡️"
                                  : ""}
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Activity size={16} />
                      <span>
                        {new Date().getFullYear() -
                          new Date(patient.dateOfBirth).getFullYear()}{" "}
                        years
                      </span>
                      <span className="text-gray-400 dark:text-gray-600">
                        •
                      </span>
                      <span>{patient.gender}</span>
                    </div>

                    {patient.diagnosis && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Diagnosis:</span>{" "}
                        {patient.diagnosis}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        hasRecentVital
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      <Clock size={16} />
                      <span>
                        {hasRecentVital ? "Recent data" : "Needs data"}
                      </span>
                    </div>
                    <ChevronRight
                      className="text-gray-400 dark:text-gray-600"
                      size={20}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredPatients.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {filteredPatients.length} patient
            {filteredPatients.length > 1 ? "s" : ""} trouvé
            {filteredPatients.length > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

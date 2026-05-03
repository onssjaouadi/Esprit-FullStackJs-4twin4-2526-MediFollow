"use client";

import { useState } from "react";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export default function DoctorDiagnosticPage() {
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [error, setError] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/diagnostic/doctor-access");
      const data = await res.json();

      console.log("📊 Full API response:", data);

      if (data.success) {
        setDiagnostic(data);
      } else {
        setError(data.error || "Diagnostic failed");
        setDiagnostic(data);
      }
    } catch (err) {
      setError(String(err));
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Doctor Access Diagnostic</h1>

        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className="w-5 h-5" />
          {loading ? "Running..." : "Run Diagnostic"}
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {diagnostic && (
          <div className="space-y-6">
            {/* Debug Info */}
            {diagnostic.debug && (
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <button
                  onClick={() => setDebugOpen(!debugOpen)}
                  className="flex items-center gap-2 w-full font-mono text-sm"
                >
                  {debugOpen ? <ChevronUp /> : <ChevronDown />}
                  🔧 Debug Information
                </button>
                {debugOpen && (
                  <pre className="mt-4 overflow-auto text-xs p-3 bg-black rounded">
                    {JSON.stringify(diagnostic.debug, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Session User */}
            {diagnostic.debug?.sessionUser && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold mb-4">👤 Session User</h2>
                <div className="space-y-2 font-mono text-sm">
                  <p>
                    <strong>ID:</strong> {diagnostic.debug.sessionUser.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {diagnostic.debug.sessionUser.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {diagnostic.debug.sessionUser.role}
                  </p>
                  <p>
                    <strong>Name:</strong>{" "}
                    {diagnostic.debug.sessionUser.firstName}{" "}
                    {diagnostic.debug.sessionUser.lastName}
                  </p>
                </div>
              </div>
            )}

            {/* DB User */}
            {diagnostic.debug?.dbUser && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold mb-4">🗄️ Database User</h2>
                <div className="space-y-2 font-mono text-sm">
                  <p>
                    <strong>ID:</strong> {diagnostic.debug.dbUser.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {diagnostic.debug.dbUser.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {diagnostic.debug.dbUser.role}
                  </p>
                  <p>
                    <strong>Name:</strong> {diagnostic.debug.dbUser.firstName}{" "}
                    {diagnostic.debug.dbUser.lastName}
                  </p>
                </div>
              </div>
            )}

            {diagnostic.diagnostic && (
              <>
                {/* Error Alert */}
                {diagnostic.diagnostic.error && (
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-300">
                    <h2 className="text-xl font-bold mb-2 text-yellow-800">
                      ⚠️ Diagnostic Error
                    </h2>
                    <p className="text-yellow-700 font-mono text-sm break-words">
                      {diagnostic.diagnostic.error}
                    </p>
                    <p className="text-yellow-600 text-sm mt-2">
                      Note: Some data may still be available above despite this
                      error.
                    </p>
                  </div>
                )}

                {/* Doctor Info */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-bold mb-4">
                    👨‍⚕️ Doctor Information
                  </h2>
                  {diagnostic.diagnostic.doctor ? (
                    <div className="space-y-2">
                      <p>
                        <strong>Name:</strong>{" "}
                        {diagnostic.diagnostic.doctor.firstName}{" "}
                        {diagnostic.diagnostic.doctor.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {diagnostic.diagnostic.doctor.email}
                      </p>
                      <p>
                        <strong>ID:</strong> {diagnostic.diagnostic.doctor.id}
                      </p>
                      <p>
                        <strong>Role:</strong>{" "}
                        {diagnostic.diagnostic.doctor.role}
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-600">❌ Doctor not found</p>
                  )}
                </div>

                {/* Specialty */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-bold mb-4">🏥 Specialty</h2>
                  <p>
                    {diagnostic.diagnostic.doctorSpecialty ||
                      "❌ No specialty set"}
                  </p>
                </div>

                {/* AccessGrants */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-bold mb-4">
                    🔗 AccessGrants ({diagnostic.diagnostic.accessGrantsCount})
                  </h2>
                  {diagnostic.diagnostic.accessGrants?.length > 0 ? (
                    <div className="space-y-3">
                      {diagnostic.diagnostic.accessGrants.map(
                        (ag: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 rounded border"
                          >
                            <p>
                              <strong>Patient User ID:</strong> {ag.patientId}
                            </p>
                            <p>
                              <strong>Active:</strong>{" "}
                              {ag.isActive ? "✅ Yes" : "❌ No"}
                            </p>
                            <p>
                              <strong>Granted At:</strong>{" "}
                              {new Date(ag.grantedAt).toLocaleString()}
                            </p>
                            <p>
                              <strong>Expires At:</strong>{" "}
                              {ag.expiresAt
                                ? new Date(ag.expiresAt).toLocaleString()
                                : "Never"}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600">
                      ❌ No AccessGrants found for this doctor
                    </p>
                  )}
                </div>

                {/* Patients */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-bold mb-4">
                    👥 Patients Found ({diagnostic.diagnostic.patientsFound})
                  </h2>
                  {diagnostic.diagnostic.patients?.length > 0 ? (
                    <div className="space-y-3">
                      {diagnostic.diagnostic.patients.map(
                        (patient: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 rounded border"
                          >
                            <p>
                              <strong>Name:</strong> {patient.user.firstName}{" "}
                              {patient.user.lastName}
                            </p>
                            <p>
                              <strong>Email:</strong> {patient.user.email}
                            </p>
                            <p>
                              <strong>Patient ID:</strong> {patient.id}
                            </p>
                            <p>
                              <strong>User ID:</strong> {patient.userId}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600">
                      ❌ No patients found with AccessGrant
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h2 className="text-xl font-bold mb-4">📋 Summary</h2>
                  <ul className="space-y-2">
                    <li>
                      ✅ AccessGrants count:{" "}
                      <strong>{diagnostic.diagnostic.accessGrantsCount}</strong>
                    </li>
                    <li>
                      ✅ Patients found:{" "}
                      <strong>{diagnostic.diagnostic.patientsFound}</strong>
                    </li>
                    <li>
                      ✅ Status:{" "}
                      <strong>
                        {diagnostic.diagnostic.accessGrantsCount > 0 &&
                        diagnostic.diagnostic.patientsFound > 0
                          ? "✅ OK - Patients should be visible"
                          : "❌ PROBLEM - Check above"}
                      </strong>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

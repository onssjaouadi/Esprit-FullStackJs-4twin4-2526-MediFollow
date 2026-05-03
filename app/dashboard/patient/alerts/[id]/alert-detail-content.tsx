"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Clock,
  Heart,
  Thermometer,
  Wind,
  Scale,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { formatDateTime } from "@/lib/utils";

export default function AlertDetailContent({ alert, vitalRecord }: any) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSeverityColor = (severity: string) => {
    if (!mounted) return "bg-red-500/20 text-red-400 border-red-500/30";
    
    const isDark = theme === "dark";
    switch (severity) {
      case "CRITICAL":
        return isDark
          ? "bg-red-500/20 text-red-400 border-red-500/30"
          : "bg-red-50 text-red-800 border-red-200";
      case "HIGH":
        return isDark
          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
          : "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return isDark
          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          : "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return isDark
          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
          : "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusColor = (status: string) => {
    if (!mounted) return "bg-red-500/20 text-red-400 border-red-500/30";
    
    const isDark = theme === "dark";
    switch (status) {
      case "OPEN":
        return isDark
          ? "bg-red-500/20 text-red-400 border-red-500/30"
          : "bg-red-50 text-red-800 border-red-200";
      case "ACKNOWLEDGED":
        return isDark
          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          : "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "RESOLVED":
        return isDark
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          : "bg-green-50 text-green-700 border-green-200";
      default:
        return isDark
          ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
          : "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const isDark = mounted && theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-dark-300" : "bg-gray-50"}`}>
      {/* Header Navigation */}
      <div
        className={`sticky top-0 z-20 border-b ${
          isDark
            ? "border-dark-500 bg-dark-300/90 backdrop-blur-xl"
            : "border-gray-200 bg-white/90 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link
            href="/dashboard/patient/alerts"
            className={`inline-flex items-center gap-2 transition-colors ${
              isDark
                ? "text-green-400 hover:text-green-300"
                : "text-green-600 hover:text-green-700"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Alerts
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3">
            {alert.severity === "CRITICAL" && (
              <AlertTriangle
                className={`w-8 h-8 animate-pulse ${
                  isDark ? "text-red-500" : "text-red-600"
                }`}
              />
            )}
            <div>
              <h1
                className={`text-4xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Alert Details
              </h1>
              <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                ID:{" "}
                <span
                  className={`font-mono ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {alert.id}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Alert Content - Full Width */}
        <div className="space-y-6">
          {/* Alert Status Card */}
          <div
            className={`rounded-2xl border p-8 ${
              isDark
                ? "border-dark-500 bg-dark-400"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1
                  className={`mb-2 text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {alert.alertType === "VITAL"
                    ? "🚨 Alert - Vital Signs Abnormality"
                    : alert.alertType === "SYMPTOM"
                      ? "⚠️ Alert - Symptom Report"
                      : "ℹ️ System Alert"}
                </h1>
                <p
                  className={`text-lg ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {alert.message}
                </p>
              </div>
              {alert.severity === "CRITICAL" && (
                <AlertCircle
                  className={`w-12 h-12 flex-shrink-0 animate-pulse ${
                    isDark ? "text-red-500" : "text-red-600"
                  }`}
                />
              )}
            </div>

            {/* Alert Status Badges */}
            <div className="mb-8 flex flex-wrap gap-3">
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getSeverityColor(alert.severity)}`}
              >
                🔴 {alert.severity} Severity
              </span>
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getStatusColor(alert.status)}`}
              >
                {alert.status === "OPEN"
                  ? "🔴 Active"
                  : alert.status === "ACKNOWLEDGED"
                    ? "🟡 Acknowledged"
                    : alert.status === "RESOLVED"
                      ? "🟢 Resolved"
                      : "⚪ Closed"}
              </span>
              {alert.alertType && (
                <span
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium ${
                    isDark
                      ? "border-green-500/30 bg-green-500/20 text-green-400"
                      : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  📋 {alert.alertType}
                </span>
              )}
            </div>

            {/* Timeline Information */}
            <div
              className={`space-y-4 rounded-xl border p-6 ${
                isDark
                  ? "border-dark-500 bg-dark-300"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h3
                className={`flex items-center gap-2 text-sm font-semibold ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
              >
                <Clock className="h-4 w-4" />
                Timeline
              </h3>

              <div className="space-y-4">
                {/* Created */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full ${
                        isDark ? "bg-green-400" : "bg-green-600"
                      }`}
                    ></div>
                    <div
                      className={`h-12 w-0.5 ${
                        isDark
                          ? "bg-gradient-to-b from-green-400 to-transparent"
                          : "bg-gradient-to-b from-green-600 to-transparent"
                      }`}
                    ></div>
                  </div>
                  <div className="pb-4">
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Alert Created
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {formatDateTime(alert.createdAt)}
                    </p>
                    {alert.triggeredBy && (
                      <p
                        className={`mt-1 text-xs ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        By: {alert.triggeredBy.firstName}{" "}
                        {alert.triggeredBy.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acknowledged */}
                {alert.acknowledgedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`mt-1.5 h-2 w-2 rounded-full ${
                          isDark ? "bg-yellow-400" : "bg-yellow-600"
                        }`}
                      ></div>
                      <div
                        className={`h-12 w-0.5 ${
                          isDark
                            ? "bg-gradient-to-b from-yellow-400 to-transparent"
                            : "bg-gradient-to-b from-yellow-600 to-transparent"
                        }`}
                      ></div>
                    </div>
                    <div className="pb-4">
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Alert Acknowledged
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {formatDateTime(alert.acknowledgedAt)}
                      </p>
                      {alert.acknowledgedBy && (
                        <p
                          className={`mt-1 text-xs ${
                            isDark ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          By: {alert.acknowledgedBy.firstName}{" "}
                          {alert.acknowledgedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Resolved */}
                {alert.resolvedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`mt-1.5 h-2 w-2 rounded-full ${
                          isDark ? "bg-emerald-400" : "bg-emerald-600"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Alert Resolved
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {formatDateTime(alert.resolvedAt)}
                      </p>
                      {alert.resolvedBy && (
                        <p
                          className={`mt-1 text-xs ${
                            isDark ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          By: {alert.resolvedBy.firstName}{" "}
                          {alert.resolvedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Notes */}
              {alert.resolution && (
                <div
                  className={`border-t pt-4 ${
                    isDark ? "border-dark-500" : "border-gray-200"
                  }`}
                >
                  <p
                    className={`mb-2 text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Resolution Notes:
                  </p>
                  <p
                    className={`rounded border p-3 text-sm ${
                      isDark
                        ? "border-dark-500 bg-dark-300 text-gray-300"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }`}
                  >
                    {alert.resolution}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vital Record Details */}
          {vitalRecord && vitalRecord.data && (
            <div
              className={`rounded-2xl border p-8 ${
                isDark
                  ? "border-dark-500 bg-dark-400"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`mb-2 flex items-center gap-2 text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <TrendingUp className={`h-6 w-6 ${
                  isDark ? "text-green-400" : "text-green-600"
                }`} />
                Vital Signs Record
              </h2>
              <p
                className={`mb-6 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Recorded:{" "}
                {formatDateTime(
                  vitalRecord.data.recordedAt || vitalRecord.createdAt
                )}
              </p>

              {/* Vital Measurements Grid */}
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                {/* Temperature */}
                {vitalRecord.data.temperature && (
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "border-dark-500 bg-dark-300 hover:border-orange-500/50"
                        : "border-gray-200 bg-gray-50 hover:border-orange-300"
                    } transition-all`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Thermometer
                        className={`h-5 w-5 ${
                          isDark ? "text-orange-400" : "text-orange-600"
                        }`}
                      />
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Temperature
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {vitalRecord.data.temperature}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      °C
                    </p>
                  </div>
                )}

                {/* Heart Rate */}
                {vitalRecord.data.heartRate && (
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "border-dark-500 bg-dark-300 hover:border-red-500/50"
                        : "border-gray-200 bg-gray-50 hover:border-red-300"
                    } transition-all`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Heart
                        className={`h-5 w-5 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}
                      />
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Heart Rate
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {vitalRecord.data.heartRate}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      bpm
                    </p>
                  </div>
                )}

                {/* Blood Pressure */}
                {(vitalRecord.data.systolicBP ||
                  vitalRecord.data.diastolicBP) && (
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "border-dark-500 bg-dark-300 hover:border-blue-500/50"
                        : "border-gray-200 bg-gray-50 hover:border-blue-300"
                    } transition-all`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Heart
                        className={`h-5 w-5 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Blood Pressure
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {vitalRecord.data.systolicBP}/
                      {vitalRecord.data.diastolicBP}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      mmHg
                    </p>
                  </div>
                )}

                {/* Oxygen Saturation */}
                {vitalRecord.data.oxygenSaturation && (
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "border-dark-500 bg-dark-300 hover:border-cyan-500/50"
                        : "border-gray-200 bg-gray-50 hover:border-cyan-300"
                    } transition-all`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Wind
                        className={`h-5 w-5 ${
                          isDark ? "text-cyan-400" : "text-cyan-600"
                        }`}
                      />
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        SpO₂
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {vitalRecord.data.oxygenSaturation}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      %
                    </p>
                  </div>
                )}

                {/* Weight */}
                {vitalRecord.data.weight && (
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "border-dark-500 bg-dark-300 hover:border-emerald-500/50"
                        : "border-gray-200 bg-gray-50 hover:border-emerald-300"
                    } transition-all`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Scale
                        className={`h-5 w-5 ${
                          isDark ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Weight
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {vitalRecord.data.weight}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      kg
                    </p>
                  </div>
                )}

                {/* Respiratory Rate */}
                {vitalRecord.data.respiratoryRate && (
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "border-dark-500 bg-dark-300 hover:border-purple-500/50"
                        : "border-gray-200 bg-gray-50 hover:border-purple-300"
                    } transition-all`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Wind
                        className={`h-5 w-5 ${
                          isDark ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Resp. Rate
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {vitalRecord.data.respiratoryRate}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      breaths/min
                    </p>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              {vitalRecord.status && (
                <div className="mb-6">
                  <p
                    className={`mb-2 text-xs ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Status
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                      vitalRecord.status === "CRITIQUE"
                        ? isDark
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-red-50 text-red-800 border-red-200"
                        : vitalRecord.status === "A_VERIFIER"
                          ? isDark
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : isDark
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {vitalRecord.status === "CRITIQUE"
                      ? "⚠️ CRITIQUE"
                      : vitalRecord.status === "A_VERIFIER"
                        ? "🔍 À VÉRIFIER"
                        : "✅ NORMAL"}
                  </span>
                </div>
              )}

              {/* Patient Notes */}
              {vitalRecord.data.notes && (
                <div
                  className={`rounded-lg border p-4 ${
                    isDark
                      ? "border-dark-500 bg-dark-300"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <p
                    className={`mb-2 text-sm font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    📝 Patient Notes
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {vitalRecord.data.notes}
                  </p>
                </div>
              )}

              {/* Trigger Rules if available */}
              {vitalRecord.triggeredRules && (
                <div
                  className={`mt-6 rounded-lg border p-4 ${
                    isDark
                      ? "border-dark-500 bg-dark-300"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <p
                    className={`mb-3 flex items-center gap-2 text-sm font-semibold ${
                      isDark ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Anomalies Detected
                  </p>
                  <div className="space-y-1 text-sm">
                    <pre
                      className={`overflow-auto rounded border p-2 text-xs ${
                        isDark
                          ? "border-dark-500 bg-dark-400"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {typeof vitalRecord.triggeredRules === "string"
                        ? vitalRecord.triggeredRules
                        : JSON.stringify(vitalRecord.triggeredRules, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

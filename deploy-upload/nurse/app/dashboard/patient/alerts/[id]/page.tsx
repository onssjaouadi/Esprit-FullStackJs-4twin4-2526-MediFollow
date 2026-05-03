import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  Thermometer,
  Wind,
  Scale,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import VitalReviewForm from "./vital-review-form";

async function getAlert(alertId: string) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        triggeredBy: true,
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });
    return alert as any;
  } catch (error) {
    console.error("Error fetching alert:", error);
    return null;
  }
}

async function getVitalRecord(vitalId: string) {
  try {
    const vital = await prisma.vitalRecord.findUnique({
      where: { id: vitalId },
    });
    return vital as any;
  } catch (error) {
    console.error("Error fetching vital record:", error);
    return null;
  }
}

async function AlertDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const alert = await getAlert(params.id);
  if (!alert) {
    redirect("/dashboard/patient/alerts");
  }

  const vitalRecord = alert.vitalRecordId
    ? await getVitalRecord(alert.vitalRecordId)
    : null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "ACKNOWLEDGED":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "RESOLVED":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Navigation */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/dashboard/patient/alerts"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Alerts
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alert & Vital Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {alert.alertType === "VITAL"
                      ? "Alert - Vital Signs"
                      : alert.alertType === "SYMPTOM"
                        ? "Alert - Symptom"
                        : "System Alert"}
                  </h1>
                  <p className="text-lg text-gray-300">{alert.message}</p>
                </div>
                {alert.severity === "CRITICAL" && (
                  <AlertCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
                )}
              </div>

              {/* Alert Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium ${getSeverityColor(alert.severity)}`}
                >
                  {alert.severity}
                </span>
                <span
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium ${getStatusColor(alert.status)}`}
                >
                  {alert.status === "OPEN"
                    ? "🔴 Active"
                    : alert.status === "ACKNOWLEDGED"
                      ? "🟡 Acknowledged"
                      : "🟢 Resolved"}
                </span>
              </div>

              {/* Alert Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 border border-white/10">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created</p>
                  <p className="font-mono text-white">
                    {formatDateTime(alert.createdAt)}
                  </p>
                </div>
                {alert.acknowledgedAt && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Acknowledged</p>
                    <p className="font-mono text-white">
                      {formatDateTime(alert.acknowledgedAt)}
                    </p>
                  </div>
                )}
                {alert.resolvedAt && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Resolved</p>
                    <p className="font-mono text-white">
                      {formatDateTime(alert.resolvedAt)}
                    </p>
                  </div>
                )}
                {alert.alertType && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Alert Type</p>
                    <p className="font-medium text-cyan-400">
                      {alert.alertType}
                    </p>
                  </div>
                )}
              </div>

              {/* Alert Data Details */}
              {alert.data && (
                <div className="mt-6 rounded-xl bg-white/5 p-4 border border-white/10">
                  <p className="text-sm font-semibold text-gray-300 mb-3">
                    Vital Details:
                  </p>
                  <div className="space-y-2 text-sm">
                    {alert.data.vitalType && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-medium">
                          {alert.data.vitalType}
                        </span>
                      </div>
                    )}
                    {alert.data.value !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value:</span>
                        <span className="text-white font-medium">
                          {alert.data.value}
                        </span>
                      </div>
                    )}
                    {alert.data.threshold && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Normal Range:</span>
                        <span className="text-white font-medium">
                          {alert.data.threshold.min} -{" "}
                          {alert.data.threshold.max}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vital Record Details */}
            {vitalRecord && vitalRecord.data && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Vital Signs
                </h2>

                {/* Vital Measurements Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* Blood Pressure */}
                  {(vitalRecord.data.systolicBP ||
                    vitalRecord.data.diastolicBP) && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-cyan-400" />
                        <p className="text-sm font-medium text-gray-300">
                          Blood Pressure
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {vitalRecord.data.systolicBP}/
                        {vitalRecord.data.diastolicBP}
                      </p>
                      <p className="text-xs text-gray-400">mmHg</p>
                    </div>
                  )}

                  {/* Heart Rate */}
                  {vitalRecord.data.heartRate && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        <p className="text-sm font-medium text-gray-300">
                          Heart Rate
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {vitalRecord.data.heartRate}
                      </p>
                      <p className="text-xs text-gray-400">bpm</p>
                    </div>
                  )}

                  {/* Temperature */}
                  {vitalRecord.data.temperature && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                        <p className="text-sm font-medium text-gray-300">
                          Temperature
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {vitalRecord.data.temperature}
                      </p>
                      <p className="text-xs text-gray-400">°C</p>
                    </div>
                  )}

                  {/* Oxygen Saturation */}
                  {vitalRecord.data.oxygenSaturation && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="w-5 h-5 text-cyan-400" />
                        <p className="text-sm font-medium text-gray-300">
                          SpO2
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {vitalRecord.data.oxygenSaturation}
                      </p>
                      <p className="text-xs text-gray-400">%</p>
                    </div>
                  )}

                  {/* Weight */}
                  {vitalRecord.data.weight && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-5 h-5 text-emerald-400" />
                        <p className="text-sm font-medium text-gray-300">
                          Weight
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {vitalRecord.data.weight}
                      </p>
                      <p className="text-xs text-gray-400">kg</p>
                    </div>
                  )}
                </div>

                {/* Recorded Date */}
                <div className="text-sm text-gray-400 mb-4">
                  <strong className="text-white">Recorded:</strong>{" "}
                  {formatDateTime(
                    vitalRecord.data.recordedAt || vitalRecord.data.created
                  )}
                </div>

                {/* Patient Notes */}
                {vitalRecord.data.notes && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">
                      📝 Your Notes
                    </p>
                    <p className="text-gray-200">{vitalRecord.data.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Review Form */}
          <div className="lg:col-span-1">
            <VitalReviewForm
              alertId={alert.id}
              vitalRecordId={vitalRecord?.id}
              patientId={user.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertDetailPage;

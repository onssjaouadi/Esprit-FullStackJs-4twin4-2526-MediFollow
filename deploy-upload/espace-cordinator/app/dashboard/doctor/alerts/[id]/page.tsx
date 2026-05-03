import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  Heart,
  Thermometer,
  Wind,
  Scale,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
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

async function acknowledgeAlert(alertId: string, userId: string) {
  "use server";

  try {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedById: userId,
        acknowledgedAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return { success: false, error: "Erreur lors de l'accusé de réception" };
  }
}

async function resolveAlert(alertId: string, userId: string, notes: string) {
  "use server";

  try {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "RESOLVED",
        resolvedById: userId,
        resolvedAt: new Date(),
        resolution: notes,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error resolving alert:", error);
    return { success: false, error: "Erreur lors de la résolution" };
  }
}

export default async function AlertDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const alert = await getAlert(params.id);

  if (!alert) {
    notFound();
  }

  // Récupérer les détails du vital record si disponible
  let vitalRecord: any = null;
  if ((alert as any).vitalRecordId) {
    vitalRecord = await getVitalRecord((alert as any).vitalRecordId);
  }

  const patientName = `${alert.patient.user.firstName} ${alert.patient.user.lastName}`;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "ACKNOWLEDGED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getVitalStatusBgColor = (status: string) => {
    switch (status) {
      case "CRITIQUE":
        return "bg-red-100 border-red-300";
      case "A_VERIFIER":
        return "bg-orange-100 border-orange-300";
      case "NORMAL":
        return "bg-green-100 border-green-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Navigation */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/dashboard/doctor/alerts"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux alertes
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alert & Vital Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Header Card */}
            <div
              className={`rounded-xl backdrop-blur-xl border-2 overflow-hidden ${
                alert.severity === "CRITICAL"
                  ? "border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/10"
                  : "border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-800/10"
              }`}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        className={`${
                          alert.severity === "CRITICAL"
                            ? "bg-red-500 text-white"
                            : alert.severity === "HIGH"
                              ? "bg-orange-500 text-white"
                              : "bg-yellow-500 text-white"
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                      <Badge
                        className={`${
                          alert.status === "RESOLVED"
                            ? "bg-green-500 text-white"
                            : alert.status === "ACKNOWLEDGED"
                              ? "bg-blue-500 text-white"
                              : "bg-red-500 text-white"
                        }`}
                      >
                        {alert.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {alert.message}
                    </h1>
                    <p className="text-gray-400 text-sm">
                      Type: {alert.alertType}
                    </p>
                  </div>
                  {alert.severity === "CRITICAL" && (
                    <AlertCircle className="w-16 h-16 text-red-500/80 flex-shrink-0" />
                  )}
                </div>

                {/* Alert Info Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Patient</p>
                    <Link
                      href={`/dashboard/doctor/patients/${alert.patient.id}`}
                      className="text-white font-semibold hover:text-blue-300 transition-colors"
                    >
                      {patientName}
                    </Link>
                    <p className="text-gray-500 text-xs mt-1">
                      MRN: {alert.patient.medicalRecordNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Date de création
                    </p>
                    <p className="text-white font-semibold">
                      {new Date(alert.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vital Record Card */}
            {vitalRecord && (
              <div
                className={`rounded-xl backdrop-blur-xl border-2 overflow-hidden ${
                  vitalRecord.status === "CRITIQUE"
                    ? "border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/10"
                    : vitalRecord.status === "A_VERIFIER"
                      ? "border-orange-500/50 bg-gradient-to-br from-orange-900/20 to-orange-800/10"
                      : "border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10"
                }`}
              >
                <div className="p-8">
                  {/* Vital Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Signes vitaux
                    </h2>
                    <Badge
                      className={`text-lg px-4 py-2 ${
                        vitalRecord.status === "CRITIQUE"
                          ? "bg-red-500 text-white"
                          : vitalRecord.status === "A_VERIFIER"
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white"
                      }`}
                    >
                      {vitalRecord.status === "CRITIQUE"
                        ? "🔴 CRITIQUE"
                        : vitalRecord.status === "A_VERIFIER"
                          ? "🟡 À VÉRIFIER"
                          : "🟢 NORMAL"}
                    </Badge>
                  </div>

                  {/* Vital Measurements - Improved Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {(vitalRecord.systolicBP || vitalRecord.diastolicBP) && (
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="w-5 h-5 text-blue-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Tension
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.systolicBP}/{vitalRecord.diastolicBP}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">mmHg</p>
                      </div>
                    )}

                    {vitalRecord.heartRate && (
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-red-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="w-5 h-5 text-red-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Fréquence
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.heartRate}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">bpm</p>
                      </div>
                    )}

                    {vitalRecord.temperature && (
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-orange-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Thermometer className="w-5 h-5 text-orange-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Température
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.temperature}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">°C</p>
                      </div>
                    )}

                    {vitalRecord.oxygenSaturation && (
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-cyan-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Wind className="w-5 h-5 text-cyan-400" />
                          <p className="text-xs font-medium text-gray-300">
                            SpO2
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.oxygenSaturation}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">%</p>
                      </div>
                    )}

                    {vitalRecord.weight && (
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Scale className="w-5 h-5 text-green-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Poids
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.weight}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">kg</p>
                      </div>
                    )}
                  </div>

                  {/* Recorded Date */}
                  <div className="text-sm text-gray-400 mb-4 pt-4 border-t border-white/10">
                    <strong className="text-gray-300">Enregistré le:</strong>{" "}
                    {new Date(vitalRecord.recordedAt).toLocaleString("fr-FR")}
                  </div>

                  {/* Patient Notes */}
                  {vitalRecord.notes && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-sm font-semibold text-gray-300 mb-2">
                        📝 Notes du patient
                      </p>
                      <p className="text-gray-300">{vitalRecord.notes}</p>
                    </div>
                  )}

                  {/* Doctor Review Status - Already Reviewed */}
                  {vitalRecord.reviewStatus === "REVIEWED" && (
                    <div className="mt-4 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-300 mb-2">
                        ✅ Vital reviewé
                      </p>
                      {vitalRecord.reviewedBy && (
                        <p className="text-xs text-green-400 mb-2">
                          Par: Dr. {vitalRecord.reviewedBy.firstName}{" "}
                          {vitalRecord.reviewedBy.lastName}
                        </p>
                      )}
                      {vitalRecord.reviewNotes && (
                        <p className="text-sm text-green-300 mb-2">
                          {vitalRecord.reviewNotes}
                        </p>
                      )}
                      {vitalRecord.reviewedAt && (
                        <p className="text-xs text-green-400">
                          {new Date(vitalRecord.reviewedAt).toLocaleString(
                            "fr-FR"
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Review Form */}
          {vitalRecord && (
            <div className="lg:col-span-1">
              <VitalReviewForm
                vitalRecord={vitalRecord}
                doctorId={user.id}
                alertId={alert.id}
              />
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="mt-8 rounded-xl backdrop-blur-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">Chronologie</h3>

            <div className="space-y-4">
              {/* Created */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  {(alert.acknowledgedAt || alert.resolvedAt) && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-red-500/50 to-transparent mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-white">Alerte créée</p>
                  <p className="text-sm text-gray-400">
                    {new Date(alert.createdAt).toLocaleString("fr-FR")}
                  </p>
                  {alert.triggeredBy && (
                    <p className="text-sm text-gray-500">
                      Par: {alert.triggeredBy.firstName}{" "}
                      {alert.triggeredBy.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Acknowledged */}
              {alert.acknowledgedAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    {alert.resolvedAt && (
                      <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500/50 to-transparent mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-white">Prise en compte</p>
                    <p className="text-sm text-gray-400">
                      {new Date(alert.acknowledgedAt).toLocaleString("fr-FR")}
                    </p>
                    {alert.acknowledgedBy && (
                      <p className="text-sm text-gray-500">
                        Par: Dr. {alert.acknowledgedBy.firstName}{" "}
                        {alert.acknowledgedBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Resolved */}
              {alert.resolvedAt && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Résolu</p>
                    <p className="text-sm text-gray-400">
                      {new Date(alert.resolvedAt).toLocaleString("fr-FR")}
                    </p>
                    {alert.resolvedBy && (
                      <p className="text-sm text-gray-500">
                        Par: Dr. {alert.resolvedBy.firstName}{" "}
                        {alert.resolvedBy.lastName}
                      </p>
                    )}
                    {alert.resolution && (
                      <div className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm">
                        {alert.resolution}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Form */}
        {alert.status !== "RESOLVED" && (
          <div className="mt-8 rounded-xl backdrop-blur-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Actions sur l'alerte
              </h3>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  const action = formData.get("action");

                  if (action === "acknowledge") {
                    await acknowledgeAlert(alert.id, user.id);
                    redirect(`/dashboard/doctor/alerts/${alert.id}`);
                  } else if (action === "resolve") {
                    const notes = formData.get("notes") as string;
                    await resolveAlert(alert.id, user.id, notes);
                    redirect("/dashboard/doctor/alerts");
                  }
                }}
                className="space-y-4"
              >
                {alert.status === "OPEN" && (
                  <button
                    type="submit"
                    name="action"
                    value="acknowledge"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Clock className="w-5 h-5" />
                    Prendre en charge cette alerte
                  </button>
                )}

                {(alert.status === "OPEN" ||
                  alert.status === "ACKNOWLEDGED") && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Notes de résolution
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Décrivez les actions entreprises et la résolution..."
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      name="action"
                      value="resolve"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Marquer comme résolu
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

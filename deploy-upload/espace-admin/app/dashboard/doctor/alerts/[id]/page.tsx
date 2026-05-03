import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

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
    return alert;
  } catch (error) {
    console.error("Error fetching alert:", error);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/doctor/alerts"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux alertes
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Détails de l'Alerte
        </h1>
        <p className="text-gray-600">ID: {alert.id}</p>
      </div>

      {/* Alert Card */}
      <div
        className={`bg-white border-2 rounded-lg p-6 mb-6 ${
          alert.severity === "CRITICAL" ? "border-red-300" : "border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={getSeverityColor(alert.severity)}>
                {alert.severity}
              </Badge>
              <Badge className={getStatusColor(alert.status)}>
                {alert.status}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {alert.message}
            </h2>
            <p className="text-gray-600">{alert.alertType}</p>
          </div>

          {alert.severity === "CRITICAL" && (
            <AlertCircle className="w-12 h-12 text-red-600" />
          )}
        </div>

        {/* Alert Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Patient</p>
            <Link
              href={`/dashboard/doctor/patients/${alert.patient.id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {patientName}
            </Link>
            <p className="text-sm text-gray-500">
              MRN: {alert.patient.medicalRecordNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Date de création</p>
            <p className="font-medium text-gray-900">
              {new Date(alert.createdAt).toLocaleString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chronologie
        </h3>

        <div className="space-y-4">
          {/* Created */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              {(alert.acknowledgedAt || alert.resolvedAt) && (
                <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-gray-900">Alerte créée</p>
              <p className="text-sm text-gray-600">
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                {alert.resolvedAt && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-gray-900">Prise en compte</p>
                <p className="text-sm text-gray-600">
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
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Résolu</p>
                <p className="text-sm text-gray-600">
                  {new Date(alert.resolvedAt).toLocaleString("fr-FR")}
                </p>
                {alert.resolvedBy && (
                  <p className="text-sm text-gray-500">
                    Par: Dr. {alert.resolvedBy.firstName}{" "}
                    {alert.resolvedBy.lastName}
                  </p>
                )}
                {alert.resolution && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-900">{alert.resolution}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Form */}
      {alert.status !== "RESOLVED" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

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
          >
            {alert.status === "OPEN" && (
              <div className="mb-4">
                <button
                  type="submit"
                  name="action"
                  value="acknowledge"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Clock className="w-5 h-5" />
                  Prendre en charge cette alerte
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes de résolution
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Décrivez les actions entreprises et la résolution..."
                ></textarea>
              </div>

              <button
                type="submit"
                name="action"
                value="resolve"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Marquer comme résolu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Related Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Conseil:</strong> Assurez-vous de contacter le patient et de
          documenter toutes les actions prises dans les notes de résolution.
        </p>
      </div>
    </div>
  );
}

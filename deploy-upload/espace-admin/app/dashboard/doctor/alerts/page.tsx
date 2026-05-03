import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllAlerts } from "@/lib/actions/alert.actions";
import { Badge } from "@/components/ui/badge";

export default async function DoctorAlertsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const { alerts } = await getAllAlerts();

  const openAlerts = alerts?.filter((a) => a.status === "OPEN") || [];
  const acknowledgedAlerts =
    alerts?.filter((a) => a.status === "ACKNOWLEDGED") || [];
  const resolvedAlerts = alerts?.filter((a) => a.status === "RESOLVED") || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "HIGH":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "MEDIUM":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

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

  const AlertCard = ({ alert }: { alert: any }) => {
    const patientName = `${alert.patient.user.firstName} ${alert.patient.user.lastName}`;

    return (
      <div
        className={`bg-white border rounded-lg p-5 hover:shadow-md transition-shadow ${
          alert.severity === "CRITICAL" ? "border-red-300" : "border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getSeverityIcon(alert.severity)}
            <div>
              <h3 className="font-semibold text-gray-900">{alert.message}</h3>
              <Link
                href={`/dashboard/doctor/patients/${alert.patientId}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {patientName} - MRN: {alert.patient.medicalRecordNumber}
              </Link>
            </div>
          </div>
          <Badge className={getSeverityColor(alert.severity)}>
            {alert.severity}
          </Badge>
        </div>

        {/* Alert Details */}
        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Type:</span> {alert.alertType}
          </div>

          {alert.vitalValue !== null && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Valeur:</span> {alert.vitalValue}
              {alert.thresholdValue && ` (Seuil: ${alert.thresholdValue})`}
            </div>
          )}

          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date(alert.createdAt).toLocaleString("fr-FR")}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {alert.status === "RESOLVED" ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  Résolu
                </span>
              </>
            ) : alert.status === "ACKNOWLEDGED" ? (
              <>
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  En cours
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 font-medium">
                  Nouveau
                </span>
              </>
            )}
          </div>

          {alert.status !== "RESOLVED" && (
            <Link
              href={`/dashboard/doctor/alerts/${alert.id}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Gérer →
            </Link>
          )}
        </div>

        {/* Resolution Notes */}
        {alert.resolution && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {alert.resolution}
            </p>
            {alert.resolvedBy && (
              <p className="text-xs text-gray-500 mt-1">
                Résolu par Dr. {alert.resolvedBy.firstName}{" "}
                {alert.resolvedBy.lastName}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alertes</h1>
        <p className="text-gray-600 mt-1">Gérez les alertes de vos patients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Nouvelles</p>
              <p className="text-3xl font-bold text-red-700">
                {openAlerts.length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">En cours</p>
              <p className="text-3xl font-bold text-blue-700">
                {acknowledgedAlerts.length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Résolues</p>
              <p className="text-3xl font-bold text-green-700">
                {resolvedAlerts.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button className="border-b-2 border-blue-600 py-3 px-1 text-sm font-medium text-blue-600">
              Nouvelles ({openAlerts.length})
            </button>
            <button className="border-b-2 border-transparent py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              En cours ({acknowledgedAlerts.length})
            </button>
            <button className="border-b-2 border-transparent py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Résolues ({resolvedAlerts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {openAlerts.length > 0 ? (
          openAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucune nouvelle alerte</p>
            <p className="text-gray-500 text-sm">
              Tous vos patients sont stables
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  AlertCircle,
  Activity,
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getDoctorPatientsSummaryReport,
  getDoctorAlertsReport,
  getDoctorAnalysesReport,
  getDoctorVitalsReport,
  getDoctorPracticeStatisticsReport,
} from "@/lib/actions/reports.actions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Report {
  title: string;
  type: string;
  generatedAt: Date | string;
  specialty: string;
  [key: string]: any;
}

export default function DoctorReportsPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== "DOCTOR") {
        router.push("/login");
        return;
      }

      // Generate all available reports
      const reportsToGenerate = [
        { name: "PATIENTS", fn: getDoctorPatientsSummaryReport },
        { name: "ALERTS", fn: getDoctorAlertsReport },
        { name: "ANALYSES", fn: getDoctorAnalysesReport },
        { name: "VITALS", fn: getDoctorVitalsReport },
        { name: "PRACTICE_STATISTICS", fn: getDoctorPracticeStatisticsReport },
      ];

      const generatedReports: Report[] = [];

      for (const { name, fn } of reportsToGenerate) {
        const result = await fn(user.id);
        if (result.success && result.report) {
          generatedReports.push(result.report);
        }
      }

      setReports(generatedReports);
      if (generatedReports.length > 0) {
        setSelectedReport(generatedReports[0]);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateReport(reportType: string) {
    setGenerating(reportType);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      let result: any;
      switch (reportType) {
        case "PATIENTS":
          result = await getDoctorPatientsSummaryReport(user.id);
          break;
        case "ALERTS":
          result = await getDoctorAlertsReport(user.id);
          break;
        case "ANALYSES":
          result = await getDoctorAnalysesReport(user.id);
          break;
        case "VITALS":
          result = await getDoctorVitalsReport(user.id);
          break;
        case "PRACTICE_STATISTICS":
          result = await getDoctorPracticeStatisticsReport(user.id);
          break;
      }

      if (result.success && result.report) {
        const updatedReports = reports.map((r) =>
          r.type === reportType ? result.report : r
        );
        setReports(updatedReports);
        setSelectedReport(result.report);
      }
    } catch (error) {
      console.error("Error regenerating report:", error);
    } finally {
      setGenerating(null);
    }
  }

  function downloadReport() {
    if (!selectedReport || !reportRef.current) return;

    const element = reportRef.current;
    const filename = `rapport-${selectedReport.type}-${Date.now()}.pdf`;

    // Show a loading indicator
    const originalDisplay = element.style.display;
    element.style.display = "block";

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210 - 20; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Top margin

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= 297 - 20; // A4 height minus margins

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= 297 - 20;
      }

      pdf.save(filename);
      element.style.display = originalDisplay;
    });
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Rapports Médicaux
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Générez et téléchargez des rapports détaillés sur vos patients et
          votre pratique
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report List */}
        <div className="lg:col-span-1 space-y-2">
          {reports.map((report) => (
            <button
              key={report.type}
              onClick={() => setSelectedReport(report)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedReport?.type === report.type
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {report.type === "PATIENTS" && (
                  <Users className="w-5 h-5 text-green-600" />
                )}
                {report.type === "ALERTS" && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                {report.type === "ANALYSES" && (
                  <Activity className="w-5 h-5 text-purple-600" />
                )}
                {report.type === "VITALS" && (
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                )}
                {report.type === "PRACTICE_STATISTICS" && (
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                )}
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {report.title.split(" - ")[0]}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(report.generatedAt).toLocaleDateString("fr-FR")}
              </p>
            </button>
          ))}
        </div>

        {/* Report Details */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <div
              ref={reportRef}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedReport.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Généré le{" "}
                    {new Date(selectedReport.generatedAt).toLocaleString(
                      "fr-FR"
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => regenerateReport(selectedReport.type)}
                    disabled={generating === selectedReport.type}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {generating === selectedReport.type ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Rafraîchir
                  </button>
                  <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Patients Report */}
                {selectedReport.type === "PATIENTS" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Patients Actifs
                        </p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                          {selectedReport.totalPatients}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          Alertes Ouvertes
                        </p>
                        <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                          {selectedReport.activeAlerts}
                        </p>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                          <tr>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                              Patient
                            </th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                              Diagnostic
                            </th>
                            <th className="text-center px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                              Alertes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {selectedReport.data
                            ?.slice(0, 10)
                            .map((patient: any) => (
                              <tr
                                key={patient.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                  {patient.user.firstName}{" "}
                                  {patient.user.lastName}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                  {patient.diagnosis || "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                      patient.alerts.length > 0
                                        ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                                        : "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                                    }`}
                                  >
                                    {patient.alerts.length}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Alerts Report */}
                {selectedReport.type === "ALERTS" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-lg">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Total
                        </p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                          {selectedReport.summary.total}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-lg">
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                          Ouvertes
                        </p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                          {selectedReport.summary.open}
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-lg">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          Critiques
                        </p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                          {selectedReport.summary.critical}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-lg">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Résolues
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {selectedReport.summary.resolved}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Par Sévérité
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(selectedReport.alertsBySeverity).map(
                            ([severity, count]: any) => (
                              <div
                                key={severity}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600 dark:text-gray-400">
                                  {severity}
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {count}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Par Type (Top 5)
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {Object.entries(selectedReport.alertsByType)
                            .sort((a: any, b: any) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([type, count]: any) => (
                              <div
                                key={type}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600 dark:text-gray-400 truncate">
                                  {type}
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {count}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analyses Report */}
                {selectedReport.type === "ANALYSES" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-lg">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          Total
                        </p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                          {selectedReport.summary.total}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-lg">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Normales
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {selectedReport.summary.normal}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-lg">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Anormales
                        </p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                          {selectedReport.summary.abnormal}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Terminées
                        </p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                          {selectedReport.summary.completed}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Par Type
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {Object.entries(selectedReport.analysesByType)
                          .sort((a: any, b: any) => b[1] - a[1])
                          .map(([type, count]: any) => (
                            <div
                              key={type}
                              className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded text-sm"
                            >
                              <span className="text-gray-600 dark:text-gray-400 truncate">
                                {type}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Vitals Report */}
                {selectedReport.type === "VITALS" && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Moyennes Vitales
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            FC Moyenne
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedReport.summary.measurements.avgHeartRate}
                          </p>
                          <p className="text-xs text-gray-500">bpm</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            TA Systolique
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedReport.summary.measurements.avgSystolic}
                          </p>
                          <p className="text-xs text-gray-500">mmHg</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            TA Diastolique
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedReport.summary.measurements.avgDiastolic}
                          </p>
                          <p className="text-xs text-gray-500">mmHg</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Température
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedReport.summary.measurements.avgTemperature}
                          </p>
                          <p className="text-xs text-gray-500">°C</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            SpO2
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {
                              selectedReport.summary.measurements
                                .avgOxygenSaturation
                            }
                          </p>
                          <p className="text-xs text-gray-500">%</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total de mesures:{" "}
                      <span className="font-semibold">
                        {selectedReport.summary.totalRecords}
                      </span>
                    </p>
                  </div>
                )}

                {/* Practice Statistics Report */}
                {selectedReport.type === "PRACTICE_STATISTICS" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            Patients
                          </p>
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                          {selectedReport.statistics.patients.total}
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            Alertes
                          </p>
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                          {selectedReport.statistics.alerts.total}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Résolution:{" "}
                          {selectedReport.statistics.alerts.resolutionRate}%
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Analyses
                          </p>
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                          {selectedReport.statistics.analyses.total}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                          Anormales:{" "}
                          {selectedReport.statistics.analyses.abnormalRate}%
                        </p>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                            Suivi
                          </p>
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                          {selectedReport.statistics.monitoring.vitalRecords}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                          Symptômes:{" "}
                          {selectedReport.statistics.monitoring.symptoms}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Sélectionnez un rapport pour afficher ses détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

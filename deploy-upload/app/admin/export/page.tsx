"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Users,
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  getExportablePatients,
  getExportableVitals,
  getExportableAlerts,
} from "@/lib/actions/export.actions";

type ExportType = "patients" | "vitals" | "alerts";

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(row.map(escape).join(","));
  }
  return lines.join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DataExportPage() {
  const [loading, setLoading] = useState<ExportType | null>(null);

  async function exportPatientsCsv() {
    setLoading("patients");
    const res = await getExportablePatients();
    if (!res.success || res.patients.length === 0) {
      alert(res.error || "No patient data to export.");
      setLoading(null);
      return;
    }
    const headers = ["Name", "Email", "Phone", "MRN", "Date of Birth", "Gender", "Blood Type", "Diagnosis", "Discharge Date", "Active", "Created"];
    const rows = res.patients.map((p: any) => [
      p.name, p.email, p.phone, p.medicalRecordNumber,
      formatDate(p.dateOfBirth), p.gender, p.bloodType, p.diagnosis,
      formatDate(p.dischargeDate), p.isActive ? "Yes" : "No", formatDate(p.createdAt),
    ]);
    downloadFile(toCsv(headers, rows), `patients_${Date.now()}.csv`, "text/csv");
    setLoading(null);
  }

  async function exportVitalsCsv() {
    setLoading("vitals");
    const res = await getExportableVitals();
    if (!res.success || res.vitals.length === 0) {
      alert(res.error || "No vital data to export.");
      setLoading(null);
      return;
    }
    const headers = ["Patient", "Systolic BP", "Diastolic BP", "Heart Rate", "Temperature", "O2 Saturation", "Weight", "Notes", "Recorded At"];
    const rows = res.vitals.map((v: any) => [
      v.patient, v.systolicBP ?? "", v.diastolicBP ?? "", v.heartRate ?? "",
      v.temperature ?? "", v.oxygenSaturation ?? "", v.weight ?? "",
      v.notes, formatDate(v.recordedAt),
    ]);
    downloadFile(toCsv(headers, rows), `vitals_${Date.now()}.csv`, "text/csv");
    setLoading(null);
  }

  async function exportAlertsCsv() {
    setLoading("alerts");
    const res = await getExportableAlerts();
    if (!res.success || res.alerts.length === 0) {
      alert(res.error || "No alert data to export.");
      setLoading(null);
      return;
    }
    const headers = ["Patient", "Type", "Severity", "Status", "Message", "Created", "Resolved"];
    const rows = res.alerts.map((a: any) => [
      a.patient, a.alertType, a.severity, a.status, a.message,
      formatDate(a.createdAt), formatDate(a.resolvedAt),
    ]);
    downloadFile(toCsv(headers, rows), `alerts_${Date.now()}.csv`, "text/csv");
    setLoading(null);
  }

  async function exportPdf(type: ExportType) {
    setLoading(type);
    let title = "";
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === "patients") {
      const res = await getExportablePatients();
      if (!res.success || res.patients.length === 0) { alert("No data"); setLoading(null); return; }
      title = "Patient Report";
      headers = ["Name", "Email", "MRN", "Gender", "Diagnosis", "Active"];
      rows = res.patients.map((p: any) => [p.name, p.email, p.medicalRecordNumber, p.gender, p.diagnosis, p.isActive ? "Yes" : "No"]);
    } else if (type === "vitals") {
      const res = await getExportableVitals();
      if (!res.success || res.vitals.length === 0) { alert("No data"); setLoading(null); return; }
      title = "Vital Records Report";
      headers = ["Patient", "Systolic", "Diastolic", "HR", "Temp", "O2", "Date"];
      rows = res.vitals.map((v: any) => [v.patient, v.systolicBP ?? "-", v.diastolicBP ?? "-", v.heartRate ?? "-", v.temperature ?? "-", v.oxygenSaturation ?? "-", formatDate(v.recordedAt)]);
    } else {
      const res = await getExportableAlerts();
      if (!res.success || res.alerts.length === 0) { alert("No data"); setLoading(null); return; }
      title = "Alert Report";
      headers = ["Patient", "Type", "Severity", "Status", "Message", "Date"];
      rows = res.alerts.map((a: any) => [a.patient, a.alertType, a.severity, a.status, a.message, formatDate(a.createdAt)]);
    }

    // Generate printable HTML and open print dialog
    const colWidth = Math.floor(100 / headers.length);
    const tableRows = rows
      .map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ddd;padding:4px 6px;font-size:11px">${c}</td>`).join("")}</tr>`)
      .join("");
    const html = `<!DOCTYPE html><html><head><title>${title}</title><style>
      body{font-family:Arial,sans-serif;margin:20px}
      h1{font-size:18px;margin-bottom:4px}
      p{font-size:12px;color:#666;margin-bottom:12px}
      table{border-collapse:collapse;width:100%}
      th{background:#f1f5f9;border:1px solid #ddd;padding:6px;font-size:11px;text-align:left}
      @media print{button{display:none}}
    </style></head><body>
      <h1>MediFollow — ${title}</h1>
      <p>Generated: ${new Date().toLocaleString("en-US")}</p>
      <table><thead><tr>${headers.map((h) => `<th style="width:${colWidth}%">${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
      <br/><button onclick="window.print()">Print / Save as PDF</button>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
    setLoading(null);
  }

  const cards: { type: ExportType; label: string; desc: string; icon: typeof Users; color: string }[] = [
    { type: "patients", label: "Patient Data", desc: "Names, demographics, diagnosis, discharge info", icon: Users, color: "indigo" },
    { type: "vitals", label: "Vital Records", desc: "Blood pressure, heart rate, temperature, O2, weight", icon: Activity, color: "emerald" },
    { type: "alerts", label: "Alerts", desc: "Alert type, severity, status, resolution", icon: AlertCircle, color: "amber" },
  ];

  return (
    <div>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Data Export</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
              Export patient data, vitals, and alerts in CSV or PDF format.
            </p>
        </div>

        {/* Export Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            const isLoading = loading === c.type;
            return (
              <div key={c.type} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center gap-2">
                  <Icon size={20} className="text-slate-600 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.label}</h3>
                </div>
                <p className="mb-4 text-xs text-slate-500">{c.desc}</p>
                <div className="flex gap-2">
                  <button
                    disabled={isLoading}
                    onClick={() => {
                      if (c.type === "patients") exportPatientsCsv();
                      else if (c.type === "vitals") exportVitalsCsv();
                      else exportAlertsCsv();
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                    CSV
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => exportPdf(c.type)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>CSV:</strong> Downloads a file directly. Open in Excel, Google Sheets, etc.
            <br />
            <strong>PDF:</strong> Opens a printable report in a new tab. Use your browser&apos;s &quot;Print &gt; Save as PDF&quot; to save.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowLeft,
  User,
  Activity,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  Heart,
  Thermometer,
  Wind,
  Gauge,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";

interface VitalData {
  vitalType: "systolicBP" | "diastolicBP" | "heartRate" | "temperature" | "oxygenSaturation" | "respiratoryRate";
  value: number;
  threshold?: { min: number; max: number };
}

interface Alert {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
  resolution?: string | null;
  patientId: string;
  data?: VitalData;
  patient?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string | null;
    };
  };
  acknowledgedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  resolvedBy?: {
    firstName: string;
    lastName: string;
  } | null;
}

interface NextBestAction {
  title: string;
  rationale: string;
  confidence: number;
}

export default function AlertDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [aiActions, setAiActions] = useState<NextBestAction[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const checkAuthAndLoadAlert = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();

      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/alerts/${encodeURIComponent(params.id)}`, { cache: "no-store" });
      const result = await response.json();

      if (result.success && result.alert) {
        setAlert({
          ...result.alert,
          createdAt: result.alert.createdAt ? new Date(result.alert.createdAt) : new Date(),
          acknowledgedAt: result.alert.acknowledgedAt ? new Date(result.alert.acknowledgedAt) : null,
          resolvedAt: result.alert.resolvedAt ? new Date(result.alert.resolvedAt) : null,
        } as Alert);
      } else {
        setError(result?.detail || result?.error || "Unable to load the alert.");
      }
    } catch (err) {
      console.error("Error loading alert:", err);
      setError("A critical error occurred.");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const loadAiActions = useCallback(async () => {
    try {
      setAiLoading(true);
      setAiError(null);
      const response = await fetch(`/api/admin/alerts/${encodeURIComponent(params.id)}/next-actions`, { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        setAiActions(Array.isArray(result.actions) ? result.actions : []);
        setAiSummary(typeof result.summary === "string" ? result.summary : "");
      } else {
        setAiError(result?.error || "Unable to load AI suggestions");
      }
    } catch {
      setAiError("Unable to load AI suggestions");
    } finally {
      setAiLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    checkAuthAndLoadAlert();
  }, [checkAuthAndLoadAlert]);

  useEffect(() => {
    if (!loading && !error && alert?.id) {
      loadAiActions();
    }
  }, [alert?.id, loading, error, loadAiActions]);

  const getSeverityStyles = (severity: string) => {
    const styles: Record<string, { color: string; icon: JSX.Element; label: string }> = {
      CRITICAL: {
        color: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
        icon: <AlertCircle size={24} className="text-red-600 dark:text-red-500" />,
        label: "Critical",
      },
      HIGH: {
        color: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
        icon: <AlertTriangle size={24} className="text-orange-600 dark:text-orange-500" />,
        label: "High",
      },
      MEDIUM: {
        color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
        icon: <AlertCircle size={24} className="text-yellow-600 dark:text-yellow-500" />,
        label: "Medium",
      },
      LOW: {
        color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
        icon: <Info size={24} className="text-blue-600 dark:text-blue-500" />,
        label: "Low",
      },
    };
    return styles[severity] || {
      color: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700",
      icon: <AlertCircle size={24} />,
      label: severity,
    };
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, { color: string; icon: JSX.Element | null; label: string }> = {
      OPEN: {
        color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        icon: <AlertCircle size={18} />,
        label: "Open",
      },
      ACKNOWLEDGED: {
        color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: <Clock size={18} />,
        label: "Acknowledged",
      },
      RESOLVED: {
        color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        icon: <CheckCircle size={18} />,
        label: "Resolved",
      },
    };
    return styles[status] || { color: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300", icon: null, label: status };
  };

  const getVitalConfig = (type: string) => {
    const config: Record<string, { icon: JSX.Element; label: string; unit: string }> = {
      systolicBP: { icon: <Gauge size={16} className="text-red-500" />, label: "Systolic Pressure", unit: "mmHg" },
      diastolicBP: { icon: <Gauge size={16} className="text-red-500" />, label: "Diastolic Pressure", unit: "mmHg" },
      heartRate: { icon: <Heart size={16} className="text-red-500" />, label: "Heart Rate", unit: "bpm" },
      temperature: { icon: <Thermometer size={16} className="text-orange-500" />, label: "Temperature", unit: "C" },
      oxygenSaturation: { icon: <Wind size={16} className="text-blue-500" />, label: "Oxygen Saturation", unit: "%" },
      respiratoryRate: { icon: <Activity size={16} className="text-green-500" />, label: "Respiratory Rate", unit: "/min" },
    };
    return config[type] || { icon: <Activity size={16} />, label: type, unit: "" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="size-12 animate-spin rounded-full border-3 border-gray-200 dark:border-slate-800 border-t-blue-600 mb-4 mx-auto" />
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{error || "Alert not found"}</h1>
        <Link href="/dashboard/admin/alerts" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
          <ArrowLeft size={16} /> Back to list
        </Link>
      </div>
    );
  }

  const severity = getSeverityStyles(alert.severity);
  const status = getStatusStyles(alert.status);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/admin/alerts" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Alert Details</h1>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className={`p-6 ${severity.color} border-b border-inherit`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl shadow-sm">{severity.icon}</div>
              <div>
                <h2 className="text-xl font-bold">Alert {severity.label}</h2>
                <p className="text-sm font-medium opacity-80">{alert.alertType}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase ${status.color}`}>
                {status.icon} {status.label}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock size={14} /> Created on {formatDate(alert.createdAt)}
              </span>
            </div>

            <div className="mb-10 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-gray-900 dark:text-slate-200 text-lg leading-relaxed font-medium">{alert.message}</p>
            </div>

            <div className="mb-10 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/30 dark:to-cyan-950/30 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" /> AI Next Best Actions
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{aiSummary || "Top 3 recommended actions with confidence."}</p>
                </div>
                <button
                  type="button"
                  onClick={loadAiActions}
                  className="rounded-lg border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {aiLoading ? (
                <div className="py-4 text-sm text-indigo-700 dark:text-indigo-300">Generating AI recommendations...</div>
              ) : aiError ? (
                <div className="py-3 text-sm text-red-600 dark:text-red-400">{aiError}</div>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  {aiActions.map((item, idx) => (
                    <div key={`${item.title}-${idx}`} className="rounded-lg border border-white/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black tracking-wider text-indigo-600 dark:text-indigo-300 uppercase">Action {idx + 1}</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{Math.round((item.confidence || 0) * 100)}%</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-1.5">{item.title}</p>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-400">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {alert.data?.vitalType && (
              <div className="mb-10">
                <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-blue-500" /> Vitals at the time of alert
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const vital = getVitalConfig(alert.data!.vitalType);
                    return (
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex items-center gap-3 mb-3 text-gray-600 dark:text-slate-400">
                          {vital.icon}
                          <span className="text-sm font-semibold uppercase tracking-wider">{vital.label}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-4xl font-black text-gray-900 dark:text-slate-100">
                            {alert.data!.value} <span className="text-xl font-normal text-gray-400">{vital.unit}</span>
                          </span>
                          {alert.data!.threshold && (
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Thresholds</p>
                              <p className="text-sm font-mono text-gray-600 dark:text-slate-400">
                                {alert.data!.threshold.min} - {alert.data!.threshold.max}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-6">Action History</h3>
              <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-slate-800">
                <TimelineItem icon={<AlertCircle size={14} className="text-orange-600" />} color="bg-orange-100 dark:bg-orange-950/40" title="Alert generated by the system" date={formatDate(alert.createdAt)} />
                {alert.acknowledgedAt && (
                  <TimelineItem
                    icon={<Clock size={14} className="text-blue-600" />}
                    color="bg-blue-100 dark:bg-blue-950/40"
                    title="Alert acknowledged"
                    date={formatDate(alert.acknowledgedAt)}
                    user={`${alert.acknowledgedBy?.firstName} ${alert.acknowledgedBy?.lastName}`}
                  />
                )}
                {alert.resolvedAt && (
                  <TimelineItem
                    icon={<CheckCircle size={14} className="text-green-600" />}
                    color="bg-green-100 dark:bg-green-950/40"
                    title="Alert closed"
                    date={formatDate(alert.resolvedAt)}
                    user={`${alert.resolvedBy?.firstName} ${alert.resolvedBy?.lastName}`}
                  />
                )}
              </div>
            </div>

            {alert.resolution && (
              <div className="mb-10 p-5 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl">
                <h3 className="font-bold text-green-900 dark:text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle size={16} /> Resolution note
                </h3>
                <p className="text-green-800 dark:text-green-300 leading-relaxed italic">"{alert.resolution}"</p>
              </div>
            )}

            {alert.patient && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-8">
                <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-5">Patient</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <PatientInfoItem icon={<User size={18} className="text-blue-600 dark:text-blue-400" />} label="Full Name" value={`${alert.patient.user.firstName} ${alert.patient.user.lastName}`} color="bg-blue-50 dark:bg-blue-900/20" />
                  <PatientInfoItem icon={<Mail size={18} className="text-purple-600 dark:text-purple-400" />} label="Email" value={alert.patient.user.email} color="bg-purple-50 dark:bg-purple-900/20" />
                  {alert.patient.user.phoneNumber && (
                    <PatientInfoItem icon={<Phone size={18} className="text-green-600 dark:text-green-400" />} label="Contact" value={alert.patient.user.phoneNumber} color="bg-green-50 dark:bg-green-900/20" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon, color, title, date, user }: { icon: JSX.Element; color: string; title: string; date: string; user?: string }) {
  return (
    <div className="flex items-start gap-4 relative z-10">
      <div className={`h-9 w-9 rounded-full ${color} flex items-center justify-center flex-shrink-0 shadow-sm border border-white dark:border-slate-900`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 dark:text-slate-200 text-sm leading-tight">{title}</p>
        <p className="text-[11px] text-gray-500 dark:text-slate-500 font-medium mt-0.5">{date}</p>
        {user && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
            <User size={10} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{user}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PatientInfoItem({ icon, label, value, color }: { icon: JSX.Element; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:border-blue-200 dark:hover:border-blue-900">
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-black mb-0.5">{label}</p>
        <p className="font-bold text-gray-900 dark:text-slate-200 text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

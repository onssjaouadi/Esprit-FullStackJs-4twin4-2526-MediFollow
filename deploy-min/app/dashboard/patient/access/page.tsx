"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Clock,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  UserRound,
  Stethoscope,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getDoctorsWithAccessStatus,
  grantAccessToDoctor,
  revokeAccessFromDoctor,
  type DoctorWithAccess,
} from "@/lib/actions/patient-access.actions";

// ─── Duration options ─────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { label: "30 jours", value: 30 },
  { label: "3 mois", value: 90 },
  { label: "6 mois", value: 180 },
  { label: "1 an", value: 365 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientAccessPage() {
  const [user, setUser] = useState<any>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [actionResult, setActionResult] = useState<
    Record<string, { success: boolean; message: string; txHash?: string }>
  >({});
  const [selectedDuration, setSelectedDuration] = useState<
    Record<string, number>
  >({});

  // ─── Load data ───────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) return;

      const res = await getDoctorsWithAccessStatus(currentUser.id);
      if (res.success && res.doctors) {
        setDoctors(res.doctors);
        // init duration selection
        const durations: Record<string, number> = {};
        res.doctors.forEach((d) => (durations[d.id] = 365));
        setSelectedDuration(durations);
      } else {
        setError(res.error ?? "Erreur de chargement");
      }

      // Get patient model id for blockchain
      const patientRes = await fetch("/api/patient/me");
      if (patientRes.ok) {
        const data = await patientRes.json();
        setPatientId(data.patientId ?? null);
      }
    } catch (e) {
      setError("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Grant access ─────────────────────────────────────────────────────────

  async function handleGrant(doctorId: string) {
    if (!user || !patientId) return;
    setActionLoading((prev) => ({ ...prev, [doctorId]: true }));
    setActionResult((prev) => ({ ...prev, [doctorId]: undefined as any }));

    const duration = selectedDuration[doctorId] ?? 365;
    const res = await grantAccessToDoctor(
      user.id,
      patientId,
      doctorId,
      duration
    );

    setActionResult((prev) => ({
      ...prev,
      [doctorId]: {
        success: res.success,
        message: res.success
          ? `Accès accordé pour ${duration} jours`
          : (res.error ?? "Erreur"),
        txHash: res.txHash,
      },
    }));
    setActionLoading((prev) => ({ ...prev, [doctorId]: false }));

    if (res.success) {
      // Refresh doctor list
      const refreshed = await getDoctorsWithAccessStatus(user.id);
      if (refreshed.success && refreshed.doctors) setDoctors(refreshed.doctors);
    }
  }

  // ─── Revoke access ────────────────────────────────────────────────────────

  async function handleRevoke(doctorId: string) {
    if (!user || !patientId) return;
    setActionLoading((prev) => ({ ...prev, [doctorId]: true }));
    setActionResult((prev) => ({ ...prev, [doctorId]: undefined as any }));

    const res = await revokeAccessFromDoctor(user.id, patientId, doctorId);

    setActionResult((prev) => ({
      ...prev,
      [doctorId]: {
        success: res.success,
        message: res.success ? "Accès révoqué" : (res.error ?? "Erreur"),
        txHash: res.txHash,
      },
    }));
    setActionLoading((prev) => ({ ...prev, [doctorId]: false }));

    if (res.success) {
      const refreshed = await getDoctorsWithAccessStatus(user.id);
      if (refreshed.success && refreshed.doctors) setDoctors(refreshed.doctors);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function getAccessStatus(doctor: DoctorWithAccess) {
    if (!doctor.accessGrant) return "none";
    if (!doctor.accessGrant.isActive) return "revoked";
    if (
      doctor.accessGrant.expiresAt &&
      new Date(doctor.accessGrant.expiresAt) < new Date()
    )
      return "expired";
    return "active";
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const activeDoctors = doctors.filter((d) => getAccessStatus(d) === "active");
  const otherDoctors = doctors.filter((d) => getAccessStatus(d) !== "active");

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="size-6 text-blue-600" />
            Contrôle d'accès médical
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez quels médecins peuvent accéder à vos informations de santé via
            la blockchain Aptos
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="size-4" />
          Actualiser
        </button>
      </div>

      {/* Info banner */}
      {!patientId && !loading && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Dossier patient non trouvé
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Vous devez avoir un dossier patient pour gérer les accès
              blockchain.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="size-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Active accesses */}
      {activeDoctors.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-green-600" />
            Accès actifs ({activeDoctors.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                status="active"
                duration={selectedDuration[doctor.id] ?? 365}
                onDurationChange={(v) =>
                  setSelectedDuration((prev) => ({ ...prev, [doctor.id]: v }))
                }
                isLoading={actionLoading[doctor.id] ?? false}
                result={actionResult[doctor.id]}
                onGrant={() => handleGrant(doctor.id)}
                onRevoke={() => handleRevoke(doctor.id)}
                disabled={!patientId}
              />
            ))}
          </div>
        </section>
      )}

      {/* All doctors */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Stethoscope className="size-4 text-gray-400" />
          {activeDoctors.length > 0
            ? `Autres médecins (${otherDoctors.length})`
            : `Tous les médecins (${doctors.length})`}
        </h2>

        {doctors.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <UserRound className="size-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucun médecin disponible</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(activeDoctors.length > 0 ? otherDoctors : doctors).map(
              (doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  status={getAccessStatus(doctor)}
                  duration={selectedDuration[doctor.id] ?? 365}
                  onDurationChange={(v) =>
                    setSelectedDuration((prev) => ({ ...prev, [doctor.id]: v }))
                  }
                  isLoading={actionLoading[doctor.id] ?? false}
                  result={actionResult[doctor.id]}
                  onGrant={() => handleGrant(doctor.id)}
                  onRevoke={() => handleRevoke(doctor.id)}
                  disabled={!patientId}
                />
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}

// ─── Doctor Card Component ────────────────────────────────────────────────────

interface DoctorCardProps {
  doctor: DoctorWithAccess;
  status: "active" | "revoked" | "expired" | "none";
  duration: number;
  onDurationChange: (v: number) => void;
  isLoading: boolean;
  result?: { success: boolean; message: string; txHash?: string };
  onGrant: () => void;
  onRevoke: () => void;
  disabled: boolean;
}

function DoctorCard({
  doctor,
  status,
  duration,
  onDurationChange,
  isLoading,
  result,
  onGrant,
  onRevoke,
  disabled,
}: DoctorCardProps) {
  const isActive = status === "active";

  const statusConfig = {
    active: {
      label: "Accès actif",
      color: "text-green-700 bg-green-50 border-green-200",
      icon: ShieldCheck,
      ring: "ring-2 ring-green-200",
    },
    revoked: {
      label: "Accès révoqué",
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: ShieldOff,
      ring: "",
    },
    expired: {
      label: "Accès expiré",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      icon: Clock,
      ring: "",
    },
    none: {
      label: "Aucun accès",
      color: "text-gray-500 bg-gray-50 border-gray-100",
      icon: Shield,
      ring: "",
    },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all ${cfg.ring}`}
    >
      {/* Doctor info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
          {doctor.firstName[0]}
          {doctor.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          {doctor.specialty && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doctor.specialty}</p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}
            >
              <StatusIcon className="size-3" />
              {cfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet status */}
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
        <Wallet
          className={`size-4 flex-shrink-0 ${
            doctor.hasWallet ? "text-blue-600" : "text-gray-400"
          }`}
        />
        <div className="min-w-0 flex-1">
          {doctor.hasWallet ? (
            <p className="truncate font-mono text-xs text-gray-700 dark:text-gray-300">
              {doctor.blockchainAddress?.slice(0, 6)}…
              {doctor.blockchainAddress?.slice(-4)}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">Pas de wallet blockchain</p>
          )}
        </div>
      </div>

      {/* Grant info */}
      {isActive && doctor.accessGrant && (
        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            Accordé le{" "}
            {new Date(doctor.accessGrant.grantedAt).toLocaleDateString("fr-FR")}
          </div>
          {doctor.accessGrant.expiresAt && (
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              Expire le{" "}
              {new Date(doctor.accessGrant.expiresAt).toLocaleDateString(
                "fr-FR"
              )}
            </div>
          )}
          {doctor.accessGrant.txHashGrant && (
            <a
              href={`https://explorer.aptoslabs.com/txn/${doctor.accessGrant.txHashGrant}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ExternalLink className="size-3" />
              Tx: {doctor.accessGrant.txHashGrant.slice(0, 10)}…
            </a>
          )}
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div
          className={`mb-3 flex items-start gap-2 rounded-lg p-2.5 text-xs ${
            result.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="size-3.5 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="size-3.5 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p>{result.message}</p>
            {result.txHash && (
              <a
                href={`https://explorer.aptoslabs.com/txn/${result.txHash}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline mt-0.5"
              >
                <ExternalLink className="size-3" />
                Voir la transaction
              </a>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isActive ? (
        <div className="space-y-2">
          {/* Duration selector */}
          <div className="flex gap-1.5 flex-wrap">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDurationChange(opt.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                  duration === opt.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={onGrant}
            disabled={isLoading || disabled || !doctor.hasWallet}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {isLoading ? "Transaction en cours..." : "Accorder l'accès"}
          </button>
          {!doctor.hasWallet && (
            <p className="text-xs text-amber-600 text-center">
              Ce médecin n'a pas encore de wallet
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={onRevoke}
          disabled={isLoading || disabled}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldOff className="size-4" />
          )}
          {isLoading ? "Révocation en cours..." : "Révoquer l'accès"}
        </button>
      )}
    </div>
  );
}

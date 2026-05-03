"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  getWearableDevices,
  registerEnzoDevice,
  getWearableSyncHistory,
} from "@/lib/actions/wearable.actions";
import { formatDateTime } from "@/lib/utils";

export default function WearableDevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectForm, setConnectForm] = useState({
    deviceId: "",
    authToken: "",
  });
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      // Get current patient ID from local storage or API
      const user = await fetch("/api/me").then((r) => r.json());
      if (user?.patient?.id) {
        setPatientId(user.patient.id);

        // Load devices
        const devicesRes = await getWearableDevices(user.patient.id);
        if (devicesRes.success) {
          setDevices(devicesRes.data || []);
        }

        // Load sync history
        const historyRes = await getWearableSyncHistory(user.patient.id);
        if (historyRes.success) {
          setSyncHistory(historyRes.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectDevice() {
    if (!connectForm.deviceId || !connectForm.authToken) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setConnecting(true);
    try {
      const result = await registerEnzoDevice(
        patientId,
        connectForm.deviceId,
        connectForm.authToken
      );

      if (result.success) {
        alert("✅ Montre Enzo 200 connectée avec succès!");
        setConnectForm({ deviceId: "", authToken: "" });
        setShowConnectModal(false);
        loadDevices();
      } else {
        alert("❌ Erreur: " + result.error);
      }
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/patient/settings"
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🏥 Appareils Portables
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gérez vos montres connectées et synchronisez vos données de
                santé
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Connect Buttons */}
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Connexion Manuelle
          </button>
          <Link
            href="/dashboard/patient/wearables/enzo200-connect"
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-white font-medium hover:shadow-lg transition-all"
          >
            <Shield size={20} />
            Santé Connect
          </Link>
        </div>

        {/* Connected Devices */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📱 Appareils Connectés
          </h2>

          {devices.length === 0 ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
              <Smartphone size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Aucun appareil connecté pour le moment
              </p>
              <button
                onClick={() => setShowConnectModal(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Connecter votre première montre
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3">
                        <Smartphone size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {device.deviceType === "ENZO_200"
                            ? "🎯 Enzo 200 Smart Watch"
                            : device.deviceType}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {device.deviceId}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock size={14} />
                          Dernier sync:{" "}
                          {device.lastSyncedAt
                            ? formatDateTime(new Date(device.lastSyncedAt))
                            : "Jamais"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={18} />
                        <span className="text-sm font-medium">Actif</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync History */}
        {syncHistory.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📊 Historique de Synchronisation
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {syncHistory.slice(0, 20).map((sync) => (
                <div
                  key={sync.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    {sync.syncStatus === "SUCCESS" ? (
                      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                        <AlertCircle size={16} className="text-red-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sync.syncStatus === "SUCCESS"
                          ? "✅ Synchronisation réussie"
                          : "❌ Erreur de synchronisation"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(new Date(sync.createdAt))}
                      </p>
                      {sync.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">
                          {sync.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎯 Connecter Enzo 200
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID de l'appareil
                </label>
                <input
                  type="text"
                  placeholder="Ex: ENZO_ABC123456"
                  value={connectForm.deviceId}
                  onChange={(e) =>
                    setConnectForm({ ...connectForm, deviceId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token d'authentification
                </label>
                <input
                  type="password"
                  placeholder="Votre token Enzo API"
                  value={connectForm.authToken}
                  onChange={(e) =>
                    setConnectForm({
                      ...connectForm,
                      authToken: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConnectDevice}
                disabled={connecting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {connecting ? "Connexion..." : "Connecter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

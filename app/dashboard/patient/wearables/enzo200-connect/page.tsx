"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SanteConnectIntegration from "@/components/SanteConnectIntegration";
import {
  getSanteConnectDevices,
  disconnectSanteConnectDevice,
} from "@/lib/actions/santeconnect.actions";

export default function Enzo200ConnectPage() {
  const searchParams = useSearchParams();
  const [patientId, setPatientId] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [success, setSuccess] = useState(
    !!searchParams.get("device_connected")
  );
  const [error, setError] = useState(searchParams.get("error") || "");

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);

      // Get patient ID
      const response = await fetch("/api/patient/me");
      const { patientId } = await response.json();
      setPatientId(patientId);

      // Load Santé Connect devices
      const devicesRes = await getSanteConnectDevices();
      if (devicesRes.success) {
        setDevices(devicesRes.data || []);
      }
    } catch (err) {
      console.error("Error loading devices:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect(deviceId: string) {
    if (!confirm("Êtes-vous sûr de vouloir déconnecter cette montre ?")) {
      return;
    }

    setDisconnecting(deviceId);
    try {
      const result = await disconnectSanteConnectDevice(deviceId);
      if (result.success) {
        setDevices(devices.filter((d) => d.id !== deviceId));
      } else {
        setError(result.error || "Erreur lors de la déconnexion");
      }
    } finally {
      setDisconnecting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/patient/wearables"
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ⌚ Connecter Enzo200
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Synchronisez votre montre intelligente avec Santé Connect
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✅ Montre Enzo200 connectée avec succès ! Vos données seront
              synchronisées automatiquement.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Santé Connect Integration */}
        <div className="mb-8">
          {patientId && (
            <SanteConnectIntegration
              patientId={patientId}
              onSuccess={() => {
                setSuccess(true);
                setTimeout(() => loadDevices(), 2000);
              }}
              onError={(err) => setError(err)}
            />
          )}
        </div>

        {/* Connected Devices */}
        {devices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Montres Connectées
              </CardTitle>
              <CardDescription>
                {devices.length} montre{devices.length > 1 ? "s" : ""} Enzo200
                connectée{devices.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {device.deviceType}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Dernier synchronisation:{" "}
                          {new Date(device.lastSyncedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(device.id)}
                      disabled={disconnecting === device.id}
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      {disconnecting === device.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Déconnexion...
                        </>
                      ) : (
                        "Déconnecter"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Devices */}
        {!loading && devices.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Smartphone className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-center text-gray-600 dark:text-gray-400">
                Aucune montre Enzo200 connectée.
                <br />
                Utilisez la section ci-dessus pour en connecter une.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💓 Suivi Temps Réel</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              Vos constantes vitales sont synchronisées en continu.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔒 Données Sécurisées</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              Authentification sécurisée via Santé Connect.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏥 Partage Médecin</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              Votre médecin peut accéder à vos données.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

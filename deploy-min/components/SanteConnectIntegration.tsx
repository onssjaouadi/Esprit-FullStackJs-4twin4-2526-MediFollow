"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SanteConnectIntegrationProps {
  patientId: string;
  onSuccess?: (deviceData: any) => void;
  onError?: (error: string) => void;
}

export default function SanteConnectIntegration({
  patientId,
  onSuccess,
  onError,
}: SanteConnectIntegrationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"intro" | "connecting" | "connected">(
    "intro"
  );

  const handleConnectWithSanteConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a state token for security
      const stateToken = Math.random().toString(36).substring(7);
      sessionStorage.setItem("santeconnect_state", stateToken);

      // Call backend to get Santé Connect authorization URL
      const response = await fetch("/api/wearables/santeconnect/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientId,
          state: stateToken,
          deviceType: "ENZO_200",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'autorisation");
      }

      // Redirect to Santé Connect authorization
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (err: any) {
      const message = err.message || "Erreur de connexion";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                  Connexion Santé Connect
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Connectez votre montre Enzo200 en toute sécurité
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                ✅ Montre Enzo200 connectée avec succès !
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Step 1: Intro */}
            {step === "intro" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                  <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                    Comment ça marche ?
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <span>Cliquez sur "Se connecter avec Santé Connect"</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <span>
                        Authentifiez-vous via Santé Connect (Pro Santé Connect)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <span>
                        Autorisez MediFollow à accéder à votre Enzo200
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <span>Vos données de santé seront synchronisées</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    🔒 <strong>Sécurité :</strong> Vos identifiants ne sont
                    jamais stockés. Santé Connect gère votre authentification de
                    manière sécurisée.
                  </p>
                </div>

                <Button
                  onClick={handleConnectWithSanteConnect}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Se connecter avec Santé Connect
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Connecting */}
            {step === "connecting" && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Connexion avec Santé Connect en cours...
                </p>
              </div>
            )}

            {/* Step 3: Connected */}
            {step === "connected" && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <div className="text-center">
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    Connexion établie !
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Votre Enzo200 est maintenant connectée à MediFollow
                  </p>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Avantages :
              </p>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Synchronisation automatique de vos données</li>
                <li>✓ Suivi en temps réel de vos constantes vitales</li>
                <li>✓ Partage sécurisé avec votre médecin</li>
                <li>✓ Alertes automatiques en cas d'anomalie</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

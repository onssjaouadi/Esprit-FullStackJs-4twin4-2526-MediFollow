"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  RefreshCw,
  X,
} from "lucide-react";

type Status =
  | "idle"
  | "loading-camera"
  | "loading-models"
  | "detecting"
  | "authenticating"
  | "success"
  | "error";

interface FaceLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FaceLoginModal({ open, onClose }: FaceLoginModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stoppedRef = useRef(false);
  const capturedRef = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);

  const router = useRouter();

  const stopCamera = useCallback(() => {
    stoppedRef.current = true;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopCamera();
    stoppedRef.current = false;
    capturedRef.current = false;
    setStatus("idle");
    setMessage("");
    setFaceDetected(false);
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    setStatus("idle");
    setMessage("");
    setFaceDetected(false);
    onClose();
  }, [onClose, stopCamera]);

  const start = useCallback(async () => {
    stoppedRef.current = false;
    capturedRef.current = false;

    try {
      // Step 1: Camera access
      setStatus("loading-camera");
      setMessage("Démarrage de la caméra...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (stoppedRef.current) return;

      // Step 2: Load face-api models (dynamic import to avoid SSR issues)
      setStatus("loading-models");
      setMessage(
        "Chargement des modèles IA (peut prendre quelques secondes)..."
      );

      const faceapi = await import("@vladmandic/face-api");

      const MODEL_URL = "/models/face";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.isLoaded
          ? Promise.resolve()
          : faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.isLoaded
          ? Promise.resolve()
          : faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.isLoaded
          ? Promise.resolve()
          : faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      if (stoppedRef.current) return;

      // Step 3: Face detection loop
      setStatus("detecting");
      setMessage("Regardez droit vers la caméra...");

      const detectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      });

      const detect = async () => {
        if (stoppedRef.current || capturedRef.current || !videoRef.current)
          return;

        try {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, detectorOptions)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (stoppedRef.current || capturedRef.current) return;

          if (detection) {
            setFaceDetected(true);
            capturedRef.current = true;

            // Step 4: Authenticate
            setStatus("authenticating");
            setMessage("Vérification de l'identité...");

            const descriptor = Array.from(detection.descriptor);

            const res = await fetch("/api/auth/face/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ descriptor }),
            });

            const data = await res.json();

            if (data.success) {
              stopCamera();
              setStatus("success");
              setMessage(`Bienvenue ${data.user.firstName} !`);

              setTimeout(() => {
                const role = data.user.role;
                if (role === "PATIENT") router.push("/patients");
                else if (role === "DOCTOR") router.push("/dashboard/doctor");
                else router.push("/admin");
              }, 1800);
            } else {
              setStatus("error");
              setMessage(
                data.error ||
                  "Visage non reconnu. Veuillez vous connecter avec votre mot de passe."
              );
            }
          } else {
            setFaceDetected(false);
            setTimeout(detect, 300);
          }
        } catch {
          if (!stoppedRef.current) {
            setStatus("error");
            setMessage("Erreur réseau. Veuillez réessayer.");
          }
        }
      };

      detect();
    } catch (err: unknown) {
      const domErr = err as { name?: string };
      if (domErr?.name === "NotAllowedError") {
        setStatus("error");
        setMessage(
          "Accès à la caméra refusé. Autorisez la caméra dans les paramètres de votre navigateur."
        );
      } else if (domErr?.name === "NotFoundError") {
        setStatus("error");
        setMessage("Aucune caméra détectée sur cet appareil.");
      } else {
        setStatus("error");
        setMessage("Impossible de démarrer la caméra.");
      }
    }
  }, [router, stopCamera]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!open) {
      stopCamera();
      setStatus("idle");
      setFaceDetected(false);
      setMessage("");
    }
  }, [open, stopCamera]);

  if (!open) return null;

  const isRunning =
    status === "loading-camera" ||
    status === "loading-models" ||
    status === "detecting" ||
    status === "authenticating";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-dark-200 border border-dark-400 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20">
              <ScanFace className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Reconnaissance faciale
              </h2>
              <p className="text-xs text-dark-600">Connexion sécurisée</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-dark-600 hover:bg-dark-400 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video / Camera area */}
        <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
          <video
            ref={videoRef}
            className={`h-full w-full object-cover [transform:scaleX(-1)] transition-opacity duration-300 ${
              status === "detecting" || status === "authenticating"
                ? "opacity-100"
                : "opacity-30"
            }`}
            muted
            playsInline
          />

          {/* Face alignment oval guide */}
          {(status === "detecting" || status === "authenticating") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-44 h-56 rounded-full border-4 transition-all duration-300 ${
                  status === "authenticating"
                    ? "border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.5)] animate-pulse"
                    : faceDetected
                      ? "border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.4)]"
                      : "border-white/25"
                }`}
              />
            </div>
          )}

          {/* Idle overlay */}
          {status === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ScanFace className="h-16 w-16 text-white/20 mb-3" />
              <p className="text-white/40 text-sm text-center px-6">
                Appuyez sur le bouton ci-dessous pour démarrer
              </p>
            </div>
          )}

          {/* Loading overlay */}
          {(status === "loading-camera" || status === "loading-models") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-3" />
              <p className="text-white/80 text-sm text-center px-6">
                {message}
              </p>
            </div>
          )}

          {/* Success overlay */}
          {status === "success" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-950/90">
              <CheckCircle2 className="h-16 w-16 text-green-400 mb-3" />
              <p className="text-green-300 font-semibold text-lg">{message}</p>
              <p className="text-green-400/60 text-sm mt-1">
                Redirection en cours...
              </p>
            </div>
          )}

          {/* Error overlay */}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90">
              <AlertCircle className="h-16 w-16 text-red-400 mb-3" />
              <p className="text-red-300 text-sm text-center px-6">{message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 space-y-3">
          {/* Live status indicator */}
          {status === "detecting" && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  faceDetected
                    ? "bg-green-400 animate-pulse"
                    : "bg-yellow-400 animate-pulse"
                }`}
              />
              <span
                className={faceDetected ? "text-green-400" : "text-yellow-400"}
              >
                {faceDetected ? "Visage détecté" : "Recherche d'un visage..."}
              </span>
            </div>
          )}

          {status === "authenticating" && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Vérification de l&apos;identité...
            </div>
          )}

          {/* Action buttons */}
          {status === "idle" && (
            <button
              onClick={start}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5" />
              Démarrer la reconnaissance faciale
            </button>
          )}

          {isRunning && (
            <button
              onClick={reset}
              className="w-full rounded-xl border border-dark-400 hover:bg-dark-400/50 text-dark-600 hover:text-white font-medium py-2.5 transition-colors text-sm"
            >
              Annuler
            </button>
          )}

          {status === "error" && (
            <button
              onClick={reset}
              className="w-full rounded-xl bg-dark-400 hover:bg-dark-500 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
          )}

          <p className="text-center text-xs text-dark-600">
            Vous devez d&apos;abord{" "}
            <span className="text-blue-400">enregistrer votre visage</span>{" "}
            depuis votre profil pour utiliser cette fonctionnalité.
          </p>
        </div>
      </div>
    </div>
  );
}

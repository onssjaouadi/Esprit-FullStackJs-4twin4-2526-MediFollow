"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";

type Status =
  | "idle"
  | "loading-camera"
  | "loading-models"
  | "detecting"
  | "saving"
  | "success"
  | "error";

interface FaceEnrollModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hasExistingFace?: boolean;
}

export default function FaceEnrollModal({
  open,
  onClose,
  onSuccess,
  hasExistingFace = false,
}: FaceEnrollModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stoppedRef = useRef(false);
  const capturedRef = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/face/enroll", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onSuccess?.();
        handleClose();
      } else {
        setMessage(data.error || "Erreur lors de la suppression.");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setDeleting(false);
    }
  }, [handleClose, onSuccess]);

  const start = useCallback(async () => {
    stoppedRef.current = false;
    capturedRef.current = false;

    try {
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

      setStatus("loading-models");
      setMessage("Chargement des modèles IA...");

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

      setStatus("detecting");
      setMessage(
        "Regardez droit vers la caméra pour enregistrer votre visage..."
      );

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

            setStatus("saving");
            setMessage("Enregistrement du visage...");

            const descriptor = Array.from(detection.descriptor);

            const res = await fetch("/api/auth/face/enroll", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ descriptor }),
            });

            const data = await res.json();

            if (data.success) {
              stopCamera();
              setStatus("success");
              setMessage("Votre visage a été enregistré avec succès !");
              setTimeout(() => {
                onSuccess?.();
                handleClose();
              }, 2000);
            } else {
              setStatus("error");
              setMessage(data.error || "Erreur lors de l'enregistrement.");
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
  }, [handleClose, onSuccess, stopCamera]);

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
    status === "saving";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-dark-200 border border-dark-400 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600/20">
              <ScanFace className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {hasExistingFace
                  ? "Mettre à jour mon visage"
                  : "Enregistrer mon visage"}
              </h2>
              <p className="text-xs text-dark-600">Connexion biométrique</p>
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

        {/* Camera area */}
        <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
          <video
            ref={videoRef}
            className={`h-full w-full object-cover [transform:scaleX(-1)] transition-opacity duration-300 ${
              status === "detecting" || status === "saving"
                ? "opacity-100"
                : "opacity-30"
            }`}
            muted
            playsInline
          />

          {/* Face alignment oval */}
          {(status === "detecting" || status === "saving") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-44 h-56 rounded-full border-4 transition-all duration-300 ${
                  status === "saving"
                    ? "border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-pulse"
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
                Appuyez sur le bouton pour scanner votre visage
              </p>
            </div>
          )}

          {/* Loading overlay */}
          {(status === "loading-camera" || status === "loading-models") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <Loader2 className="h-12 w-12 text-green-400 animate-spin mb-3" />
              <p className="text-white/80 text-sm text-center px-6">
                {message}
              </p>
            </div>
          )}

          {/* Success overlay */}
          {status === "success" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-950/90">
              <CheckCircle2 className="h-16 w-16 text-green-400 mb-3" />
              <p className="text-green-300 font-semibold text-lg text-center px-4">
                {message}
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
          {status === "detecting" && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span
                className={`inline-block h-2 w-2 rounded-full animate-pulse ${
                  faceDetected ? "bg-green-400" : "bg-yellow-400"
                }`}
              />
              <span
                className={faceDetected ? "text-green-400" : "text-yellow-400"}
              >
                {faceDetected
                  ? "Visage détecté — capture en cours..."
                  : "Recherche d'un visage..."}
              </span>
            </div>
          )}

          {status === "saving" && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </div>
          )}

          {status === "idle" && (
            <button
              onClick={start}
              className="w-full rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-semibold py-3 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5" />
              {hasExistingFace
                ? "Mettre à jour mon visage"
                : "Scanner mon visage"}
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

          {status === "idle" && hasExistingFace && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-xl border border-red-900/40 hover:bg-red-950/30 text-red-400 hover:text-red-300 font-medium py-2.5 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer mon visage enregistré
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

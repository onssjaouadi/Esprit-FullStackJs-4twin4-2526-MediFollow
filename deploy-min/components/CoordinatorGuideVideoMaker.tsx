"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Film, Loader2, Play, Square } from "lucide-react";

type Scene = {
  title: string;
  voiceover: string;
  onScreen: string[];
  durationSec: number;
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  const lines: string[] = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
  return lines.length;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function detectSceneType(scene: Scene) {
  const txt = `${scene.title} ${scene.voiceover} ${scene.onScreen.join(" ")}`.toLowerCase();
  if (
    txt.includes("tension") ||
    txt.includes("systolique") ||
    txt.includes("diastolique") ||
    txt.includes("brassard")
  ) {
    return "bp";
  }
  if (
    txt.includes("fréquence cardiaque") ||
    txt.includes("frequence cardiaque") ||
    txt.includes("pouls") ||
    txt.includes("bpm")
  ) {
    return "hr";
  }
  if (txt.includes("température") || txt.includes("temperature") || txt.includes("thermom")) {
    return "temp";
  }
  if (
    txt.includes("spo2") ||
    txt.includes("oxym") ||
    txt.includes("saturation") ||
    txt.includes("oxyg")
  ) {
    return "spo2";
  }
  return "generic";
}

function drawFloatingGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha = 0.22) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDoctor(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, animation = 0) {
  const bob = Math.sin(animation * Math.PI * 2) * 4 * scale;
  ctx.save();
  ctx.translate(0, bob);

  ctx.fillStyle = "#F2C29B";
  ctx.beginPath();
  ctx.arc(x, y, 28 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0F172A";
  roundedRect(ctx, x - 36 * scale, y + 30 * scale, 72 * scale, 88 * scale, 16 * scale);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x - 30 * scale, y + 40 * scale, 60 * scale, 68 * scale, 14 * scale);
  ctx.fill();

  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 3 * scale;
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(x - 10 * scale, y + 48 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.arc(x + 10 * scale, y + 48 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.arc(x, y + 10 * scale, 18 * scale, 0, Math.PI);
  ctx.stroke();

  ctx.strokeStyle = "#60A5FA";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(x - 20 * scale, y + 48 * scale);
  ctx.lineTo(x - 16 * scale, y + 66 * scale);
  ctx.lineTo(x + 16 * scale, y + 66 * scale);
  ctx.lineTo(x + 20 * scale, y + 48 * scale);
  ctx.stroke();

  ctx.restore();
}

function drawPatient(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, animation = 0) {
  const breathe = Math.sin(animation * Math.PI * 2) * 3 * scale;
  ctx.save();
  ctx.translate(0, breathe);

  ctx.fillStyle = "#F6C2A2";
  ctx.beginPath();
  ctx.arc(x, y, 26 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2563EB";
  roundedRect(ctx, x - 32 * scale, y + 26 * scale, 64 * scale, 72 * scale, 18 * scale);
  ctx.fill();

  ctx.fillStyle = "#93C5FD";
  roundedRect(ctx, x - 28 * scale, y + 32 * scale, 56 * scale, 18 * scale, 12 * scale);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(x - 8 * scale, y - 2 * scale, 4 * scale, 0, Math.PI * 2);
  ctx.arc(x + 8 * scale, y - 2 * scale, 4 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y + 10 * scale);
  ctx.quadraticCurveTo(x, y + 18 * scale, x + 8 * scale, y + 10 * scale);
  ctx.stroke();

  ctx.restore();
}

function drawBpDevice(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
  ctx.fillStyle = "#E0F2FE";
  roundedRect(ctx, x, y, w, h, 24);
  ctx.fill();
  ctx.strokeStyle = "#60A5FA";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x + 20, y + 20, w - 40, h - 80, 18);
  ctx.fill();
  ctx.strokeStyle = "#BFDBFE";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 36px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("125/80", x + 32, y + 68);

  ctx.fillStyle = "#2563EB";
  ctx.font = "600 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("mmHg", x + 32, y + 108);

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + h - 36);
  ctx.lineTo(x + w - 20, y + h - 36);
  ctx.stroke();

  ctx.strokeStyle = "#2563EB";
  ctx.lineWidth = 8;
  const dial = x + w * 0.16 + Math.sin(t * Math.PI * 2) * 12;
  ctx.beginPath();
  ctx.moveTo(dial, y + h - 36);
  ctx.lineTo(dial + 20, y + h - 56);
  ctx.stroke();
}

function drawHrDevice(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
  ctx.fillStyle = "#FEF2F2";
  roundedRect(ctx, x, y, w, h, 24);
  ctx.fill();
  ctx.strokeStyle = "#EF4444";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x + 18, y + 18, w - 36, h - 76, 18);
  ctx.fill();

  ctx.fillStyle = "#DC2626";
  ctx.font = "800 42px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("85 bpm", x + 30, y + 70);

  ctx.strokeStyle = "#DC2626";
  ctx.lineWidth = 8;
  ctx.beginPath();
  const sy = y + h * 0.65;
  const wave = Math.sin(t * Math.PI * 4);
  ctx.moveTo(x + 28, sy);
  ctx.lineTo(x + 68, sy);
  ctx.lineTo(x + 86, sy - 22 * wave);
  ctx.lineTo(x + 110, sy + 16 * wave);
  ctx.lineTo(x + w - 28, sy);
  ctx.stroke();
}

function drawTempDevice(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
  ctx.fillStyle = "#F8FAFC";
  roundedRect(ctx, x, y, w, h, 24);
  ctx.fill();
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x + 24, y + 18, w - 48, h - 74, 18);
  ctx.fill();

  ctx.fillStyle = "#F97316";
  ctx.font = "800 42px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("37.2°C", x + 30, y + 70);

  ctx.strokeStyle = "#F97316";
  ctx.lineWidth = 10;
  ctx.beginPath();
  const level = y + h - 42 - Math.sin(t * Math.PI * 2) * 8;
  ctx.moveTo(x + 44, y + h - 42);
  ctx.lineTo(x + w - 44, level);
  ctx.stroke();
}

function drawSpo2Device(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
  ctx.fillStyle = "#ECFDF5";
  roundedRect(ctx, x, y, w, h, 24);
  ctx.fill();
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x + 24, y + 18, w - 48, h - 74, 18);
  ctx.fill();

  ctx.fillStyle = "#047857";
  ctx.font = "800 42px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("98%", x + 40, y + 72);

  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(x + w * 0.7, y + h * 0.75, 18, 0, Math.PI * 2);
  ctx.stroke();
}

function drawScene(ctx: CanvasRenderingContext2D, scene: Scene, progress: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  drawFloatingGlow(ctx, w * 0.22, h * 0.18, 80, "#60A5FA", 0.14);
  drawFloatingGlow(ctx, w * 0.83, h * 0.15, 90, "#A855F7", 0.12);
  drawFloatingGlow(ctx, w * 0.18, h * 0.78, 70, "#38BDF8", 0.1);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#071A35");
  bg.addColorStop(1, "#0F2B62");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.03 + i * 0.02})`;
    ctx.beginPath();
    const x = w * (0.1 + i * 0.23);
    const y = h * (0.12 + i * 0.15);
    ctx.arc(x, y, 18 + i * 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const cardX = 48;
  const cardY = 48;
  const cardW = w - 96;
  const cardH = h - 96;
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  roundedRect(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fill();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 40px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(title, cardX + 40, cardY + 72);

  ctx.fillStyle = "#1F2937";
  ctx.font = "800 34px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(scene.title, cardX + 40, cardY + 128);

  const illuX = cardX + 40;
  const illuY = cardY + 170;
  const illuW = cardW * 0.56;
  const illuH = cardH - 260;
  roundedRect(ctx, illuX, illuY, illuW, illuH, 28);
  ctx.fillStyle = "#F8FAFC";
  ctx.fill();
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 3;
  ctx.stroke();

  drawFloatingGlow(ctx, illuX + 80, illuY + 80, 34, "#2563EB", 0.16);
  drawFloatingGlow(ctx, illuX + illuW - 90, illuY + 60, 26, "#F97316", 0.16);

  drawPatient(ctx, illuX + 170, illuY + 230, 0.92, progress);
  drawDoctor(ctx, illuX + 120, illuY + 360, 0.88, progress + 0.25);

  const type = detectSceneType(scene);
  const deviceX = illuX + illuW + 22;
  const deviceW = cardW - illuW - 100;
  const deviceY = illuY + 20;
  const deviceH = illuH - 40;
  ctx.fillStyle = "rgba(15,23,42,0.03)";
  roundedRect(ctx, deviceX, deviceY, deviceW, deviceH, 28);
  ctx.fill();
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 24px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Illustration animée", deviceX + 24, deviceY + 46);

  if (type === "bp") {
    drawBpDevice(ctx, deviceX + 28, deviceY + 90, deviceW - 56, deviceH - 130, progress);
  } else if (type === "hr") {
    drawHrDevice(ctx, deviceX + 28, deviceY + 90, deviceW - 56, deviceH - 130, progress);
  } else if (type === "temp") {
    drawTempDevice(ctx, deviceX + 28, deviceY + 90, deviceW - 56, deviceH - 130, progress);
  } else if (type === "spo2") {
    drawSpo2Device(ctx, deviceX + 28, deviceY + 90, deviceW - 56, deviceH - 130, progress);
  } else {
    drawFloatingGlow(ctx, deviceX + deviceW * 0.5, deviceY + deviceH * 0.5, 110, "#7C3AED", 0.15);
    ctx.fillStyle = "#2563EB";
    ctx.font = "800 48px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("OK", deviceX + deviceW * 0.5 - 26, deviceY + deviceH * 0.5 + 16);
  }

  const phrase = scene.voiceover
    .replace(/\s+/g, " ")
    .split(".")
    .slice(0, 2)
    .join(".")
    .trim();
  const bubbleX = illuX + 32;
  const bubbleY = illuY + illuH - 160;
  const bubbleW = illuW - 64;
  const bubbleH = 118;
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  roundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 22);
  ctx.fill();
  ctx.strokeStyle = "#93C5FD";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#1E3A8A";
  ctx.font = "700 24px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("À retenir", bubbleX + 24, bubbleY + 38);
  ctx.fillStyle = "#0F172A";
  ctx.font = "600 20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  wrapText(ctx, phrase || "Suivez calmement les étapes et validez vos mesures.", bubbleX + 24, bubbleY + 70, bubbleW - 48, 26);

  const bullets = scene.onScreen.slice(0, 3);
  for (let i = 0; i < bullets.length; i += 1) {
    const bx = cardX + 40 + i * ((cardW - 100) / 3);
    const bw = (cardW - 100) / 3;
    const by = cardY + cardH - 98;
    const bh = 48;
    ctx.fillStyle = "#F8FAFC";
    roundedRect(ctx, bx, by, bw, bh, 18);
    ctx.fill();
    ctx.fillStyle = "#2563EB";
    ctx.font = "700 20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(`${i + 1}`, bx + 18, by + 32);
    ctx.fillStyle = "#0F172A";
    ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    const text = bullets[i].replace(/^[-*•]\s*/, "").slice(0, 42);
    wrapText(ctx, text, bx + 44, by + 28, bw - 58, 22);
  }

  const barX = cardX + 40;
  const barY = cardY + cardH - 28;
  const barW = cardW - 80;
  const barH = 14;
  ctx.fillStyle = "rgba(15,23,42,0.1)";
  roundedRect(ctx, barX, barY, barW, barH, 999);
  ctx.fill();
  ctx.fillStyle = "#2563EB";
  roundedRect(ctx, barX, barY, Math.max(14, barW * progress), barH, 999);
  ctx.fill();

  ctx.fillStyle = "#0F172A";
  ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(`Scene ${scene.title} — ${(progress * 100).toFixed(0)}%`, barX, barY - 12);
}

export default function CoordinatorGuideVideoMaker({
  title,
  scenes,
}: {
  title: string;
  scenes: Scene[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("Clique sur Générer la vidéo pour démarrer.");

  const totalDuration = useMemo(
    () => scenes.reduce((s, sc) => s + (sc.durationSec || 0), 0),
    [scenes]
  );

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  function drawScene(ctx: CanvasRenderingContext2D, scene: Scene, progress: number) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Background
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0B1220");
    g.addColorStop(1, "#0B2A6F");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Main card
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    const pad = 48;
    const cardX = pad;
    const cardY = pad;
    const cardW = w - pad * 2;
    const cardH = h - pad * 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 28);
    ctx.fill();

    // Header
    ctx.fillStyle = "#0B2A6F";
    ctx.font = "700 44px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(title, cardX + 28, cardY + 68);

    ctx.fillStyle = "#111827";
    ctx.font = "800 38px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(scene.title, cardX + 28, cardY + 128);

    // Illustration area
    const illuX = cardX + 28;
    const illuY = cardY + 152;
    const illuW = cardW - 56;
    const illuH = cardH - 232;
    ctx.fillStyle = "#F8FAFC";
    roundedRect(ctx, illuX, illuY, illuW, illuH, 18);
    ctx.fill();
    ctx.strokeStyle = "#BFDBFE";
    ctx.lineWidth = 2;
    ctx.stroke();

    drawDoctor(ctx, illuX + 92, illuY + 84, 0.85);

    const type = detectSceneType(scene);
    if (type === "bp") {
      drawBpDevice(ctx, illuX + 180, illuY + 16, illuW - 210, illuH - 30, progress);
    } else if (type === "hr") {
      drawHrDevice(ctx, illuX + 170, illuY + 10, illuW - 200, illuH - 26, progress);
    } else if (type === "temp") {
      drawTempDevice(ctx, illuX + 210, illuY + 14, illuW - 240, illuH - 24, progress);
    } else if (type === "spo2") {
      drawSpo2Device(ctx, illuX + 180, illuY + 16, illuW - 210, illuH - 26, progress);
    } else {
      const cx = illuX + illuW * 0.66;
      const cy = illuY + illuH * 0.45;
      const pulse = 10 + Math.sin(progress * Math.PI * 2) * 6;
      ctx.fillStyle = "rgba(37,99,235,0.18)";
      ctx.beginPath();
      ctx.arc(cx, cy, 44 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2563EB";
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bubble with short phrase (less text, more drawing)
    const phrase = scene.voiceover
      .replace(/\s+/g, " ")
      .split(".")
      .slice(0, 2)
      .join(".")
      .trim();
    const bubbleX = illuX + 24;
    const bubbleY = illuY + illuH - 132;
    const bubbleW = Math.min(illuW - 48, 620);
    const bubbleH = 104;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    roundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 18);
    ctx.fill();
    ctx.strokeStyle = "#93C5FD";
    ctx.stroke();
    ctx.fillStyle = "#1E3A8A";
    ctx.font = "600 24px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    wrapText(
      ctx,
      phrase || "Suivez calmement les étapes et validez vos mesures.",
      bubbleX + 16,
      bubbleY + 34,
      bubbleW - 28,
      30
    );

    // Minimal on-screen cue cards
    const bullets = scene.onScreen.slice(0, 3);
    for (let i = 0; i < bullets.length; i++) {
      const bx = cardX + 28 + i * ((cardW - 56) / 3);
      const bw = (cardW - 70) / 3;
      const by = cardY + cardH - 104;
      const bh = 34;
      ctx.fillStyle = "#EFF6FF";
      roundedRect(ctx, bx, by, bw, bh, 10);
      ctx.fill();
      ctx.fillStyle = "#1D4ED8";
      ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      const text = bullets[i].replace(/^[-*•]\s*/, "").slice(0, 40);
      wrapText(ctx, text, bx + 10, by + 22, bw - 18, 20);
    }

    // Footer progress
    const barX = cardX + 28;
    const barY = cardY + cardH - 54;
    const barW = cardW - 56;
    const barH = 12;
    ctx.fillStyle = "rgba(15,23,42,0.12)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 999);
    ctx.fill();
    ctx.fillStyle = "#2563EB";
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(8, barW * progress), barH, 999);
    ctx.fill();
  }

  async function generateVideo() {
    try {
      setError("");
      setStatusMessage("Génération de la vidéo en cours...");
      setIsRendering(true);
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas introuvable.");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossible d’accéder au canvas.");

      if (typeof window === "undefined" || !("MediaRecorder" in window) || !canvas.captureStream) {
        throw new Error(
          "La génération vidéo n’est pas supportée par ce navigateur. Utilisez Chrome ou Edge sur un ordinateur de bureau."
        );
      }

      // Setup canvas size (HD)
      canvas.width = 1280;
      canvas.height = 720;

      const stream = canvas.captureStream(30);
      const mimeCandidates = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m));
      if (!mimeType) {
        throw new Error(
          "Aucun format WebM n’est supporté par ce navigateur. Essayez Chrome ou Edge."
        );
      }

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = (event) => {
        setError("Erreur d’enregistrement vidéo : " + String(event.error?.message ?? event.error ?? "Erreur inconnue"));
      };

      const stopped = new Promise<void>((resolve, reject) => {
        recorder.onstop = () => resolve();
        recorder.onerror = () => reject(new Error("L’enregistrement a échoué."));
      });

      recorder.start(250);
      setIsRecording(true);

      // Render timeline
      for (let s = 0; s < scenes.length; s++) {
        const scene = scenes[s];
        const duration = Math.max(6, Number(scene.durationSec || 12));
        const frames = duration * 30;
        for (let f = 0; f < frames; f++) {
          const progress = f / frames;
          drawScene(ctx, scene, progress);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 1000 / 30));
        }
      }

      recorder.stop();
      await stopped;

      setIsRecording(false);
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatusMessage("Vidéo générée avec succès. Vous pouvez la lire ou la télécharger.");
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setStatusMessage("Échec de la génération. Vérifiez le message d’erreur ci-dessous.");
      setIsRecording(false);
    } finally {
      setIsRendering(false);
    }
  }

  function stopRecording() {
    try {
      recorderRef.current?.stop();
    } catch {}
  }

  return (
    <div className="not-prose mt-6 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-gray-950 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
            <Film className="size-5 text-blue-600" />
            Générer une vidéo (WebM) du guide
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Vidéo animée (slides) générée automatiquement, utile pour guider le patient.
            Durée approx: {Math.max(1, totalDuration)}s.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={generateVideo}
            disabled={isRendering}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isRendering ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            Générer la vidéo
          </button>
          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <Square className="size-4" />
              Stop
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        {statusMessage}
      </p>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-black">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          {videoUrl ? (
            <>
              <video src={videoUrl} controls className="w-full rounded-lg" />
              <a
                href={videoUrl}
                download="medifollow-guide.webm"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-950/50"
              >
                <Download className="size-4" />
                Télécharger la vidéo (WebM)
              </a>
              <p className="mt-2 text-xs text-gray-500">
                Astuce: WebM se lit dans Chrome/Edge. Pour MP4, conversion possible avec un outil externe.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clique sur <strong>Générer la vidéo</strong> pour produire une vidéo animée à partir des scènes du guide.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


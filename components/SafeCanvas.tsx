"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";

function hasWebGLSupport() {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function WebGLFallback() {
  return (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-8 text-center">
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          3D view unavailable
        </p>
        <p className="mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Your browser or graphics driver could not start WebGL. The rest of
          the page is still available.
        </p>
      </div>
    </div>
  );
}

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("WebGL canvas failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return <WebGLFallback />;
    }

    return this.props.children;
  }
}

export default function SafeCanvas({
  children,
  ...props
}: React.ComponentProps<typeof Canvas>) {
  const [supported, setSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setSupported(hasWebGLSupport());
  }, []);

  if (supported === null) {
    return (
      <div className="flex h-full min-h-[320px] w-full items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (!supported) {
    return <WebGLFallback />;
  }

  return (
    <CanvasErrorBoundary>
      <Canvas {...props}>{children}</Canvas>
    </CanvasErrorBoundary>
  );
}

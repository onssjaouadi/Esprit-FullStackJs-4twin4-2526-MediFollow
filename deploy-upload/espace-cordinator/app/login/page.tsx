"use client";

import {
  Heart,
  Mail,
  Lock,
  AlertCircle,
  Activity,
  Sparkles,
  Shield,
  TrendingUp,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Users,
  Clock,
  Star,
  ScanFace,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { login } from "@/lib/actions/auth.actions";
import FaceLoginModal from "@/components/FaceLoginModal";

export default function LoginPage() {
  const router = useRouter();
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(formData);

      if (result.success && result.user) {
        // Redirect based on role
        const role = result.user.role;
        if (role === "PATIENT") {
          router.push("/dashboard/patient");
        } else if (role === "DOCTOR") {
          router.push("/dashboard/doctor");
        } else if (role === "COORDINATOR") {
          router.push("/dashboard/coordinator");
        } else if (role === "ADMIN") {
          router.push("/admin");
        }
      } else {
        setError(result.error || "Erreur de connexion");
      }
    } catch (err: any) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding & Features */}
        <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 text-white">
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -top-40 -right-40 size-96 rounded-full bg-white blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-white blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-purple-300 blur-3xl animate-pulse"></div>
          </div>

          {/* Floating badges */}
          <div className="absolute top-20 right-20 animate-bounce">
            <div className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-bold">
              ⚡ Connexion rapide
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-between w-full">
            {/* Logo */}
            <Link
              href="/"
              className="group inline-flex items-center space-x-3 transition-all duration-300 hover:scale-105 w-fit"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 blur-lg transition-opacity group-hover:opacity-30"></div>
                <div className="relative flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm p-2.5 shadow-2xl">
                  <Activity className="size-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black leading-none text-white">
                  MediFollow
                </span>
                <span className="text-xs font-semibold text-blue-100 tracking-wider uppercase">
                  Santé Digitale
                </span>
              </div>
            </Link>

            {/* Features */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-4xl font-black leading-tight">
                  Votre santé,
                  <br />
                  notre priorité
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Accédez à votre espace personnel pour un suivi médical
                  post-hospitalisation efficace et sécurisé.
                </p>
              </div>

              <div className="space-y-4">
                <div className="group flex items-start space-x-4 rounded-2xl bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:rotate-12 group-hover:scale-110">
                    <Shield className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white flex items-center space-x-2">
                      <span>Sécurité maximale</span>
                      <span className="rounded-full bg-green-400 px-2 py-0.5 text-[10px] font-black text-green-900">
                        ✓ Certifié
                      </span>
                    </h3>
                    <p className="text-sm text-blue-100">
                      Vos données sont protégées par blockchain et chiffrement
                      AES-256
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 rounded-2xl bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:rotate-12 group-hover:scale-110">
                    <TrendingUp className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white flex items-center space-x-2">
                      <span>Suivi en temps réel</span>
                      <Zap className="size-4 text-yellow-300 animate-pulse" />
                    </h3>
                    <p className="text-sm text-blue-100">
                      Surveillance continue de vos signes vitaux 24h/24 et 7j/7
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 rounded-2xl bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:rotate-12 group-hover:scale-110">
                    <CheckCircle2 className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white">
                      Interface intuitive
                    </h3>
                    <p className="text-sm text-blue-100">
                      Simple à utiliser, accessible partout depuis tous vos
                      appareils
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="group text-center transition-transform hover:scale-110 cursor-pointer">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-xl bg-white opacity-0 blur-xl transition-opacity group-hover:opacity-20"></div>
                  <div className="relative mb-2 text-4xl font-black">5k+</div>
                </div>
                <div className="flex items-center justify-center space-x-1 text-sm text-blue-100">
                  <Users className="size-4" />
                  <span>Patients</span>
                </div>
              </div>
              <div className="group text-center transition-transform hover:scale-110 cursor-pointer">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-xl bg-white opacity-0 blur-xl transition-opacity group-hover:opacity-20"></div>
                  <div className="relative mb-2 text-4xl font-black">24/7</div>
                </div>
                <div className="flex items-center justify-center space-x-1 text-sm text-blue-100">
                  <Clock className="size-4" />
                  <span>Support</span>
                </div>
              </div>
              <div className="group text-center transition-transform hover:scale-110 cursor-pointer">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-xl bg-white opacity-0 blur-xl transition-opacity group-hover:opacity-20"></div>
                  <div className="relative mb-2 text-4xl font-black">100%</div>
                </div>
                <div className="flex items-center justify-center space-x-1 text-sm text-blue-100">
                  <Star className="size-4 fill-current" />
                  <span>Sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="group mb-8 inline-flex items-center space-x-3 transition-all duration-300 hover:scale-105 lg:hidden"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
                <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-2 shadow-lg">
                  <Activity className="size-7 text-white animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black leading-none bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                  MediFollow
                </span>
                <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">
                  Santé Digitale
                </span>
              </div>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-1.5 text-xs font-bold text-blue-700">
                <Sparkles className="size-3" />
                <span>Connexion sécurisée</span>
              </div>
              <h1 className="mb-2 text-4xl font-black text-gray-900">
                Bienvenue !
              </h1>
              <p className="text-lg text-gray-600">
                Connectez-vous pour accéder à votre espace
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 animate-fade-in">
                <div className="flex items-start space-x-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="size-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-800">
                      Erreur de connexion
                    </p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-12 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    className="size-4 rounded border-gray-300 text-blue-600 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-4 font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </button>
            </form>

            {/* Face Login Divider */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">ou</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Face Recognition Login Button */}
            <button
              type="button"
              onClick={() => setShowFaceModal(true)}
              className="mt-3 group relative w-full overflow-hidden rounded-xl border-2 border-blue-200 bg-white px-6 py-3.5 font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md flex items-center justify-center gap-2.5"
            >
              <ScanFace className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span>Se connecter avec la reconnaissance faciale</span>
            </button>

            {/* Demo Accounts */}
            <div className="mt-6 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-5 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="size-5 text-blue-600 animate-pulse" />
                  <p className="font-bold text-gray-900">
                    Comptes de démonstration
                  </p>
                </div>
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black text-white">
                  DEMO
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="group flex items-center justify-between rounded-lg bg-white/80 p-3 text-sm shadow-sm transition-all hover:shadow-md hover:scale-105">
                  <div className="flex items-center space-x-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-xl shadow-sm">
                      👤
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Patient</p>
                      <p className="text-xs text-gray-600">
                        patient@medifollow.health
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-500">
                      Patient@123456
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard("Patient@123456", "patient")
                      }
                      className="rounded-md bg-blue-100 p-1.5 text-blue-600 transition-all hover:bg-blue-600 hover:text-white hover:scale-110"
                    >
                      {copiedField === "patient" ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="group flex items-center justify-between rounded-lg bg-white/80 p-3 text-sm shadow-sm transition-all hover:shadow-md hover:scale-105">
                  <div className="flex items-center space-x-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-200 text-xl shadow-sm">
                      👨‍⚕️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Médecin</p>
                      <p className="text-xs text-gray-600">
                        doctor@medifollow.health
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-500">
                      Doctor@123456
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("Doctor@123456", "doctor")}
                      className="rounded-md bg-green-100 p-1.5 text-green-600 transition-all hover:bg-green-600 hover:text-white hover:scale-110"
                    >
                      {copiedField === "doctor" ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="group flex items-center justify-between rounded-lg bg-white/80 p-3 text-sm shadow-sm transition-all hover:shadow-md hover:scale-105">
                  <div className="flex items-center space-x-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-xl shadow-sm">
                      🔧
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Admin</p>
                      <p className="text-xs text-gray-600">
                        admin@medifollow.health
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-500">
                      Admin@123456
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("Admin@123456", "admin")}
                      className="rounded-md bg-purple-100 p-1.5 text-purple-600 transition-all hover:bg-purple-600 hover:text-white hover:scale-110"
                    >
                      {copiedField === "admin" ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-blue-100/50 p-2 text-center">
                <p className="text-xs text-blue-700">
                  💡 Cliquez sur <Copy className="inline size-3" /> pour copier
                  le mot de passe
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-8 flex items-center space-x-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Nouveau ?
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="group inline-flex items-center space-x-1 font-bold text-blue-600 transition-colors hover:text-blue-700"
                >
                  <span>Inscrivez-vous gratuitement</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Face Login Modal */}
      <FaceLoginModal
        open={showFaceModal}
        onClose={() => setShowFaceModal(false)}
      />
    </div>
  );
}

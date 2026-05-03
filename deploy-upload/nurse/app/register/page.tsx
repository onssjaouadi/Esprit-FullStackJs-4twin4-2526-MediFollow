"use client";

import {
  Heart,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Activity,
  Sparkles,
  Shield,
  TrendingUp,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  Users,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { register } from "@/lib/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await register(formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Erreur lors de l'inscription");
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
              🎉 Inscription gratuite
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
                  Rejoignez-nous
                  <br />
                  dès aujourd'hui
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Créez votre compte gratuitement et commencez votre suivi
                  médical post-hospitalisation en quelques minutes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="group flex items-start space-x-4 rounded-2xl bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:rotate-12 group-hover:scale-110">
                    <CheckCircle2 className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white flex items-center space-x-2">
                      <span>Inscription rapide</span>
                      <Zap className="size-4 text-yellow-300 animate-pulse" />
                    </h3>
                    <p className="text-sm text-blue-100">
                      Quelques minutes suffisent pour créer votre compte
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 rounded-2xl bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:rotate-12 group-hover:scale-110">
                    <Shield className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white flex items-center space-x-2">
                      <span>100% Gratuit</span>
                      <span className="rounded-full bg-green-400 px-2 py-0.5 text-[10px] font-black text-green-900">
                        ✓ 0€
                      </span>
                    </h3>
                    <p className="text-sm text-blue-100">
                      Aucun frais caché, service entièrement gratuit
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 rounded-2xl bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:rotate-12 group-hover:scale-110">
                    <TrendingUp className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white">
                      Accès immédiat
                    </h3>
                    <p className="text-sm text-blue-100">
                      Commencez à utiliser MediFollow dès maintenant
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

        {/* Right Side - Register Form */}
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
                <span>Inscription gratuite</span>
              </div>
              <h1 className="mb-2 text-4xl font-black text-gray-900">
                Créer un compte
              </h1>
              <p className="text-lg text-gray-600">
                Rejoignez MediFollow en quelques minutes
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
                    <p className="font-semibold text-red-800">Erreur</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-6 animate-fade-in">
                <div className="flex items-start space-x-3 rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="size-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">
                      Compte créé avec succès !
                    </p>
                    <p className="text-sm text-green-700">
                      Redirection vers la page de connexion...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name & Last Name - Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                      placeholder="Jean"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Nom
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="jean.dupont@email.com"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Téléphone{" "}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Phone className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    placeholder="+212 6 12 34 56 78"
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
                    autoComplete="new-password"
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
                <p className="mt-1 text-xs text-gray-500">
                  Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1
                  caractère spécial
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-12 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 size-4 rounded border-gray-300 text-blue-600 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  J&apos;accepte les{" "}
                  <Link
                    href="/terms"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    conditions d&apos;utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-4 font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Création en cours...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="size-5" />
                      <span>Compte créé ✓</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center space-x-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Déjà membre ?
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="group inline-flex items-center space-x-1 font-bold text-blue-600 transition-colors hover:text-blue-700"
                >
                  <span>Connectez-vous</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

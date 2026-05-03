"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Lock,
  ArrowRight,
  Shield,
  Zap,
  Activity,
} from "lucide-react";
import { changePasswordFirstLogin } from "@/lib/actions/auth.actions";

const criteria = [
  { key: "length", label: "8+ caractères", emoji: "📏" },
  { key: "uppercase", label: "Majuscule (A-Z)", emoji: "🔤" },
  { key: "lowercase", label: "Minuscule (a-z)", emoji: "🔡" },
  { key: "number", label: "Chiffre (0-9)", emoji: "🔢" },
  { key: "special", label: "Caractère spécial", emoji: "⚡" },
];

export default function ChangePasswordPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // Get userId from sessionStorage
    const id = sessionStorage.getItem("userIdForPasswordChange");
    if (!id) {
      router.push("/login");
      return;
    }
    setUserId(id);
  }, [router]);

  useEffect(() => {
    // Check password strength
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordStrength).every((v) => v);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!userId) {
      setError("Erreur: ID utilisateur introuvable");
      setIsLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Le mot de passe ne respecte pas la sécurité requise");
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePasswordFirstLogin(userId, password);

      if (result.success) {
        setSuccess(result.message || "Mot de passe changé avec succès");
        sessionStorage.removeItem("userIdForPasswordChange");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Erreur lors du changement de mot de passe");
      }
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-violet-100 dark:bg-violet-500/20 mb-4 animate-pulse">
            <Activity className="size-8 text-violet-600 dark:text-violet-400 animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100 dark:bg-violet-500/10 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 dark:bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
            {/* Left Panel - Desktop Only */}
            <div className="md:col-span-2 hidden md:flex flex-col justify-center space-y-8 pr-4">
              <div className="inline-flex items-center justify-center size-24 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-2xl">
                <Lock className="size-12 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-black leading-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Sécurisez votre accès
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Créez un mot de passe fort pour protéger vos données
                  médicales.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: "🔐",
                    title: "Chiffrement AES-256",
                    desc: "Vos données sécurisées",
                  },
                  {
                    icon: "🛡️",
                    title: "Authentification avancée",
                    desc: "Normes internationales",
                  },
                  {
                    icon: "⚡",
                    title: "Protection 24/7",
                    desc: "Surveillance active",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="flex-shrink-0 size-6 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mt-1 text-base group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Form Card */}
            <div className="md:col-span-3">
              <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 md:px-8 py-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Lock className="size-5" />
                    </div>
                    <h1 className="text-2xl font-bold">
                      Changement de mot de passe
                    </h1>
                  </div>
                  <p className="text-violet-100 text-sm ml-13 leading-relaxed">
                    Sécurisez votre compte dès votre première utilisation
                  </p>
                </div>

                {/* Form Container */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 animate-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Success Alert */}
                  {success && (
                    <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 p-4 animate-in slide-in-from-top-2 duration-300">
                      <CheckCircle className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        {success} ✨
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-xs font-bold text-violet-600 dark:text-violet-400">
                          1
                        </span>
                        Nouveau mot de passe
                      </label>
                      <div className="relative group">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Entrez un mot de passe sécurisé..."
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                          title={showPassword ? "Masquer" : "Afficher"}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-xs font-bold text-violet-600 dark:text-violet-400">
                          2
                        </span>
                        Confirmer le mot de passe
                      </label>
                      <div className="relative group">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmez votre mot de passe..."
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                          title={showConfirmPassword ? "Masquer" : "Afficher"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Bar */}
                    {password && (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Force du mot de passe
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              strengthScore === 5
                                ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                                : strengthScore >= 3
                                  ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                  : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {strengthScore === 5
                              ? "🟢 Excellent"
                              : strengthScore >= 3
                                ? "🟡 Bon"
                                : "🔴 Faible"}
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              strengthScore === 5
                                ? "w-full bg-gradient-to-r from-green-500 to-emerald-500"
                                : strengthScore >= 3
                                  ? "w-3/4 bg-gradient-to-r from-yellow-500 to-amber-500"
                                  : "w-1/2 bg-gradient-to-r from-red-500 to-orange-500"
                            }`}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Password Criteria Grid */}
                    {password && (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                          Critères à remplir
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {criteria.map((crit) => {
                            const isValid =
                              passwordStrength[
                                crit.key as keyof typeof passwordStrength
                              ];
                            return (
                              <div
                                key={crit.key}
                                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                  isValid
                                    ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30"
                                    : "bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600"
                                }`}
                              >
                                <div
                                  className={`inline-flex items-center justify-center size-5 rounded-full text-xs font-bold ${
                                    isValid
                                      ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                                      : "bg-gray-200 dark:bg-gray-600 text-gray-400"
                                  }`}
                                >
                                  {isValid ? "✓" : "○"}
                                </div>
                                <span
                                  className={`text-xs font-medium flex-1 ${
                                    isValid
                                      ? "text-green-700 dark:text-green-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {crit.label}
                                </span>
                                <span className="text-sm">{crit.emoji}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Match Check */}
                    {password && confirmPassword && (
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all animate-in slide-in-from-bottom-2 duration-300 ${
                          passwordsMatch
                            ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30"
                            : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"
                        }`}
                      >
                        <div
                          className={`inline-flex items-center justify-center size-5 rounded-full font-bold ${
                            passwordsMatch
                              ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {passwordsMatch ? "✓" : "✕"}
                        </div>
                        <span
                          className={`text-sm font-medium flex-1 ${
                            passwordsMatch
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {passwordsMatch
                            ? "Les mots de passe correspondent ✨"
                            : "Les mots de passe ne correspondent pas"}
                        </span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={
                        !isPasswordValid || !passwordsMatch || isLoading
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      {isLoading ? (
                        <>
                          <Activity className="size-5 animate-spin" />
                          <span>Changement en cours...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="size-5" />
                          <span>Sécuriser mon compte</span>
                          <ArrowRight className="size-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Footer Stats */}
                <div className="grid grid-cols-3 gap-3 px-6 md:px-8 py-4 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-900/30 dark:to-gray-900/30">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                      Sécurisé
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                      Rapide
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">✓</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                      Protégé
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-from-top {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-from-bottom {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
        .slide-in-from-bottom-2 {
          animation: slide-in-from-bottom 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

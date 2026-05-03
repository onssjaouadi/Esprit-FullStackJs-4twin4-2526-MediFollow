"use client";

import {
  Heart,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import {
  verifyResetToken,
  resetPassword,
} from "@/lib/actions/password-reset.actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    firstName: string;
    email: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Token manquant");
        setIsVerifying(false);
        return;
      }

      try {
        const result = await verifyResetToken(token);

        if (result.success && result.user) {
          setTokenValid(true);
          setUserInfo({
            firstName: result.user.firstName,
            email: result.user.email,
          });
        } else {
          setError(result.error || "Token invalide");
        }
      } catch (err: any) {
        setError("Erreur lors de la vérification du token");
      } finally {
        setIsVerifying(false);
      }
    }

    verify();
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    try {
      const result = await resetPassword(formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2)
      return { strength, label: "Faible", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Moyen", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Bon", color: "bg-blue-500" };
    return { strength, label: "Excellent", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center space-x-2">
            <Heart className="size-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">MediFollow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-gray-600">
            {userInfo
              ? `Bonjour ${userInfo.firstName}, créez votre nouveau mot de passe`
              : "Créez un nouveau mot de passe sécurisé"}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          {isVerifying ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 size-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-gray-600">Vérification du lien...</p>
            </div>
          ) : !tokenValid ? (
            // Invalid Token
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="size-8 text-red-600" />
              </div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                Lien invalide ou expiré
              </h2>
              <p className="mb-6 text-gray-600">
                {error ||
                  "Ce lien de réinitialisation est invalide ou a expiré. Les liens expirent après 1 heure pour des raisons de sécurité."}
              </p>
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="block rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Demander un nouveau lien
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ArrowLeft size={20} />
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : success ? (
            // Success Message
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="size-8 text-green-600" />
              </div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                Mot de passe réinitialisé !
              </h2>
              <p className="mb-6 text-gray-600">
                Votre mot de passe a été modifié avec succès. Vous allez être
                redirigé vers la page de connexion...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                Redirection en cours...
              </div>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* User Info */}
              {userInfo && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    Réinitialisation pour :{" "}
                    <strong className="text-gray-900">{userInfo.email}</strong>
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          Force du mot de passe
                        </span>
                        <span
                          className={`font-semibold ${
                            passwordStrength.strength <= 2
                              ? "text-red-600"
                              : passwordStrength.strength <= 3
                                ? "text-yellow-600"
                                : passwordStrength.strength <= 4
                                  ? "text-blue-600"
                                  : "text-green-600"
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.strength / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    <li
                      className={password.length >= 8 ? "text-green-600" : ""}
                    >
                      {password.length >= 8 ? "✓" : "•"} Au moins 8 caractères
                    </li>
                    <li
                      className={/[A-Z]/.test(password) ? "text-green-600" : ""}
                    >
                      {/[A-Z]/.test(password) ? "✓" : "•"} Une lettre majuscule
                    </li>
                    <li
                      className={/[a-z]/.test(password) ? "text-green-600" : ""}
                    >
                      {/[a-z]/.test(password) ? "✓" : "•"} Une lettre minuscule
                    </li>
                    <li
                      className={/[0-9]/.test(password) ? "text-green-600" : ""}
                    >
                      {/[0-9]/.test(password) ? "✓" : "•"} Un chiffre
                    </li>
                    <li
                      className={
                        /[@$!%*?&]/.test(password) ? "text-green-600" : ""
                      }
                    >
                      {/[@$!%*?&]/.test(password) ? "✓" : "•"} Un caractère
                      spécial (@$!%*?&)
                    </li>
                  </ul>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title={showConfirmPassword ? "Masquer" : "Afficher"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || password !== confirmPassword}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? "Réinitialisation..."
                    : "Réinitialiser le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to Login */}
        {!isVerifying && !success && tokenValid && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Heart, Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { requestPasswordReset } from "@/lib/actions/password-reset.actions";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await requestPasswordReset(formData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

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
            Mot de passe oublié ?
          </h1>
          <p className="mt-2 text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          {success ? (
            // Success Message
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="size-8 text-green-600" />
              </div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                Email envoyé !
              </h2>
              <p className="mb-6 text-gray-600">
                Si un compte existe avec l&apos;adresse{" "}
                <strong className="text-gray-900">{email}</strong>, vous
                recevrez un email avec les instructions pour réinitialiser votre
                mot de passe.
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Conseil :</strong> Vérifiez votre dossier spam si
                    vous ne recevez pas l&apos;email dans les prochaines
                    minutes.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ArrowLeft size={20} />
                  Retour à la connexion
                </Link>
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Nous vous enverrons un lien sécurisé pour réinitialiser
                    votre mot de passe
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? "Envoi en cours..."
                    : "Envoyer le lien de réinitialisation"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">ou</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Back to Login */}
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft size={20} />
                Retour à la connexion
              </Link>
            </>
          )}
        </div>

        {/* Help Text */}
        {!success && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Besoin d&apos;aide ?
            </p>
            <p className="text-xs text-gray-600">
              Si vous rencontrez des difficultés pour vous connecter, contactez
              votre administrateur ou le support technique.
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

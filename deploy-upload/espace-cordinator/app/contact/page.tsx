"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Activity,
  Star,
  Zap,
  Sparkles,
  Menu,
  X,
  Heart,
  Users,
  Shield,
  Lock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Show scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 20);
    });
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'envoi du message");
      }

      // Success
      setIsSubmitted(true);

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }, 5000);
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Enhanced (same as homepage) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/98 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
            : "bg-white/95 backdrop-blur-md border-b border-gray-100"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-3.5">
          {/* Logo - Enhanced */}
          <Link
            href="/"
            className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
              <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-2 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/50">
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

          {/* Desktop Navigation - Enhanced */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-blue-600"
            >
              <span className="relative z-10">Accueil</span>
              <span className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-all duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:left-2 group-hover:w-[calc(100%-1rem)]"></span>
            </Link>
            <Link
              href="/#features"
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-blue-600"
            >
              <span className="relative z-10">Fonctionnalités</span>
              <span className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-all duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:left-2 group-hover:w-[calc(100%-1rem)]"></span>
            </Link>
            <Link
              href="/#testimonials"
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-blue-600"
            >
              <span className="relative z-10">Témoignages</span>
              <span className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-all duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:left-2 group-hover:w-[calc(100%-1rem)]"></span>
            </Link>
            <Link
              href="/contact"
              className="group relative px-4 py-2 text-sm font-semibold text-blue-600 transition-all duration-300"
            >
              <span className="relative z-10">Contact</span>
              <span className="absolute inset-0 rounded-lg bg-blue-50 opacity-100"></span>
              <span className="absolute bottom-0 left-2 h-0.5 w-[calc(100%-1rem)] bg-gradient-to-r from-blue-600 to-purple-600"></span>
            </Link>

            {/* Separator */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2"></div>

            {/* Call to Action Badge */}
            <div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 border border-green-200/50">
              <div className="size-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-xs font-bold text-green-700">
                Support 24/7
              </span>
            </div>
          </nav>

          {/* Desktop Auth Buttons - Enhanced */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/login"
              className="group relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-blue-600"
            >
              <span className="relative z-10">Connexion</span>
              <span className="absolute inset-0 rounded-xl bg-gray-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </Link>
            <Link
              href="/register"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Inscription</span>
                <Sparkles className="size-4" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <div className="absolute -top-12 -right-12 size-32 rounded-full bg-white/20 blur-2xl transition-all duration-500 group-hover:scale-150"></div>
            </Link>
          </div>

          {/* Mobile Menu Button - Enhanced */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
            aria-label="Menu"
          >
            <div className="relative size-6">
              {mobileMenuOpen ? (
                <X className="size-6 text-gray-700 transition-transform duration-300 group-hover:rotate-90" />
              ) : (
                <Menu className="size-6 text-gray-700 transition-transform duration-300 group-hover:scale-110" />
              )}
            </div>
            {!mobileMenuOpen && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-blue-600 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Mobile Menu - Enhanced */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/98 backdrop-blur-xl shadow-2xl animate-fade-in">
            <nav className="container mx-auto px-6 py-6 flex flex-col space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 font-semibold transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <Activity className="size-4" />
                </div>
                <span>Accueil</span>
              </Link>
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 font-semibold transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                  <Zap className="size-4" />
                </div>
                <span>Fonctionnalités</span>
              </Link>
              <Link
                href="/#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 font-semibold transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <Star className="size-4" />
                </div>
                <span>Témoignages</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center space-x-3 rounded-xl px-4 py-3 bg-blue-50 text-blue-600 font-semibold"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <MessageSquare className="size-4" />
                </div>
                <span>Contact</span>
              </Link>

              <div className="pt-4 mt-4 border-t border-gray-200 flex flex-col space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-xl px-6 py-3.5 text-gray-700 font-bold border-2 border-gray-200 transition-all hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group relative text-center rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-3.5 text-white font-bold shadow-xl shadow-blue-500/30 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Inscription gratuite</span>
                    <Sparkles className="size-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[72px]"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 size-80 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-6 text-center">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-5 py-2 text-white backdrop-blur-sm">
            <MessageSquare className="size-5" />
            <span className="text-sm font-semibold">Contactez-nous</span>
          </div>

          <h1 className="mb-6 text-5xl font-black text-white md:text-6xl lg:text-7xl">
            Nous sommes là pour vous
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-blue-100">
            Une question ? Un besoin d&apos;accompagnement ? Notre équipe est à
            votre écoute 7j/7 pour vous aider.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Informations de contact */}
            <div className="space-y-8 lg:col-span-1">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900">
                  Informations de contact
                </h2>
                <p className="text-gray-600">
                  Choisissez le moyen de communication qui vous convient le
                  mieux.
                </p>
              </div>

              {/* Carte Email */}
              <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30">
                  <Mail className="size-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Email</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Envoyez-nous un email
                </p>
                <a
                  href="mailto:contact@medifollow.com"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  contact@medifollow.com
                </a>
              </div>

              {/* Carte Téléphone */}
              <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-500/30">
                  <Phone className="size-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Téléphone
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  Appelez-nous directement
                </p>
                <a
                  href="tel:+33123456789"
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  +33 1 23 45 67 89
                </a>
              </div>

              {/* Carte Adresse */}
              <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30">
                  <MapPin className="size-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Adresse
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  Visitez nos bureaux
                </p>
                <p className="font-semibold text-gray-700">
                  ESPRIT
                  <br />
                  68 Avenue de la Technologie
                  <br />
                  Aryanah, Ariana 2088, Tunisie
                </p>
              </div>

              {/* Horaires */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 p-6 text-white shadow-xl">
                <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Clock className="size-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold">
                  Horaires d&apos;ouverture
                </h3>
                <div className="space-y-2 text-sm text-blue-100">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="font-semibold text-white">
                      8h00 - 20h00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi - Dimanche</span>
                    <span className="font-semibold text-white">
                      9h00 - 18h00
                    </span>
                  </div>
                  <div className="mt-4 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-xs text-white">
                      ⚡ Support d&apos;urgence disponible 24h/24
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl md:p-12">
                <div className="mb-8">
                  <h2 className="mb-3 text-3xl font-bold text-gray-900">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-gray-600">
                    Remplissez le formulaire ci-dessous et nous vous répondrons
                    dans les plus brefs délais.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="size-10 text-green-600" />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">
                      Message envoyé !
                    </h3>
                    <p className="text-gray-600">
                      Merci pour votre message. Nous vous répondrons dans les 24
                      heures.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                      Un email de confirmation vous a été envoyé.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Error Message */}
                    {error && (
                      <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 animate-fade-in">
                        <div className="flex items-start space-x-3">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <span className="text-sm font-bold text-red-600">
                              !
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-red-800">
                              Erreur lors de l&apos;envoi
                            </p>
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Nom */}
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Nom complet *
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <User className="size-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Jean Dupont"
                          />
                        </div>
                      </div>

                      {/* Email et Téléphone */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                          >
                            Email *
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                              <Mail className="size-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="jean@example.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                          >
                            Téléphone
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                              <Phone className="size-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="+33 6 12 34 56 78"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sujet */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Sujet *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-gray-300 py-4 px-4 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">Sélectionnez un sujet</option>
                          <option value="information">
                            Demande d&apos;information
                          </option>
                          <option value="support">Support technique</option>
                          <option value="partenariat">Partenariat</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor="message"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full rounded-xl border border-gray-300 py-4 px-4 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Décrivez votre demande en détail..."
                        />
                      </div>

                      {/* Bouton Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>Envoyer le message</span>
                            <Send className="size-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>

                      <p className="text-center text-sm text-gray-500">
                        * Champs obligatoires
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Carte Google Maps */}
          <div className="mt-12">
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-3xl font-bold text-gray-900">
                Où nous trouver ?
              </h2>
              <p className="text-gray-600">
                Localisez facilement nos bureaux sur la carte
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.5846!2d10.189567!3d36.898974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12e2cb7979c896d9%3A0x8e7eade79d30f1e3!2sESPRIT%20School%20of%20Engineering!5e0!3m2!1sfr!2stn!4v1709686841234!5m2!1sfr!2stn"
                width="100%"
                height="450"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation ESPRIT"
                className="border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced (same as homepage) */}
      <footer className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        {/* Newsletter Section */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <Mail className="size-5 text-white" />
                <span className="text-sm font-semibold text-white">
                  Restez informé
                </span>
              </div>
              <h2 className="mb-4 text-4xl font-extrabold text-white">
                Abonnez-vous à notre newsletter
              </h2>
              <p className="mb-8 text-lg text-blue-100 leading-relaxed">
                Recevez nos dernières actualités, conseils santé et mises à jour
                directement dans votre boîte mail
              </p>
              <form className="mx-auto flex max-w-xl flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-4 text-white placeholder:text-blue-200 backdrop-blur-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center space-x-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1"
                >
                  <span>S'abonner</span>
                  <TrendingUp className="size-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
              <p className="mt-4 text-sm text-blue-100">
                ✓ Gratuit • ✓ Sans spam • ✓ Désabonnement facile
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <Link
                  href="/"
                  className="group mb-6 inline-flex items-center space-x-3 transition-all duration-300 hover:scale-105"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
                    <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-2 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/50">
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
                <p className="mb-6 text-gray-600 leading-relaxed">
                  Votre partenaire de confiance pour le suivi
                  post-hospitalisation et le maintien d&apos;une santé optimale.
                </p>
                <div className="flex space-x-3">
                  <a
                    href="tel:+33123456789"
                    aria-label="Téléphone"
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3.5 text-gray-600 transition-all duration-300 hover:from-green-500 hover:to-green-600 hover:text-white hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-1"
                  >
                    <Phone className="relative z-10 size-5" />
                  </a>
                  <a
                    href="mailto:contact@medifollow.com"
                    aria-label="Email"
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3.5 text-gray-600 transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
                  >
                    <Mail className="relative z-10 size-5" />
                  </a>
                  <a
                    href="/contact"
                    aria-label="Localisation"
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3.5 text-gray-600 transition-all duration-300 hover:from-purple-500 hover:to-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1"
                  >
                    <MapPin className="relative z-10 size-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="mb-6 text-lg font-bold text-gray-900">
                  Accès rapide
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>
                    <Link
                      href="/login"
                      className="group flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-blue-50 hover:translate-x-2"
                    >
                      <span className="flex size-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
                        →
                      </span>
                      <span className="font-medium transition-colors group-hover:text-blue-600">
                        Connexion
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="group flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-blue-50 hover:translate-x-2"
                    >
                      <span className="flex size-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
                        →
                      </span>
                      <span className="font-medium transition-colors group-hover:text-blue-600">
                        Inscription
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/forgot-password"
                      className="group flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-blue-50 hover:translate-x-2"
                    >
                      <span className="flex size-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
                        →
                      </span>
                      <span className="font-medium transition-colors group-hover:text-blue-600">
                        Mot de passe oublié
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For Users */}
              <div>
                <h3 className="mb-6 text-lg font-bold text-gray-900">
                  Utilisateurs
                </h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="group flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-110">
                      <Users className="size-5" />
                    </div>
                    <span className="font-medium transition-colors group-hover:text-blue-600">
                      Patients
                    </span>
                  </li>
                  <li className="group flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-600 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/30 group-hover:scale-110">
                      <Activity className="size-5" />
                    </div>
                    <span className="font-medium transition-colors group-hover:text-green-600">
                      Médecins
                    </span>
                  </li>
                  <li className="group flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-110">
                      <Shield className="size-5" />
                    </div>
                    <span className="font-medium transition-colors group-hover:text-purple-600">
                      Administrateurs
                    </span>
                  </li>
                </ul>
              </div>

              {/* Security */}
              <div>
                <h3 className="mb-6 text-lg font-bold text-gray-900">
                  Sécurité & Conformité
                </h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="group flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-500/30 group-hover:scale-110">
                      <Lock className="size-5" />
                    </div>
                    <span className="font-medium transition-colors group-hover:text-yellow-600">
                      Chiffrement AES-256
                    </span>
                  </li>
                  <li className="group flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-600 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/30 group-hover:scale-110">
                      <Shield className="size-5" />
                    </div>
                    <span className="font-medium transition-colors group-hover:text-green-600">
                      Conforme RGPD
                    </span>
                  </li>
                  <li className="group flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-110">
                      <AlertCircle className="size-5" />
                    </div>
                    <span className="font-medium transition-colors group-hover:text-purple-600">
                      Blockchain Aptos
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-16 border-t border-gray-200 pt-8">
              <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                <p className="text-center text-gray-600">
                  © {new Date().getFullYear()}{" "}
                  <span className="font-semibold text-blue-600">
                    MediFollow
                  </span>
                  . Tous droits réservés. Fait avec{" "}
                  <Heart className="inline size-4 fill-red-500 text-red-500" />{" "}
                  pour votre santé.
                </p>
                <div className="flex flex-wrap justify-center space-x-4 text-sm text-gray-600">
                  <a href="#" className="transition-colors hover:text-blue-600">
                    Conditions d&apos;utilisation
                  </a>
                  <span>•</span>
                  <a href="#" className="transition-colors hover:text-blue-600">
                    Politique de confidentialité
                  </a>
                  <span>•</span>
                  <a
                    href="/contact"
                    className="transition-colors hover:text-blue-600"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

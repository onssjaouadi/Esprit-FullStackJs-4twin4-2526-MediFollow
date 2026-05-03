"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  Activity,
  Shield,
  Bell,
  Users,
  BarChart3,
  Lock,
  Clock,
  Smartphone,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Award,
  Zap,
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Star,
  MessageCircle,
  Menu,
  X,
  ArrowUp,
  Building2,
  Sparkles,
} from "lucide-react";

// Import dynamique du composant 3D médical pour éviter les erreurs SSR
const MedicalHumanBody3D = dynamic(
  () => import("@/components/MedicalHumanBody3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="mx-auto mb-4 size-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Chargement du modèle anatomique 3D...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Show scroll to top button after scrolling
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setShowScrollTop(window.scrollY > 500);
      setScrolled(window.scrollY > 20);
    });
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Enhanced */}
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
              href="#features"
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-blue-600"
            >
              <span className="relative z-10">Fonctionnalités</span>
              <span className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-all duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:left-2 group-hover:w-[calc(100%-1rem)]"></span>
            </Link>
            <Link
              href="#testimonials"
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-blue-600"
            >
              <span className="relative z-10">Témoignages</span>
              <span className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-all duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:left-2 group-hover:w-[calc(100%-1rem)]"></span>
            </Link>
            <Link
              href="/contact"
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-blue-600"
            >
              <span className="relative z-10">Contact</span>
              <span className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-all duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:left-2 group-hover:w-[calc(100%-1rem)]"></span>
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
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 font-semibold transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                  <Zap className="size-4" />
                </div>
                <span>Fonctionnalités</span>
              </Link>
              <Link
                href="#testimonials"
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
                className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 font-semibold transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                  <MessageCircle className="size-4" />
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/40 hover:shadow-3xl hover:-translate-y-1 transition-all animate-fade-in"
          aria-label="Retour en haut"
        >
          <ArrowUp className="size-6" />
        </button>
      )}

      {/* Hero Section - Improved with 3D Model */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 size-80 rounded-full bg-blue-200/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-green-200/20 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-6">
          {/* Grid Layout: Text Left, 3D Model Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-5 py-2 text-blue-700 shadow-sm animate-fade-in-down">
                <Shield className="size-5" />
                <span className="text-sm font-semibold">
                  Plateforme certifiée de suivi post-hospitalisation
                </span>
              </div>
              <h1 className="mb-8 text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 animate-fade-in">
                Surveillez votre santé <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  en toute sérénité
                </span>
              </h1>
              <p className="mb-10 text-lg lg:text-xl leading-relaxed text-gray-600 animate-fade-in-up">
                MediFollow vous accompagne dans votre rétablissement avec un
                suivi personnalisé de vos signes vitaux, des alertes
                intelligentes et un contact direct avec votre équipe médicale.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-fade-in-up">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1"
                >
                  <span>Commencer maintenant</span>
                  <TrendingUp className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center space-x-2 rounded-xl border-2 border-blue-600 bg-white px-10 py-5 text-lg font-bold text-blue-600 transition-all hover:bg-blue-50 hover:border-blue-700"
                >
                  <span>Découvrir</span>
                  <ChevronDown className="size-5" />
                </Link>
              </div>

              {/* Mini Stats under buttons - Mobile/Tablet */}
              <div className="mt-12 grid grid-cols-2 gap-4 lg:hidden">
                <div className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-lg">
                  <div className="text-3xl font-black bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Surveillance
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-lg">
                  <div className="text-3xl font-black bg-gradient-to-br from-green-600 to-green-800 bg-clip-text text-transparent">
                    &lt;2s
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Alertes</p>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Model */}
            <div className="relative animate-fade-in-up">
              <MedicalHumanBody3D />
              {/* Info badge floating */}
              <div className="absolute -bottom-4 -left-4 hidden lg:block">
                <div className="rounded-xl bg-white p-4 shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800">
                      <Activity className="size-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Suivi en temps réel
                      </p>
                      <p className="text-xs text-gray-600">
                        Tous vos signes vitaux
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats - Desktop Only */}
          <div className="mx-auto mt-20 hidden lg:grid max-w-6xl grid-cols-4 gap-6">
            <div className="group rounded-2xl bg-white p-8 text-center shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-3 text-5xl font-black bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                24/7
              </div>
              <p className="text-gray-600 font-medium">Surveillance continue</p>
              <Activity className="mx-auto mt-3 size-8 text-blue-600 opacity-20 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="group rounded-2xl bg-white p-8 text-center shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-3 text-5xl font-black bg-gradient-to-br from-green-600 to-green-800 bg-clip-text text-transparent">
                &lt;2s
              </div>
              <p className="text-gray-600 font-medium">Alertes instantanées</p>
              <Zap className="mx-auto mt-3 size-8 text-green-600 opacity-20 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="group rounded-2xl bg-white p-8 text-center shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-3 text-5xl font-black bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                100%
              </div>
              <p className="text-gray-600 font-medium">Sécurisé blockchain</p>
              <Shield className="mx-auto mt-3 size-8 text-purple-600 opacity-20 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="group rounded-2xl bg-white p-8 text-center shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-3 text-5xl font-black bg-gradient-to-br from-orange-600 to-orange-800 bg-clip-text text-transparent">
                5k+
              </div>
              <p className="text-gray-600 font-medium">Patients satisfaits</p>
              <Award className="mx-auto mt-3 size-8 text-orange-600 opacity-20 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Logos Partenaires */}
      <section className="py-16 bg-gradient-to-r from-gray-50 via-blue-50/30 to-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Ils nous font confiance
            </p>
            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Building2 className="size-5 text-blue-600" />
              <span className="text-lg font-medium">
                Partenaires certifiés du secteur médical
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {/* Logo placeholders - styled as trusted brands */}
            {[
              { name: "CHU Dakar", color: "from-blue-600 to-blue-800" },
              {
                name: "Hôpital Principal",
                color: "from-green-600 to-green-800",
              },
              {
                name: "Clinique Moderne",
                color: "from-purple-600 to-purple-800",
              },
              {
                name: "Centre Médical",
                color: "from-orange-600 to-orange-800",
              },
              { name: "Lab Santé", color: "from-red-600 to-red-800" },
              { name: "Polyclinique", color: "from-indigo-600 to-indigo-800" },
            ].map((partner, idx) => (
              <div
                key={idx}
                className="group flex flex-col items-center justify-center p-6 rounded-xl bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-white transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${partner.color} shadow-lg mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Building2 className="size-8 text-white" />
                </div>
                <p className="text-xs font-bold text-gray-700 text-center">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>

          {/* Security badges */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center space-x-3 px-6 py-3 rounded-full bg-white border-2 border-green-200 shadow-md">
              <Shield className="size-5 text-green-600" />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">RGPD</p>
                <p className="text-xs text-gray-600">Conforme</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-6 py-3 rounded-full bg-white border-2 border-blue-200 shadow-md">
              <Lock className="size-5 text-blue-600" />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">Blockchain</p>
                <p className="text-xs text-gray-600">Sécurisé</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-6 py-3 rounded-full bg-white border-2 border-purple-200 shadow-md">
              <Award className="size-5 text-purple-600" />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">ISO 27001</p>
                <p className="text-xs text-gray-600">Certifié</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-6 py-3 rounded-full bg-white border-2 border-orange-200 shadow-md">
              <Sparkles className="size-5 text-orange-600" />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">5 étoiles</p>
                <p className="text-xs text-gray-600">Note moyenne</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
              <Star className="size-4" />
              <span className="text-sm font-semibold">Tout en un</span>
            </div>
            <h2 className="mb-6 text-5xl font-extrabold text-gray-900">
              Fonctionnalités{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                puissantes
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Tout ce dont vous avez besoin pour un suivi médical efficace et
              rassurant
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-8 transition-all hover:border-blue-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 size-24 rounded-full bg-blue-600/5 blur-2xl transition-all group-hover:bg-blue-600/10"></div>
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-4 shadow-lg shadow-blue-500/30">
                  <Activity className="size-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Suivi des signes vitaux
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Enregistrez facilement votre tension artérielle, fréquence
                  cardiaque, température, saturation en oxygène et poids en
                  quelques clics.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-red-50/30 p-8 transition-all hover:border-red-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 size-24 rounded-full bg-red-600/5 blur-2xl transition-all group-hover:bg-red-600/10"></div>
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-4 shadow-lg shadow-red-500/30">
                  <Bell className="size-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Alertes intelligentes
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Recevez des alertes instantanées lorsque vos signes vitaux
                  sortent des seuils personnalisés définis par votre médecin.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-green-50/30 p-8 transition-all hover:border-green-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 size-24 rounded-full bg-green-600/5 blur-2xl transition-all group-hover:bg-green-600/10"></div>
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 p-4 shadow-lg shadow-green-500/30">
                  <Users className="size-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Supervision médicale
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Votre équipe médicale suit votre évolution en temps réel et
                  peut intervenir rapidement si nécessaire.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 transition-all hover:border-purple-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 size-24 rounded-full bg-purple-600/5 blur-2xl transition-all group-hover:bg-purple-600/10"></div>
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-4 shadow-lg shadow-purple-500/30">
                  <BarChart3 className="size-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Historique et graphiques
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualisez l&apos;évolution de vos signes vitaux avec des
                  graphiques interactifs et un historique complet.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-yellow-50/30 p-8 transition-all hover:border-yellow-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 size-24 rounded-full bg-yellow-600/5 blur-2xl transition-all group-hover:bg-yellow-600/10"></div>
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 shadow-lg shadow-yellow-500/30">
                  <Lock className="size-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Données ultra-sécurisées
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Vos données médicales sont chiffrées de bout en bout et
                  protégées par la technologie blockchain Aptos.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-indigo-50/30 p-8 transition-all hover:border-indigo-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 size-24 rounded-full bg-indigo-600/5 blur-2xl transition-all group-hover:bg-indigo-600/10"></div>
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 shadow-lg shadow-indigo-500/30">
                  <Smartphone className="size-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Accessible partout
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Accédez à votre tableau de bord depuis n&apos;importe quel
                  appareil : ordinateur, tablette ou smartphone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced */}
      <section className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
              <Clock className="size-4" />
              <span className="text-sm font-semibold">Simple et rapide</span>
            </div>
            <h2 className="mb-6 text-5xl font-extrabold text-gray-900">
              Comment ça{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                fonctionne ?
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Commencez votre suivi en seulement 3 étapes simples
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3">
            {/* Step 1 */}
            <div className="group relative text-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 opacity-0 blur-xl transition-opacity group-hover:opacity-20"></div>
              <div className="relative rounded-3xl border-2 border-blue-100 bg-white p-10 shadow-xl transition-all group-hover:border-blue-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-3xl font-black text-white shadow-lg shadow-blue-500/40">
                  1
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Créez votre compte
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Inscrivez-vous gratuitement en quelques clics avec vos
                  informations médicales de base.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative text-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 opacity-0 blur-xl transition-opacity group-hover:opacity-20"></div>
              <div className="relative rounded-3xl border-2 border-purple-100 bg-white p-10 shadow-xl transition-all group-hover:border-purple-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-3xl font-black text-white shadow-lg shadow-purple-500/40">
                  2
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Enregistrez vos mesures
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ajoutez quotidiennement vos signes vitaux via notre formulaire
                  intuitif.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative text-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-600 to-green-800 opacity-0 blur-xl transition-opacity group-hover:opacity-20"></div>
              <div className="relative rounded-3xl border-2 border-green-100 bg-white p-10 shadow-xl transition-all group-hover:border-green-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-800 text-3xl font-black text-white shadow-lg shadow-green-500/40">
                  3
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Soyez suivi 24/7
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Votre équipe médicale vous accompagne et intervient rapidement
                  si besoin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - NEW */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
              <MessageCircle className="size-4" />
              <span className="text-sm font-semibold">Témoignages</span>
            </div>
            <h2 className="mb-6 text-5xl font-extrabold text-gray-900">
              Ils nous font{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                confiance
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Des milliers de patients satisfaits utilisent MediFollow
              quotidiennement
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="group rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-blue-50/20 p-8 shadow-lg transition-all hover:border-blue-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-6 flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="mb-6 text-gray-700 leading-relaxed italic">
                &quot;MediFollow m&apos;a permis de suivre ma santé après mon
                opération cardiaque. Les alertes automatiques m&apos;ont sauvé
                la vie !&quot;
              </p>
              <div className="flex items-center space-x-4">
                <div className="relative size-12 shrink-0 rounded-full overflow-hidden ring-2 ring-blue-200">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                    alt="Marie Sow"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Marie Sow</div>
                  <div className="text-sm text-gray-600">
                    Patiente cardiaque
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-green-50/20 p-8 shadow-lg transition-all hover:border-green-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-6 flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="mb-6 text-gray-700 leading-relaxed italic">
                &quot;Interface simple et intuitive. Je peux suivre tous mes
                patients efficacement et réagir rapidement aux urgences.&quot;
              </p>
              <div className="flex items-center space-x-4">
                <div className="relative size-12 shrink-0 rounded-full overflow-hidden ring-2 ring-green-200">
                  <Image
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop"
                    alt="Dr. Karim"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Dr. Karim</div>
                  <div className="text-sm text-gray-600">Cardiologue</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-purple-50/20 p-8 shadow-lg transition-all hover:border-purple-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-6 flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="mb-6 text-gray-700 leading-relaxed italic">
                &quot;Excellent service ! La sécurité blockchain me rassure
                totalement. Mes données sont entre de bonnes mains.&quot;
              </p>
              <div className="flex items-center space-x-4">
                <div className="relative size-12 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-200">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                    alt="Ahmed Fall"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ahmed Fall</div>
                  <div className="text-sm text-gray-600">
                    Patient diabétique
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Gallery Section - NEW */}
      <section className="py-24 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
        <div className="container mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
              <Heart className="size-4" />
              <span className="text-sm font-semibold">Notre engagement</span>
            </div>
            <h2 className="mb-6 text-5xl font-extrabold text-gray-900">
              Une équipe médicale{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                d&apos;excellence
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Des professionnels de santé qualifiés et des technologies de
              pointe pour votre bien-être
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Image Card 1 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop"
                  alt="Équipe médicale professionnelle"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 inline-flex items-center space-x-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold">
                    <Users className="size-3" />
                    <span>Équipe</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Professionnels qualifiés
                  </h3>
                  <p className="text-sm text-gray-200">
                    Une équipe de médecins experts disponibles 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Image Card 2 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
                  alt="Médecin avec stéthoscope"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 inline-flex items-center space-x-2 rounded-full bg-green-600 px-3 py-1 text-xs font-bold">
                    <Activity className="size-3" />
                    <span>Surveillance</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Suivi personnalisé
                  </h3>
                  <p className="text-sm text-gray-200">
                    Chaque patient bénéficie d'un suivi adapté à ses besoins
                  </p>
                </div>
              </div>
            </div>

            {/* Image Card 3 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop"
                  alt="Équipement médical moderne"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 inline-flex items-center space-x-2 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold">
                    <Zap className="size-3" />
                    <span>Technologie</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Équipements de pointe
                  </h3>
                  <p className="text-sm text-gray-200">
                    Technologies médicales dernière génération
                  </p>
                </div>
              </div>
            </div>

            {/* Image Card 4 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop"
                  alt="Consultation médicale"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 inline-flex items-center space-x-2 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold">
                    <Heart className="size-3" />
                    <span>Soins</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Approche humaine</h3>
                  <p className="text-sm text-gray-200">
                    Une attention particulière à chaque patient
                  </p>
                </div>
              </div>
            </div>

            {/* Image Card 5 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop"
                  alt="Patient satisfait"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 inline-flex items-center space-x-2 rounded-full bg-yellow-600 px-3 py-1 text-xs font-bold">
                    <Star className="size-3" />
                    <span>Satisfaction</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Résultats prouvés</h3>
                  <p className="text-sm text-gray-200">
                    98% de patients satisfaits de nos services
                  </p>
                </div>
              </div>
            </div>

            {/* Image Card 6 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop"
                  alt="Technologie blockchain santé"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 inline-flex items-center space-x-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold">
                    <Shield className="size-3" />
                    <span>Sécurité</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Blockchain sécurisée
                  </h3>
                  <p className="text-sm text-gray-200">
                    Vos données protégées par cryptographie avancée
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-20 text-center">
              <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
                <Award className="size-4" />
                <span className="text-sm font-semibold">Avantages</span>
              </div>
              <h2 className="mb-6 text-5xl font-extrabold text-gray-900">
                Pourquoi choisir{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediFollow ?
                </span>
              </h2>
            </div>

            <div className="space-y-6">
              <div className="group flex items-start space-x-6 rounded-2xl border-2 border-green-100 bg-gradient-to-r from-green-50 to-white p-8 shadow-lg transition-all hover:border-green-300 hover:shadow-2xl hover:-translate-x-2">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-500/30">
                  <CheckCircle className="size-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    Réduisez les réhospitalisations
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    La surveillance continue permet de détecter rapidement les
                    complications et d&apos;éviter les retours coûteux à
                    l&apos;hôpital. Statistiquement, les patients suivis via
                    notre plateforme réduisent leur risque de réadmission de
                    60%.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 rounded-2xl border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white p-8 shadow-lg transition-all hover:border-blue-300 hover:shadow-2xl hover:-translate-x-2">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
                  <CheckCircle className="size-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    Rassurez-vous et votre famille
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Sachez que votre santé est surveillée 24/7 par des
                    professionnels qualifiés. Vos proches peuvent également être
                    rassurés grâce aux rapports automatiques.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 rounded-2xl border-2 border-purple-100 bg-gradient-to-r from-purple-50 to-white p-8 shadow-lg transition-all hover:border-purple-300 hover:shadow-2xl hover:-translate-x-2">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/30">
                  <CheckCircle className="size-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    Gagnez du temps et de l&apos;argent
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Plus besoin de déplacements fréquents pour des contrôles de
                    routine. Économisez en transport et en temps d&apos;attente
                    tout en maintenant une surveillance médicale optimale.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 rounded-2xl border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-white p-8 shadow-lg transition-all hover:border-orange-300 hover:shadow-2xl hover:-translate-x-2">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/30">
                  <CheckCircle className="size-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    Autonomie et contrôle total
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Prenez votre santé en main avec des outils simples,
                    intuitifs et accessibles. Visualisez votre progression et
                    partagez vos données avec qui vous voulez.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - NEW */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-20 text-center">
              <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
                <FileText className="size-4" />
                <span className="text-sm font-semibold">FAQ</span>
              </div>
              <h2 className="mb-6 text-5xl font-extrabold text-gray-900">
                Questions{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  fréquentes
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Tout ce que vous devez savoir sur MediFollow
              </p>
            </div>

            <div className="space-y-6">
              <details className="group rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:border-blue-200 hover:shadow-xl">
                <summary className="flex cursor-pointer items-center justify-between text-xl font-bold text-gray-900">
                  <span>MediFollow est-il gratuit ?</span>
                  <ChevronDown className="size-6 text-blue-600 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Oui ! L&apos;inscription et l&apos;utilisation de base de
                  MediFollow sont entièrement gratuites pour les patients. Des
                  fonctionnalités premium peuvent être proposées pour les
                  professionnels de santé.
                </p>
              </details>

              <details className="group rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:border-blue-200 hover:shadow-xl">
                <summary className="flex cursor-pointer items-center justify-between text-xl font-bold text-gray-900">
                  <span>Mes données sont-elles vraiment sécurisées ?</span>
                  <ChevronDown className="size-6 text-blue-600 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Absolument. Nous utilisons le chiffrement de bout en bout et
                  la blockchain Aptos pour garantir que vos données médicales
                  restent privées et inviolables. Nous sommes conformes aux
                  normes RGPD et HIPAA.
                </p>
              </details>

              <details className="group rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:border-blue-200 hover:shadow-xl">
                <summary className="flex cursor-pointer items-center justify-between text-xl font-bold text-gray-900">
                  <span>Comment fonctionne le système d&apos;alertes ?</span>
                  <ChevronDown className="size-6 text-blue-600 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Lorsque vos signes vitaux sortent des seuils définis par votre
                  médecin, une alerte est automatiquement envoyée à votre équipe
                  médicale et à vous-même par email et notification. Le temps de
                  réponse moyen est inférieur à 2 minutes.
                </p>
              </details>

              <details className="group rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:border-blue-200 hover:shadow-xl">
                <summary className="flex cursor-pointer items-center justify-between text-xl font-bold text-gray-900">
                  <span>Puis-je utiliser MediFollow sur mon smartphone ?</span>
                  <ChevronDown className="size-6 text-blue-600 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Oui, MediFollow est entièrement responsive et fonctionne
                  parfaitement sur tous les appareils : smartphones, tablettes
                  et ordinateurs. Vous pouvez même ajouter notre site à votre
                  écran d&apos;accueil comme une application.
                </p>
              </details>

              <details className="group rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:border-blue-200 hover:shadow-xl">
                <summary className="flex cursor-pointer items-center justify-between text-xl font-bold text-gray-900">
                  <span>
                    Comment mon médecin peut-il accéder à mes données ?
                  </span>
                  <ChevronDown className="size-6 text-blue-600 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Votre médecin peut créer un compte professionnel et vous
                  pourrez lui donner accès à vos données depuis votre tableau de
                  bord. Tous les accès sont enregistrés sur la blockchain pour
                  une traçabilité totale.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 py-24 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-40 -right-40 size-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-5 py-2 backdrop-blur-sm">
              <Zap className="size-5" />
              <span className="text-sm font-semibold">
                Commencez dès aujourd&apos;hui
              </span>
            </div>
            <h2 className="mb-6 text-5xl font-extrabold leading-tight">
              Prêt à prendre le contrôle de votre santé ?
            </h2>
            <p className="mb-10 text-2xl font-light opacity-90 leading-relaxed">
              Rejoignez des milliers de patients qui ont repris confiance grâce
              à notre plateforme de suivi médical
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center space-x-3 rounded-xl bg-white px-10 py-5 text-lg font-bold text-blue-600 shadow-2xl transition-all hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1"
              >
                <span>Créer mon compte gratuit</span>
                <Heart className="size-6 transition-transform group-hover:scale-110" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center space-x-3 rounded-xl border-2 border-white bg-transparent px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/10"
              >
                <span>Me connecter</span>
              </Link>
            </div>
            <p className="mt-8 text-sm opacity-75">
              ✓ Gratuit pour toujours • ✓ Sans engagement • ✓ Sécurisé par
              blockchain
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
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
                    href="tel:+221000000000"
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
                    href="#contact"
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

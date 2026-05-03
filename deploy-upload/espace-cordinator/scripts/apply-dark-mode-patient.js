/**
 * apply-dark-mode-patient.js
 * Applies Tailwind dark mode variants to all patient dashboard pages.
 */

const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..", "app", "dashboard", "patient");

const TARGET_FILES = [
  path.join(BASE, "page.tsx"),
  path.join(BASE, "alerts", "page.tsx"),
  path.join(BASE, "appointments", "page.tsx"),
  path.join(BASE, "history", "page.tsx"),
  path.join(BASE, "reports", "page.tsx"),
  path.join(BASE, "settings", "page.tsx"),
  path.join(BASE, "vitals", "page.tsx"),
  path.join(BASE, "access", "page.tsx"),
];

// ── Ordered list of [search, replacement] pairs ──────────────────────────────
// NOTE: order matters – more specific patterns first.
const REPLACEMENTS = [
  // ── Outer page wrappers ───────────────────────────────────────────────────

  // Loading spinner wrappers (flex min-h)
  [
    `className="flex min-h-screen items-center justify-center bg-white"`,
    `className="flex min-h-screen items-center justify-center bg-white dark:bg-black"`,
  ],
  // Success screen (vitals)
  [
    `className="flex min-h-screen items-center justify-center bg-white"`,
    `className="flex min-h-screen items-center justify-center bg-white dark:bg-black"`,
  ],
  // Main page wrapper
  [
    `className="min-h-screen bg-white"`,
    `className="min-h-screen bg-white dark:bg-black"`,
  ],

  // ── Sticky / fixed bars ───────────────────────────────────────────────────
  [
    `border-b border-gray-200 bg-white/95 backdrop-blur-sm"`,
    `border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm"`,
  ],
  // Static section header (settings, vitals header)
  [
    `border-b border-gray-200 bg-white"`,
    `border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"`,
  ],

  // ── Card / panel backgrounds ──────────────────────────────────────────────
  // Most cards share one of these combinations:
  [
    `rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all cursor-pointer`,
  ],
  [
    `rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all`,
  ],
  [
    `rounded-xl border border-gray-200 bg-white p-8`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8`,
  ],
  [
    `rounded-xl border border-gray-200 bg-white p-6`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6`,
  ],
  [
    `rounded-xl border border-gray-200 bg-white p-12 text-center`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center`,
  ],
  [
    `rounded-xl border border-gray-200 bg-white overflow-hidden`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden`,
  ],
  // rounded-lg security/privacy panels
  [
    `rounded-lg border border-gray-200 bg-white p-6`,
    `rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6`,
  ],
  [
    `rounded-lg border border-gray-200 p-6`,
    `rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-900 p-6`,
  ],
  // access page DoctorCard
  [
    `rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all`,
  ],
  // Upload section
  [
    `rounded-xl border border-gray-200 bg-white p-8\n`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8\n`,
  ],

  // ── Borders ───────────────────────────────────────────────────────────────
  [
    `border-b border-gray-200 px-6 py-4`,
    `border-b border-gray-200 dark:border-gray-800 px-6 py-4`,
  ],
  [
    `border-b border-gray-100"`,
    `border-b border-gray-100 dark:border-gray-800"`,
  ],
  [`divide-y divide-gray-100`, `divide-y divide-gray-100 dark:divide-gray-800`],
  // Timeline line
  [`w-0.5 bg-gray-200"`, `w-0.5 bg-gray-200 dark:bg-gray-700"`],

  // ── Hover rows ────────────────────────────────────────────────────────────
  [
    `group hover:bg-gray-50 transition-colors`,
    `group hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors`,
  ],

  // ── Search inputs ─────────────────────────────────────────────────────────
  [
    `rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-colors`,
    `rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-2.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-400 dark:focus:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors`,
  ],
  [
    `rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-all`,
    `rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-2.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-400 dark:focus:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all`,
  ],

  // ── Form inputs (settings / vitals) ──────────────────────────────────────
  [
    `w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-400 focus:outline-none transition-colors`,
    `w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors`,
  ],
  [
    `w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-400 focus:outline-none transition-colors`,
    `w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors`,
  ],
  // vitals form inputs with blue focus
  [
    `mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`,
    `mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800`,
  ],
  [
    `mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-400 focus:outline-none transition-colors`,
    `mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors`,
  ],

  // ── Filter / chip buttons — inactive state ────────────────────────────────
  [
    `border-gray-200 bg-white text-gray-700 hover:bg-gray-50`,
    `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`,
  ],
  // Filter buttons — active all/default
  [
    `border-gray-900 bg-gray-100 text-gray-900`,
    `border-gray-900 dark:border-gray-200 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white`,
  ],

  // ── Stats pills ───────────────────────────────────────────────────────────
  [
    `rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700`,
    `rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300`,
  ],
  [
    `rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-600`,
    `rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-600 dark:text-gray-300`,
  ],

  // ── White-on-gray sub-panels ──────────────────────────────────────────────
  [
    `rounded-lg bg-gray-50 border border-gray-200 p-3`,
    `rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3`,
  ],
  [
    `rounded-lg bg-gray-50 border border-gray-200 p-3 mb-3`,
    `rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 mb-3`,
  ],
  // wallet / blockchain panel in access (bg-gray-50 in DoctorCard)
  [
    `mb-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2`,
    `mb-4 flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2`,
  ],

  // ── Tab sidebar (settings page) ───────────────────────────────────────────
  [
    `activeTab === tab.id\n                        ? "bg-gray-100 text-gray-900"\n                        : "text-gray-700 hover:bg-gray-50"`,
    `activeTab === tab.id\n                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"\n                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"`,
  ],

  // ── Empty state icon wrappers ─────────────────────────────────────────────
  [
    `mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center`,
    `mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center`,
  ],
  [
    `mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-50`,
    `mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30`,
  ],
  // Loading spinner text
  [
    `<p className="text-sm font-medium text-gray-600">Chargement...</p>`,
    `<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chargement...</p>`,
  ],
  [
    `<p className="text-gray-600">Chargement...</p>`,
    `<p className="text-gray-600 dark:text-gray-400">Chargement...</p>`,
  ],
  [
    `border-4 border-gray-900 border-t-transparent`,
    `border-4 border-gray-900 dark:border-gray-400 border-t-transparent dark:border-t-transparent`,
  ],

  // ── Heading text colors ───────────────────────────────────────────────────
  // h1 3xl
  [
    `text-3xl font-bold text-gray-900`,
    `text-3xl font-bold text-gray-900 dark:text-white`,
  ],
  // h1 2xl
  [
    `text-2xl font-bold text-gray-900`,
    `text-2xl font-bold text-gray-900 dark:text-white`,
  ],
  // h2
  [
    `text-xl font-bold text-gray-900`,
    `text-xl font-bold text-gray-900 dark:text-white`,
  ],
  [
    `text-lg font-semibold text-gray-900`,
    `text-lg font-semibold text-gray-900 dark:text-white`,
  ],
  [
    `text-base font-semibold text-gray-900`,
    `text-base font-semibold text-gray-900 dark:text-white`,
  ],
  // font-bold mid size
  [
    `text-2xl font-bold text-gray-900 mb-1`,
    `text-2xl font-bold text-gray-900 dark:text-white mb-1`,
  ],
  // Section description text
  [`mt-2 text-gray-600"`, `mt-2 text-gray-600 dark:text-gray-400"`],
  [`mt-1 text-gray-600"`, `mt-1 text-gray-600 dark:text-gray-400"`],

  // ── Body text ─────────────────────────────────────────────────────────────
  [
    `text-sm text-gray-600 mt-1`,
    `text-sm text-gray-600 dark:text-gray-400 mt-1`,
  ],
  [
    `text-sm text-gray-600 mb-1`,
    `text-sm text-gray-600 dark:text-gray-400 mb-1`,
  ],
  [
    `text-sm text-gray-600 mb-2`,
    `text-sm text-gray-600 dark:text-gray-400 mb-2`,
  ],
  [
    `text-sm text-gray-600 mb-3`,
    `text-sm text-gray-600 dark:text-gray-400 mb-3`,
  ],
  [
    `text-sm text-gray-600 mb-4`,
    `text-sm text-gray-600 dark:text-gray-400 mb-4`,
  ],
  // label text
  [
    `block text-sm font-medium text-gray-700 mb-2`,
    `block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2`,
  ],
  // note text
  [
    `text-sm text-gray-600 mt-1"`,
    `text-sm text-gray-600 dark:text-gray-400 mt-1"`,
  ],
  [`text-sm text-gray-600"`, `text-sm text-gray-600 dark:text-gray-400"`],
  [
    `text-sm text-gray-600 line-clamp-2`,
    `text-sm text-gray-600 dark:text-gray-400 line-clamp-2`,
  ],
  [`text-xs text-gray-500`, `text-xs text-gray-500 dark:text-gray-400`],
  [`text-xs text-gray-400`, `text-xs text-gray-400 dark:text-gray-500`],
  // Profile email in settings
  [
    `p className="text-gray-600">{profileData.email}</p>`,
    `p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>`,
  ],

  // ── Avatar background (settings profile) ─────────────────────────────────
  [
    `h-20 w-20 rounded-full bg-gray-900 flex items-center justify-center text-2xl font-bold text-white`,
    `h-20 w-20 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-white`,
  ],

  // ── Quick action chips ────────────────────────────────────────────────────
  // "All" black button in appointments quick actions
  [
    `rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors whitespace-nowrap`,
    `rounded-full bg-gray-900 dark:bg-gray-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors whitespace-nowrap`,
  ],
  // "See all" gray-900 button in empty state
  [
    `rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors`,
    `rounded-full bg-gray-900 dark:bg-gray-700 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors`,
  ],
  // Settings save buttons
  [
    `rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50`,
    `rounded-full bg-gray-900 dark:bg-gray-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50`,
  ],
  // Security tab button
  [
    `rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors`,
    `rounded-full bg-gray-900 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors`,
  ],
  // View button in reports
  [
    `rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors`,
    `rounded-full bg-gray-900 dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors`,
  ],
  // Submit button in vitals
  [
    `flex-1 rounded-full bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2`,
    `flex-1 rounded-full bg-gray-900 dark:bg-gray-700 px-6 py-3 font-medium text-white transition hover:bg-gray-800 dark:hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2`,
  ],
  // Cancel border button in vitals
  [
    `rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 flex items-center justify-center`,
    `rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center`,
  ],
  // Download/cancel border button in reports
  [
    `rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors`,
    `rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`,
  ],
  // "See all appointments" empty state
  [
    `rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors`,
    `rounded-full bg-gray-900 dark:bg-gray-700 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors`,
  ],
  // Appointment action buttons
  [
    `rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors`,
    `rounded-full bg-gray-900 dark:bg-gray-700 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors`,
  ],
  [
    `rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors`,
    `rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`,
  ],

  // ── Notification setting label ────────────────────────────────────────────
  [
    `text-sm font-medium text-gray-900"`,
    `text-sm font-medium text-gray-900 dark:text-white"`,
  ],
  [
    `text-sm font-medium text-gray-900 mb-1`,
    `text-sm font-medium text-gray-900 dark:text-white mb-1`,
  ],
  [
    `text-sm font-medium text-gray-900 mb-2`,
    `text-sm font-medium text-gray-900 dark:text-white mb-2`,
  ],
  [
    `text-sm font-medium text-gray-900 mb-4`,
    `text-sm font-medium text-gray-900 dark:text-white mb-4`,
  ],

  // ── access page header ────────────────────────────────────────────────────
  [
    `text-2xl font-bold text-gray-900 flex items-center gap-2`,
    `text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2`,
  ],
  [
    `text-sm text-gray-500 mt-1"`,
    `text-sm text-gray-500 dark:text-gray-400 mt-1"`,
  ],
  // access page refresh button
  [
    `rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors`,
    `rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`,
  ],
  // access page section titles
  [
    `text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2`,
    `text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2`,
  ],
  // access doctor name
  [
    `font-semibold text-gray-900 truncate`,
    `font-semibold text-gray-900 dark:text-white truncate`,
  ],
  // access doctor specialty
  [
    `text-xs text-gray-500 truncate`,
    `text-xs text-gray-500 dark:text-gray-400 truncate`,
  ],
  // access grant info text
  [
    `text-xs text-gray-500 space-y-1`,
    `text-xs text-gray-500 dark:text-gray-400 space-y-1`,
  ],
  // DoctorCard wallet panel text
  [
    `truncate font-mono text-xs text-gray-700`,
    `truncate font-mono text-xs text-gray-700 dark:text-gray-300`,
  ],
  [`text-xs text-gray-400"`, `text-xs text-gray-400 dark:text-gray-500"`],
  // duration chip inactive
  [
    `bg-white text-gray-700 border-gray-200 hover:border-blue-300`,
    `bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300`,
  ],

  // ── reports document viewer modal header ─────────────────────────────────
  [
    `bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg`,
    `bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-lg`,
  ],
  [
    `h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`,
    `h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0`,
  ],
  [
    `flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors`,
    `flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`,
  ],
  // doc file icon div
  [
    `h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center`,
    `h-12 w-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center`,
  ],
  // reports viewer bg
  [
    `w-full h-full flex items-center justify-center bg-gray-50 overflow-auto`,
    `w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-auto`,
  ],
  [
    `w-full h-full flex items-center justify-center bg-gray-50`,
    `w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900`,
  ],
  // upload section
  [
    `mb-8 rounded-xl border border-gray-200 bg-white p-6`,
    `mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6`,
  ],

  // ── Appointment date badge ────────────────────────────────────────────────
  [
    `rounded-lg bg-gray-50 p-3 text-center`,
    `rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center`,
  ],
  [
    `text-2xl font-bold text-gray-900"\n`,
    `text-2xl font-bold text-gray-900 dark:text-white"\n`,
  ],
  [
    `text-xs font-medium text-gray-600 uppercase`,
    `text-xs font-medium text-gray-600 dark:text-gray-400 uppercase`,
  ],

  // ── History timeline item content ─────────────────────────────────────────
  [
    `group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all`,
    `group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all`,
  ],

  // ── Notification toggle on → complement dark ──────────────────────────────
  [
    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors`,
    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors dark:opacity-90`,
  ],

  // ── More button (dashboard) ───────────────────────────────────────────────
  [
    `p-2 rounded-full hover:bg-gray-200 transition-colors`,
    `p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`,
  ],

  // ── History empty state ───────────────────────────────────────────────────
  [
    `rounded-xl border border-gray-200 bg-white p-12 text-center"\n`,
    `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center"\n`,
  ],

  // ── Access donate/revoke action button ────────────────────────────────────
  [
    `w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`,
    `w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`,
  ],
];

// ── Apply replacements ────────────────────────────────────────────────────────
let totalFiles = 0;
let totalChanges = 0;

for (const filePath of TARGET_FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[SKIP] File not found: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let fileChanges = 0;
  const original = content;

  for (const [search, replacement] of REPLACEMENTS) {
    if (content.includes(search)) {
      // Replace ALL occurrences
      const before = content;
      // Use split/join for literal string replacement (handles special chars)
      content = content.split(search).join(replacement);
      const count = before.split(search).length - 1;
      fileChanges += count;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    totalFiles++;
    totalChanges += fileChanges;
    console.log(
      `[OK] ${path.relative(process.cwd(), filePath)} — ${fileChanges} substitution(s)`
    );
  } else {
    console.log(
      `[--] ${path.relative(process.cwd(), filePath)} — no changes needed`
    );
  }
}

console.log(
  `\nDone. ${totalChanges} substitution(s) across ${totalFiles} file(s).`
);

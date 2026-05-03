"use client";

/**
 * [NEW] User Creation Form Drawer — right-side slide-in panel
 * Renders role-specific fields based on the selected role.
 */

import { useState, useTransition } from "react";
import { X, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { superAdminCreateUser } from "@/lib/actions/superadmin.actions";

const ROLES = ["ADMIN", "DOCTOR", "PATIENT", "NURSE", "COORDINATOR"];
const SPECIALTIES = ["Cardiology", "Pediatrics", "General Practice", "Neurology", "Oncology", "Orthopedics", "Psychiatry", "Radiology", "Surgery", "Other"];
const SHIFTS = ["morning", "afternoon", "night"];
const BLOOD_TYPES = ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"];

function genPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Stable module-level helpers ─────────────────────────────────────────────
// IMPORTANT: these must live OUTSIDE the component so React never sees a new
// component type on re-render (which would unmount the input and lose focus).

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function FormInput({
  field,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  field: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      id={`sa-form-${field}`}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
    />
  );
}
// ────────────────────────────────────────────────────────────────────────────

interface Props {
  role?: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function UserFormDrawer({ role: prefillRole, onClose, onCreated }: Props) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  const [form, setForm] = useState({
    role: prefillRole ?? "DOCTOR",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: genPassword(),
    accountStatus: "ACTIVE",
    languagePreference: "en",
    internalNotes: "",
    // Doctor
    specialty: "",
    licenseNumber: "",
    yearsOfExperience: "",
    assignedClinic: "",
    consultationFee: "",
    canPrescribe: true,
    // Admin
    department: "",
    accessLevel: "FULL",
    canManageBilling: false,
    // Nurse
    shift: "morning",
    specialization: "",
    // Coordinator
    canScheduleAppointments: true,
    canContactPatients: true,
    // Patient
    dateOfBirth: "",
    gender: "OTHER",
    nationalId: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleCopy = () => {
    navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await superAdminCreateUser({
        ...form,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
      } as any);
      if (result.success) {
        setCreatedPassword(result.generatedPassword ?? form.password);
        setTimeout(onCreated, 3000);
      } else {
        setError(result.error ?? "Failed to create user");
      }
    });
  };


  if (createdPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md h-auto rounded-2xl border border-emerald-500/20 bg-[#0d1117] p-8 shadow-2xl text-center space-y-4">
          <div className="text-emerald-400 text-4xl">✓</div>
          <h3 className="text-lg font-semibold text-white">User Created!</h3>
          <p className="text-sm text-slate-400">Generated password (copy it now):</p>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
            <span className="flex-1 font-mono text-sm text-violet-300 break-all">{createdPassword}</span>
            <button onClick={() => { navigator.clipboard.writeText(createdPassword); }}>
              <Copy size={14} className="text-slate-400 hover:text-white" />
            </button>
          </div>
          <p className="text-xs text-slate-500">Closing in 3s…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg flex flex-col bg-[#0d1117] border-l border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 flex-shrink-0">
          <h2 className="font-semibold text-white">Create New User</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Shared fields */}
          <FormField label="Role">
            <select
              id="sa-form-role"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              disabled={!!prefillRole}
              className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name"><FormInput field="firstName" value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="John" /></FormField>
            <FormField label="Last Name"><FormInput field="lastName" value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="Doe" /></FormField>
          </div>
          <FormField label="Email"><FormInput field="email" value={form.email} onChange={(v) => set("email", v)} type="email" placeholder="john@example.com" /></FormField>
          <FormField label="Phone"><FormInput field="phoneNumber" value={form.phoneNumber} onChange={(v) => set("phoneNumber", v)} placeholder="+1 555 000 0000" /></FormField>

          {/* Password */}
          <FormField label="Password">
            <div className="flex gap-2">
              <input
                id="sa-form-password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-mono text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <button
                type="button"
                onClick={() => set("password", genPassword())}
                className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Account Status">
              <select
                id="sa-form-accountStatus"
                value={form.accountStatus}
                onChange={(e) => set("accountStatus", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </FormField>
            <FormField label="Language">
              <select
                id="sa-form-language"
                value={form.languagePreference}
                onChange={(e) => set("languagePreference", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="ar">AR</option>
              </select>
            </FormField>
          </div>

          <FormField label="Internal Notes (SuperAdmin only)">
            <textarea
              id="sa-form-internalNotes"
              value={form.internalNotes}
              onChange={(e) => set("internalNotes", e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
            />
          </FormField>

          {/* Role-specific: DOCTOR */}
          {form.role === "DOCTOR" && (
            <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Doctor Fields</p>
              <FormField label="Specialty">
                <select id="sa-form-specialty" value={form.specialty} onChange={(e) => set("specialty", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none">
                  <option value="">Select specialty…</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="License Number"><FormInput field="licenseNumber" value={form.licenseNumber} onChange={(v) => set("licenseNumber", v)} placeholder="LIC-123456" /></FormField>
                <FormField label="Years of Experience"><FormInput field="yearsOfExperience" value={form.yearsOfExperience} onChange={(v) => set("yearsOfExperience", v)} type="number" placeholder="5" /></FormField>
              </div>
              <FormField label="Assigned Clinic / Ward"><FormInput field="assignedClinic" value={form.assignedClinic} onChange={(v) => set("assignedClinic", v)} placeholder="Cardiology Ward A" /></FormField>
              <FormField label="Consultation Fee (€)"><FormInput field="consultationFee" value={form.consultationFee} onChange={(v) => set("consultationFee", v)} type="number" placeholder="50" /></FormField>
              <div className="flex items-center gap-3">
                <input id="sa-form-canPrescribe" type="checkbox" checked={form.canPrescribe} onChange={(e) => set("canPrescribe", e.target.checked)} className="accent-emerald-500" />
                <label htmlFor="sa-form-canPrescribe" className="text-sm text-slate-300">Can Prescribe</label>
              </div>
            </div>
          )}

          {/* Role-specific: ADMIN */}
          {form.role === "ADMIN" && (
            <div className="space-y-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">Admin Fields</p>
              <FormField label="Department / Scope"><FormInput field="department" value={form.department} onChange={(v) => set("department", v)} placeholder="HR, Finance, IT…" /></FormField>
              <FormField label="Access Level">
                <select id="sa-form-accessLevel" value={form.accessLevel} onChange={(e) => set("accessLevel", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none">
                  <option value="FULL">Full</option>
                  <option value="RESTRICTED">Restricted</option>
                </select>
              </FormField>
              <div className="flex items-center gap-3">
                <input id="sa-form-canManageBilling" type="checkbox" checked={form.canManageBilling} onChange={(e) => set("canManageBilling", e.target.checked)} className="accent-sky-500" />
                <label htmlFor="sa-form-canManageBilling" className="text-sm text-slate-300">Can Manage Billing</label>
              </div>
            </div>
          )}

          {/* Role-specific: NURSE */}
          {form.role === "NURSE" && (
            <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Nurse Fields</p>
              <FormField label="License / Certification Number"><FormInput field="licenseNumber" value={form.licenseNumber} onChange={(v) => set("licenseNumber", v)} placeholder="NLIC-789" /></FormField>
              <FormField label="Assigned Ward / Floor"><FormInput field="department" value={form.department} onChange={(v) => set("department", v)} placeholder="ICU Floor 3" /></FormField>
              <FormField label="Shift">
                <select id="sa-form-shift" value={form.shift} onChange={(e) => set("shift", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none">
                  {SHIFTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </FormField>
              <FormField label="Specialization"><FormInput field="specialization" value={form.specialization} onChange={(v) => set("specialization", v)} placeholder="ICU, Pediatrics, General…" /></FormField>
            </div>
          )}

          {/* Role-specific: COORDINATOR */}
          {form.role === "COORDINATOR" && (
            <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Coordinator Fields</p>
              <FormField label="Department"><FormInput field="department" value={form.department} onChange={(v) => set("department", v)} placeholder="Oncology, Cardiology…" /></FormField>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input id="sa-form-canSchedule" type="checkbox" checked={form.canScheduleAppointments} onChange={(e) => set("canScheduleAppointments", e.target.checked)} className="accent-indigo-500" />
                  <label htmlFor="sa-form-canSchedule" className="text-sm text-slate-300">Can Schedule Appointments</label>
                </div>
                <div className="flex items-center gap-3">
                  <input id="sa-form-canContact" type="checkbox" checked={form.canContactPatients} onChange={(e) => set("canContactPatients", e.target.checked)} className="accent-indigo-500" />
                  <label htmlFor="sa-form-canContact" className="text-sm text-slate-300">Can Contact Patients</label>
                </div>
              </div>
            </div>
          )}

          {/* Role-specific: PATIENT */}
          {form.role === "PATIENT" && (
            <div className="space-y-3 rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">Patient Fields</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Date of Birth"><FormInput field="dateOfBirth" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} type="date" /></FormField>
                <FormField label="Gender">
                  <select id="sa-form-gender" value={form.gender} onChange={(e) => set("gender", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="National ID / Insurance No."><FormInput field="nationalId" value={form.nationalId} onChange={(v) => set("nationalId", v)} placeholder="ID-123456" /></FormField>
                <FormField label="Blood Type">
                  <select id="sa-form-bloodType" value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none">
                    <option value="">Unknown</option>
                    {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt.replace("_", " ")}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Emergency Contact Name"><FormInput field="emergencyContactName" value={form.emergencyContactName} onChange={(v) => set("emergencyContactName", v)} placeholder="Jane Doe" /></FormField>
                <FormField label="Emergency Contact Phone"><FormInput field="emergencyContactPhone" value={form.emergencyContactPhone} onChange={(v) => set("emergencyContactPhone", v)} placeholder="+1 555 000 0000" /></FormField>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4 flex-shrink-0">
          <button onClick={onClose} className="rounded-xl px-5 py-2 text-sm text-slate-400 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            id="sa-create-user-submit"
            onClick={handleSubmit}
            disabled={isPending || !form.email || !form.firstName || !form.lastName}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}

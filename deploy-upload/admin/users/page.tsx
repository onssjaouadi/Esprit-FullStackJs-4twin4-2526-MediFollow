"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  Mail,
  Phone,
  UserCog,
  Activity,
  Shield,
  Eye,
  Edit,
  ArrowLeft,
  UserPlus,
  X,
  RotateCcw,
  Loader2,
} from "lucide-react";

import { getAllUsers, createUser } from "@/lib/actions/admin.actions";
import {
  getAllServices,
  getAssignableCareTeam,
  updateService,
} from "@/lib/actions/service.actions";

// --- INTERFACES ---
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT" | "NURSE" | "COORDINATOR";
  isActive: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string | Date;
  phoneNumber?: string | null;
}

interface ServiceOption {
  id: string;
  serviceName: string;
  patientIds?: string[];
  teamIds?: string[];
  specializations?: string[];
  isActive?: boolean;
}

interface TeamMemberOption {
  id: string;
  label: string;
  email: string;
  role: "DOCTOR" | "NURSE" | "ADMIN" | "PATIENT" | "COORDINATOR" | "AUDITOR";
}

const HospitalOptions = [
  { id: "medifollow-central", name: "MediFollow Central Hospital" },
  { id: "medifollow-north", name: "MediFollow North Hospital" },
  { id: "medifollow-south", name: "MediFollow South Hospital" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [loadingPlacementData, setLoadingPlacementData] = useState(false);

  const roleFilter = searchParams.get("role") || "ALL";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "Password123!", // Default password for demo
    role: "PATIENT" as "ADMIN" | "DOCTOR" | "PATIENT" | "NURSE" | "COORDINATOR",
    isActive: true,
    phoneNumber: "",
    hospitalId: "",
    serviceId: "",
    doctorId: "",
    specialty: "",
  });

  // --- RÉCUPÉRATION DONNÉES ---
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(
        data.map((u: any) => ({
          ...u,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
          status: u.isActive ? "ACTIVE" : "INACTIVE",
        }))
      );
    } catch (err) {
      console.error("Loading error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const loadPlacementData = async () => {
      if (!showAddModal) return;
      try {
        setLoadingPlacementData(true);
        const [servicesRes, teamRes] = await Promise.all([
          getAllServices(),
          getAssignableCareTeam(),
        ]);

        if (servicesRes?.success) {
          const activeServices = (servicesRes.services || []).filter(
            (s: any) => s.isActive !== false
          );
          setServices(activeServices);
        }
        if (teamRes?.success) {
          const doctors = (teamRes.team || []).filter(
            (m: any) => m.role === "DOCTOR"
          );
          setTeamMembers(doctors);
        }
      } catch (error) {
        console.error("Loading placement options failed", error);
      } finally {
        setLoadingPlacementData(false);
      }
    };

    void loadPlacementData();
  }, [showAddModal]);

  // --- LOGIQUE FILTRAGE ---
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const availableServices = useMemo(() => {
    if (!formData.hospitalId) return [];
    return services;
  }, [services, formData.hospitalId]);

  const availableDoctors = useMemo(() => {
    if (!formData.serviceId) return [];
    return teamMembers;
  }, [teamMembers, formData.serviceId]);

  const updateURL = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    val && val !== "ALL" ? params.set(key, val) : params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.role === "PATIENT" &&
      (!formData.hospitalId || !formData.serviceId || !formData.doctorId)
    ) {
      alert("Please select hospital, service, and doctor for the patient.");
      return;
    }

    if (
      formData.role === "DOCTOR" &&
      (!formData.hospitalId ||
        !formData.serviceId ||
        !formData.specialty.trim())
    ) {
      alert("Please select hospital, service, and enter doctor specialty.");
      return;
    }

    if (
      formData.role === "NURSE" &&
      (!formData.hospitalId || !formData.serviceId)
    ) {
      alert("Please select hospital and service for the nurse.");
      return;
    }

    if (formData.role === "COORDINATOR" && !formData.hospitalId) {
      alert("Please select hospital for the coordinator.");
      return;
    }

    setSaving(true);
    try {
      const created = await createUser(formData);

      if (
        formData.role === "PATIENT" &&
        created?.success &&
        created?.user?.id &&
        formData.serviceId
      ) {
        const selectedService = services.find(
          (s) => s.id === formData.serviceId
        );
        const existingPatientIds = Array.isArray(selectedService?.patientIds)
          ? selectedService.patientIds
          : [];
        const existingTeamIds = Array.isArray(selectedService?.teamIds)
          ? selectedService.teamIds
          : [];

        const mergedPatientIds = Array.from(
          new Set([...existingPatientIds, created.user.id])
        );
        const mergedTeamIds = Array.from(
          new Set([...existingTeamIds, formData.doctorId])
        );

        await updateService(formData.serviceId, {
          patientIds: mergedPatientIds,
          teamIds: mergedTeamIds,
        });
      }

      if (
        formData.role === "DOCTOR" &&
        created?.success &&
        created?.user?.id &&
        formData.serviceId
      ) {
        const selectedService = services.find(
          (s) => s.id === formData.serviceId
        );
        const existingTeamIds = Array.isArray(selectedService?.teamIds)
          ? selectedService.teamIds
          : [];
        const existingSpecializations = Array.isArray(
          selectedService?.specializations
        )
          ? selectedService.specializations
          : [];

        const mergedTeamIds = Array.from(
          new Set([...existingTeamIds, created.user.id])
        );
        const normalizedSpecialty = formData.specialty.trim();
        const mergedSpecializations = Array.from(
          new Set([
            ...existingSpecializations,
            ...(normalizedSpecialty ? [normalizedSpecialty] : []),
          ])
        );

        await updateService(formData.serviceId, {
          teamIds: mergedTeamIds,
          specializations: mergedSpecializations,
        });
      }

      // Assign NURSE to service team
      if (
        formData.role === "NURSE" &&
        created?.success &&
        created?.user?.id &&
        formData.serviceId
      ) {
        const selectedService = services.find(
          (s) => s.id === formData.serviceId
        );
        const existingTeamIds = Array.isArray(selectedService?.teamIds)
          ? selectedService.teamIds
          : [];

        const mergedTeamIds = Array.from(
          new Set([...existingTeamIds, created.user.id])
        );

        await updateService(formData.serviceId, {
          teamIds: mergedTeamIds,
        });
      }

      if (created?.success) {
        const staffRoles = ["DOCTOR", "NURSE", "COORDINATOR"];
        if (staffRoles.includes(formData.role) && !created.emailSent) {
          alert(
            `User created successfully, but the credentials email could not be sent to ${formData.email}. Please check SMTP settings.`
          );
        }

        setShowAddModal(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "Password123!",
          role: "PATIENT",
          isActive: true,
          phoneNumber: "",
          hospitalId: "",
          serviceId: "",
          doctorId: "",
          specialty: "",
        });
        await loadUsers();
      } else {
        alert(created?.error || "Failed to create user. Please try again.");
      }
    } catch (error) {
      console.error("Creation failed", error);
      alert("An error occurred while creating the user.");
    } finally {
      setSaving(false);
    }
  };

  // --- DESIGN COMPONENTS ---
  const RoleBadge = ({ role }: { role: string }) => {
    const config = {
      ADMIN: {
        icon: Shield,
        color:
          "text-purple-700 bg-purple-50 dark:bg-purple-900/20 ring-purple-600/20",
        label: "Admin",
      },
      DOCTOR: {
        icon: UserCog,
        color: "text-blue-700 bg-blue-50 dark:bg-blue-900/20 ring-blue-600/20",
        label: "Doctor",
      },
      PATIENT: {
        icon: Activity,
        color:
          "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-600/20",
        label: "Patient",
      },
      NURSE: {
        icon: UserCog,
        color: "text-pink-700 bg-pink-50 dark:bg-pink-900/20 ring-pink-600/20",
        label: "Nurse",
      },
      COORDINATOR: {
        icon: UserCog,
        color:
          "text-orange-700 bg-orange-50 dark:bg-orange-900/20 ring-orange-600/20",
        label: "Coordinator",
      },
    };
    const {
      icon: Icon,
      color,
      label,
    } = config[role as keyof typeof config] || config.PATIENT;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase ring-1 ring-inset ${color}`}
      >
        <Icon size={10} strokeWidth={3} /> {label}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-cyan-300/70">
            Administration
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
            Profile Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
            {roleFilter !== "ALL" ? ` (${roleFilter.toLowerCase()})` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <UserPlus size={14} /> New
        </button>
      </div>
      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-cyan-200/60 group-focus-within:text-indigo-500 dark:group-focus-within:text-cyan-400 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full glass-panel rounded-2xl py-3 pl-12 pr-4 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-indigo-400/10 dark:focus:ring-cyan-400/10 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => updateURL("role", e.target.value)}
            className="glass-panel rounded-2xl px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 outline-none"
          >
            <option value="ALL">All roles</option>
            <option value="DOCTOR">Doctors</option>
            <option value="PATIENT">Patients</option>
            <option value="NURSE">Nurses</option>
            <option value="COORDINATOR">Coordinators</option>
            <option value="ADMIN">Admins</option>
          </select>
          {(searchQuery || roleFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                updateURL("role", null);
              }}
              className="p-3 glass-panel rounded-2xl text-slate-400 hover:text-red-400 transition-all"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Table de Données */}
      <div className="glass-panel rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-cyan-300/10">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Identity
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Role & Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Contact
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xs">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            Created{" "}
                            {new Date(user.createdAt).toLocaleDateString(
                              "en-US"
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <RoleBadge role={user.role} />
                        <div className="flex items-center gap-1.5 px-1">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400 dark:bg-slate-600"}`}
                          />
                          <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-tighter">
                            {user.isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          <Mail
                            size={12}
                            className="text-slate-400 dark:text-slate-600"
                          />{" "}
                          {user.email}
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <Phone
                              size={12}
                              className="text-slate-400 dark:text-slate-600"
                            />{" "}
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 glass-panel rounded-xl text-slate-400 hover:text-cyan-500 transition-all hover:shadow-md"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="p-2 glass-panel rounded-xl text-slate-400 hover:text-amber-400 transition-all hover:shadow-md"
                        >
                          <Edit size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Users className="mx-auto text-slate-700 mb-4" size={40} />
                    <p className="text-sm font-bold text-slate-500 italic">
                      No users found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Dynamic Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-cyan-300/20">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-cyan-300/20 flex items-center justify-between">
              <h2 className="text-xl font-black leading-none">New Profile</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Profile Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["PATIENT", "DOCTOR", "NURSE", "COORDINATOR", "ADMIN"].map(
                    (r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            role: r as any,
                            ...(![
                              "PATIENT",
                              "DOCTOR",
                              "NURSE",
                              "COORDINATOR",
                            ].includes(r)
                              ? {
                                  hospitalId: "",
                                  serviceId: "",
                                  doctorId: "",
                                  specialty: "",
                                }
                              : {
                                  hospitalId: "",
                                  serviceId: "",
                                  doctorId: "",
                                  specialty: "",
                                }),
                          })
                        }
                        className={`py-3 rounded-xl text-[10px] font-black tracking-widest uppercase border-2 transition-all ${formData.role === r ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600"}`}
                      >
                        {r}
                      </button>
                    )
                  )}
                </div>
              </div>

              {formData.role === "PATIENT" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Hospital
                    </label>
                    <select
                      required
                      value={formData.hospitalId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hospitalId: e.target.value,
                          serviceId: "",
                          doctorId: "",
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                    >
                      <option value="">Select hospital</option>
                      {HospitalOptions.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Service
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serviceId: e.target.value,
                          doctorId: "",
                        })
                      }
                      disabled={!formData.hospitalId || loadingPlacementData}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all disabled:opacity-60"
                    >
                      <option value="">
                        {loadingPlacementData
                          ? "Loading services..."
                          : "Select service"}
                      </option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.serviceName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Doctor
                    </label>
                    <select
                      required
                      value={formData.doctorId}
                      onChange={(e) =>
                        setFormData({ ...formData, doctorId: e.target.value })
                      }
                      disabled={!formData.serviceId || loadingPlacementData}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all disabled:opacity-60"
                    >
                      <option value="">
                        {loadingPlacementData
                          ? "Loading doctors..."
                          : "Select doctor"}
                      </option>
                      {availableDoctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.label}
                        </option>
                      ))}
                    </select>
                    {formData.serviceId &&
                      !loadingPlacementData &&
                      availableDoctors.length === 0 && (
                        <p className="text-[11px] text-amber-600 ml-1">
                          No doctor is currently assigned to this service.
                        </p>
                      )}
                  </div>
                </>
              )}

              {formData.role === "DOCTOR" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Hospital
                    </label>
                    <select
                      required
                      value={formData.hospitalId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hospitalId: e.target.value,
                          serviceId: "",
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                    >
                      <option value="">Select hospital</option>
                      {HospitalOptions.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Service
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceId: e.target.value })
                      }
                      disabled={!formData.hospitalId || loadingPlacementData}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all disabled:opacity-60"
                    >
                      <option value="">
                        {loadingPlacementData
                          ? "Loading services..."
                          : "Select service"}
                      </option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.serviceName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Specialty
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                      placeholder="e.g. Cardiology"
                    />
                  </div>
                </>
              )}

              {formData.role === "NURSE" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Hospital
                    </label>
                    <select
                      required
                      value={formData.hospitalId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hospitalId: e.target.value,
                          serviceId: "",
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                    >
                      <option value="">Select hospital</option>
                      {HospitalOptions.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Service
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceId: e.target.value })
                      }
                      disabled={!formData.hospitalId || loadingPlacementData}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all disabled:opacity-60"
                    >
                      <option value="">
                        {loadingPlacementData
                          ? "Loading services..."
                          : "Select service"}
                      </option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.serviceName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {formData.role === "COORDINATOR" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Hospital
                    </label>
                    <select
                      required
                      value={formData.hospitalId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hospitalId: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                    >
                      <option value="">Select hospital</option>
                      {HospitalOptions.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

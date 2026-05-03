"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Mail,
  Phone,
  Shield,
  UserCog,
  Activity,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getUserById, updateUser, deleteUser } from "@/lib/actions/admin.actions";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Data states
  const [user, setUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "PATIENT" as "ADMIN" | "DOCTOR" | "PATIENT" | "NURSE" | "COORDINATOR",
    isActive: true,
    phoneNumber: "",
  });

  // Initial data loading
  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      // Security: Admin role verification
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const userData = await getUserById(params.id);
      if (userData) {
        setUser(userData);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          role: userData.role,
          isActive: userData.isActive,
          phoneNumber: userData.phoneNumber || "",
        });
      }
    } catch (error) {
      console.error("Loading error:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Action: Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateUser(params.id, formData);
      if (result?.success) {
        router.push(`/dashboard/admin/users/${params.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Action: Deletion
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteUser(params.id);
      if (result?.success) {
        setShowDeleteModal(false);
        router.push("/dashboard/admin/users"); // Redirect to global list
        router.refresh();
      } else {
        alert(result?.error || "Unable to delete this user.");
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Initial loading screen
  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Edit Profile</h1>
        <button 
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
        >
          Delete user
        </button>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR: PHOTO & STATUS --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[32px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center shadow-sm">
              <div className="relative mx-auto mb-6 h-24 w-24">
                <div className="flex h-full w-full items-center justify-center rounded-3xl bg-slate-900 dark:bg-zinc-800 text-white text-3xl font-bold uppercase">
                  {formData.firstName[0] || "?"}
                </div>
                <div className={`absolute -bottom-2 -right-2 rounded-full border-4 border-slate-50 dark:border-[#09090B] p-1.5 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-600'}`}>
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              </div>
              
              <h2 className="font-bold text-lg">{formData.firstName} {formData.lastName}</h2>
              <p className="text-sm text-slate-400 dark:text-zinc-500 mb-8">{formData.email}</p>

              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Account Status</label>
                <div className="flex rounded-2xl bg-slate-100 dark:bg-zinc-950 p-1 border border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={`flex-1 rounded-xl py-2 text-[10px] font-black uppercase transition-all ${formData.isActive ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 dark:text-zinc-600'}`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: false })}
                    className={`flex-1 rounded-xl py-2 text-[10px] font-black uppercase transition-all ${!formData.isActive ? 'bg-white dark:bg-zinc-800 text-red-500 dark:text-red-400 shadow-sm' : 'text-slate-400 dark:text-zinc-600'}`}
                  >
                    Suspended
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- FORM COLUMN --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section: Identity & Contact */}
            <section className="rounded-[32px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-8 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                <UserCog size={14} className="text-blue-500" /> General Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">First Name</label>
                  <input 
                    required
                    className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-5 py-4 font-bold outline-none focus:border-blue-500 transition-all"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Last Name</label>
                  <input 
                    required
                    className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-5 py-4 font-bold outline-none focus:border-blue-500 transition-all"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600" size={18} />
                  <input 
                    required
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 pl-14 pr-5 py-4 font-bold outline-none focus:border-blue-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600" size={18} />
                  <input 
                    type="tel"
                    className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 pl-14 pr-5 py-4 font-bold outline-none focus:border-blue-500 transition-all"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Section: System Role */}
            <section className="rounded-[32px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-8">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                <Shield size={14} className="text-purple-500" /> User Role
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["PATIENT", "DOCTOR", "NURSE", "COORDINATOR", "ADMIN"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({...formData, role: r})}
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all ${
                      formData.role === r 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'border-slate-50 dark:border-zinc-800 bg-transparent text-slate-400 dark:text-zinc-600 hover:border-slate-200 dark:hover:border-zinc-700'
                    }`}
                  >
                    {r === "PATIENT" && <Activity size={20} />}
                    {r === "DOCTOR" && <UserCog size={20} />}
                    {r === "ADMIN" && <Shield size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{r}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-6 pt-4">
              <Link 
                href={`/dashboard/admin/users/${params.id}`} 
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-white px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white dark:text-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* --- DELETE MODAL (CONNECTED) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-[40px] border border-white dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-500">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-black dark:text-white mb-2">Delete permanently?</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8">Warning, all data for this user will be erased from the database.</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="w-full rounded-2xl bg-red-500 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="animate-spin" size={14} /> : null}
                {deleting ? "Deleting..." : "Confirm deletion"}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
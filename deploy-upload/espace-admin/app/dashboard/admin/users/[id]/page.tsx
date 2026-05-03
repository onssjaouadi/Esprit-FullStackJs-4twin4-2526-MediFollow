"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Phone,
  Calendar,
  UserCog,
  Activity,
  Shield,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  AlertCircle,
  RefreshCcw,
  User as UserIcon,
  Loader2
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getUserById, deleteUser } from "@/lib/actions/admin.actions";

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT" | "NURSE" | "COORDINATOR";
  isActive: boolean;
  createdAt: string | Date;
  phoneNumber?: string | null;
  lastLogin?: Date | string | null;
  updatedAt?: Date | string;
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuthAndLoadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const userData = await getUserById(params.id);
      
      if (userData) {
        setUser({
          ...userData,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    checkAuthAndLoadUser();
  }, [checkAuthAndLoadUser]);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await deleteUser(user.id);
      if (res.success) {
        router.push("/dashboard/admin/users");
      } else {
        alert(res.error || "Unable to delete this user.");
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const config = {
      ADMIN: { icon: Shield, color: "text-purple-700 bg-purple-50 dark:bg-purple-900/20 ring-purple-600/20", label: "Administrator" },
      DOCTOR: { icon: UserCog, color: "text-blue-700 bg-blue-50 dark:bg-blue-900/20 ring-blue-600/20", label: "Doctor" },
      PATIENT: { icon: Activity, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-600/20", label: "Patient" },
    };
    const { icon: Icon, color, label } = config[role as keyof typeof config] || config.PATIENT;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${color}`}>
        <Icon size={12} strokeWidth={3} /> {label}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="size-10 animate-spin text-indigo-500" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <AlertCircle size={48} className="text-slate-500 mb-4" />
      <h1 className="text-xl font-black">User Not Found</h1>
      <Link href="/dashboard/admin/users" className="mt-4 text-sm font-bold text-indigo-500 hover:underline">Back to list</Link>
    </div>
  );

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Profile Details</h1>
          <p className="text-2xl font-bold leading-none">{user.name}</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
          <Link
            href={`/dashboard/admin/users/${user.id}/edit`}
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:from-cyan-600 hover:to-indigo-600 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Edit size={14} /> Edit
          </Link>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Identity */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-indigo-500 opacity-[0.05]" />
              <div className="relative">
                <div className="size-24 rounded-[32px] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl mx-auto mb-4 flex items-center justify-center text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <RoleBadge role={user.role} />
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-4 leading-tight">{user.name}</h2>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 break-all">{user.email}</p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Network Status</p>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full">
                    <div className={`size-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Data */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Information Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Information</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem icon={Mail} label="Email" value={user.email} />
                <InfoItem icon={Phone} label="Phone" value={user.phoneNumber || "Not provided"} />
                <InfoItem icon={UserIcon} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Log</h3>
                <Activity size={16} className="text-slate-300" />
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem 
                  icon={Calendar} 
                  label="Registration Date" 
                  value={new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} 
                />
                <InfoItem 
                  icon={RefreshCcw} 
                  label="Last Modified" 
                  value={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US') : "No modifications"} 
                />
                <div className="md:col-span-2 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl flex items-center gap-4">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><Clock size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Last Active Session</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US') : "No recent activity"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
            <div className="size-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Delete profile?</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 px-4">
              Warning, this action is irreversible. The data of <span className="font-bold text-slate-900 dark:text-white">{user.name}</span> will be permanently deleted.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for clarity
function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 transition-colors">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
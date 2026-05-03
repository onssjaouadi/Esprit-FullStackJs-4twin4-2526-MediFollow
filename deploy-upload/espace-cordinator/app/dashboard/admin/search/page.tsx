"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import { getAllUsers } from "@/lib/actions/admin.actions";
import { getAlertStats } from "@/lib/actions/alert.actions"; 
import { 
  Search, ArrowLeft, Loader2, AlertTriangle, 
  User, Bell, ChevronRight, Database, XCircle
} from "lucide-react";
import Link from "next/link";

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  
  const [userResults, setUserResults] = useState<any[]>([]);
  const [alertResults, setAlertResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const performUnifiedSearch = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    setError(false);
    
    try {
      const [userResponse, alertResponse]: any = await Promise.all([
        getAllUsers(),
        getAlertStats() 
      ]);

      const searchTerm = query.toLowerCase().trim();

      // --- USER FILTERING ---
      const rawUsers = Array.isArray(userResponse) 
        ? userResponse 
        : (userResponse?.users || userResponse?.data || []);
        
      const filteredUsers = rawUsers.filter((u: any) => 
        (u.name || u.firstName || "").toLowerCase().includes(searchTerm) || 
        u.email?.toLowerCase().includes(searchTerm)
      );
      setUserResults(filteredUsers);

      // --- ALERT FILTERING ---
      const rawAlerts = Array.isArray(alertResponse) 
        ? alertResponse 
        : (alertResponse?.alerts || alertResponse?.stats?.alerts || []);

      const filteredAlerts = rawAlerts.filter((a: any) => 
        a.message?.toLowerCase().includes(searchTerm) ||
        a.severity?.toLowerCase().includes(searchTerm) ||
        a.alertType?.toLowerCase().includes(searchTerm)
      );
      setAlertResults(filteredAlerts);

    } catch (err) {
      console.error("Search Logic Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    performUnifiedSearch();
  }, [performUnifiedSearch]);

  const totalResults = userResults.length + alertResults.length;

  return (
    <div>

      <div>
        {/* HEADER SECTION */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-8 bg-indigo-600 rounded-full" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Search Results</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
            Results for <span className="text-indigo-600 italic">"{query}"</span>
          </h2>
          <p className="mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
            {loading ? "Scanning Neural Registry..." : `${totalResults} entries identified in the database`}
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center py-32 text-slate-300 dark:text-slate-700">
            <Loader2 className="animate-spin mb-4" size={48} />
            <span className="text-[10px] font-black tracking-[0.5em] animate-pulse">SYNCHRONIZING...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center border-2 border-dashed border-red-100 dark:border-red-900/20 rounded-[3rem]">
            <XCircle size={40} className="mx-auto text-red-500 mb-4" />
            <p className="text-sm font-bold text-red-500 italic">Connection error with the secure server.</p>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* USERS SECTION */}
            {userResults.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-50 dark:border-slate-900">
                  <User size={16} className="text-indigo-600 dark:text-indigo-400"/>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">User Registry</h3>
                </div>
                <div className="grid gap-3">
                  {userResults.map((user) => (
                    <Link 
                      key={user.id} 
                      href={`/dashboard/admin/users/${user.id}`} 
                      className="flex items-center justify-between p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-600 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                          {(user.name || user.firstName || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name || `${user.firstName} ${user.lastName}`}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ALERTS SECTION */}
            {alertResults.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-50 dark:border-slate-900">
                  <Bell size={16} className="text-rose-600 dark:text-rose-400"/>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Incident Logs</h3>
                </div>
                <div className="grid gap-3">
                  {alertResults.map((alert) => (
                    <Link 
                      key={alert.id} 
                      href={`/dashboard/admin/alerts`} 
                      className="flex items-center justify-between p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-600 dark:hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 dark:group-hover:bg-rose-500 group-hover:text-white transition-colors">
                          <AlertTriangle size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 uppercase">
                               {alert.severity}
                             </span>
                             <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                               ID: {alert.id.slice(-6)}
                             </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-200 dark:text-slate-700 group-hover:text-rose-600 dark:group-hover:text-rose-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* EMPTY STATE */}
            {totalResults === 0 && (
              <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 transition-all">
                <Search size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
                <p className="text-lg font-bold text-slate-400 dark:text-slate-600 italic">No matches found in the encrypted archives.</p>
                <button 
                  onClick={() => router.back()}
                  className="mt-6 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                >
                  Modify query
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="text-center font-black text-slate-300 dark:text-slate-700 text-6xl md:text-9xl italic animate-pulse">
          LOADING...
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
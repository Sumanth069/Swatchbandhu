"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { signOut, updateProfile } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Award, MapPin, Camera, Sparkles, LogOut, Settings, Shield, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [stats, setStats] = useState({ reported: 0, cleaned: 0, points: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ displayName: string | null; photoURL: string | null; email: string | null } | null>(null);
  
  const [activeTab, setActiveTab] = useState<"reports" | "cleanups" | null>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [myCleanups, setMyCleanups] = useState<any[]>([]);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  
  const router = useRouter();
  
  const ADMIN_EMAILS = ["kpsumanth212@gmail.com", "sppranav2005@gmail.com"];

  useEffect(() => {
    // Listen for auth state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email
        });
        setNewName(currentUser.displayName || "");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return;

        const reportsQuery = query(collection(db, "swatchbandhu_v2_reports"), where("userId", "==", currentUserId));
        const cleanupsQuery = query(collection(db, "swatchbandhu_v2_reports"), where("cleanerId", "==", currentUserId));
        
        const [reportsSnap, cleanupsSnap] = await Promise.all([
          getDocs(reportsQuery),
          getDocs(cleanupsQuery)
        ]);

        const reportsMap = new Map<string, any>();
        reportsSnap.docs.forEach(doc => {
          reportsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        const cleanupsMap = new Map<string, any>();
        cleanupsSnap.docs.forEach(doc => {
          cleanupsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        // Include legacy cleanups
        reportsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.status === "resolved" && !data.cleanerId) {
            cleanupsMap.set(doc.id, { id: doc.id, ...data });
          }
        });

        const reportsList = Array.from(reportsMap.values());
        const cleanupsList = Array.from(cleanupsMap.values());

        setMyReports(reportsList);
        setMyCleanups(cleanupsList);

        setStats({
          reported: reportsList.length,
          cleaned: cleanupsList.length,
          points: (cleanupsList.length * 500) + (reportsList.length * 50)
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleSaveName = async () => {
    if (!auth.currentUser || !newName.trim()) return;
    setIsSavingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
      setUser(prev => prev ? { ...prev, displayName: newName.trim() } : null);
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
      alert("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const currentLevel = Math.floor(stats.points / 500) + 1;
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-zinc-950 pb-24 md:pb-12 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 transition-colors duration-300">
        <h1 className="font-extrabold text-2xl text-slate-900 dark:text-zinc-50 tracking-tight max-w-2xl mx-auto w-full flex items-center justify-between">
          <span>Profile</span>
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors bg-slate-100 dark:bg-zinc-900 p-2 rounded-full border border-transparent dark:border-zinc-800"><Settings size={20} /></button>
        </h1>
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        
        {/* Profile Info Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-200 dark:border-zinc-800 flex items-center gap-5 relative overflow-hidden shadow-sm"
        >
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-900 dark:text-zinc-100 font-bold text-3xl border-4 border-white dark:border-zinc-900 shadow-sm shrink-0 overflow-hidden">
             {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                user?.displayName ? user.displayName.charAt(0).toUpperCase() : "C"
             )}
          </div>
          <div className="flex-1">
             {isEditingName ? (
               <div className="flex items-center gap-2 mb-1">
                 <input 
                   type="text" 
                   value={newName} 
                   onChange={(e) => setNewName(e.target.value)}
                   className="bg-slate-100 dark:bg-zinc-800 border-none rounded-lg px-2 py-1 text-sm font-bold text-slate-900 dark:text-zinc-50 w-full outline-none focus:ring-2 focus:ring-emerald-500"
                   autoFocus
                 />
                 <button onClick={handleSaveName} disabled={isSavingName} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50">Save</button>
                 <button onClick={() => setIsEditingName(false)} className="bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 px-3 py-1 rounded-lg text-xs font-bold">Cancel</button>
               </div>
             ) : (
               <h2 className="font-bold text-2xl text-slate-900 dark:text-zinc-50 leading-tight flex items-center gap-2">
                 {user?.displayName || "Citizen Hero"}
                 <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-emerald-500 transition"><Settings size={14}/></button>
               </h2>
             )}
             <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
               <MapPin size={14} className="text-slate-400" /> Bengaluru Urban
             </p>
             <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 dark:border-zinc-200 shadow-sm">
               <Award size={14} /> Level {currentLevel} Eco-Warrior
             </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <motion.button 
             onClick={() => setActiveTab(activeTab === "reports" ? null : "reports")}
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
             className={`bg-white dark:bg-zinc-900 rounded-3xl p-5 border shadow-sm flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 outline-none ${activeTab === "reports" ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-zinc-800'}`}
           >
              <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center mb-1 border border-slate-100 dark:border-zinc-700">
                 <Camera size={20} className={activeTab === "reports" ? "text-emerald-500" : ""} />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tighter">
                {loading ? "..." : stats.reported}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Reports</span>
           </motion.button>

           <motion.button 
             onClick={() => setActiveTab(activeTab === "cleanups" ? null : "cleanups")}
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
             className={`bg-white dark:bg-zinc-900 rounded-3xl p-5 border shadow-sm flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 outline-none ${activeTab === "cleanups" ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-zinc-800'}`}
           >
              <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center mb-1 border border-slate-100 dark:border-zinc-700">
                 <Sparkles size={20} className={activeTab === "cleanups" ? "text-emerald-500" : ""} />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tighter">
                {loading ? "..." : stats.cleaned}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Cleanups</span>
           </motion.button>
        </div>

        {/* Dynamic Tab List of Submissions */}
        <AnimatePresence>
          {activeTab && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white dark:bg-zinc-900 rounded-[2rem] p-5 border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 shadow-sm"
            >
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-lg flex items-center justify-between px-1">
                <span>{activeTab === "reports" ? "My Reports" : "My Cleanups"}</span>
                <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2.5 py-1 rounded-full font-bold">
                  {activeTab === "reports" ? myReports.length : myCleanups.length} items
                </span>
              </h3>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {activeTab === "reports" ? (
                  myReports.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6 font-medium">You haven't reported any garbage yet.</p>
                  ) : (
                    myReports.map(report => (
                      <div 
                        key={report.id}
                        onClick={() => router.push(`/clean/${report.id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer border border-transparent hover:border-slate-100 transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={report.imageUrl} alt="Garbage" className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 animate-in fade-in" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 capitalize truncate">{report.type || "Mixed"} Waste</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{report.location.name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${report.status === "resolved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  myCleanups.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6 font-medium">You haven't verified any cleanups yet.</p>
                  ) : (
                    myCleanups.map(cleanup => (
                      <div 
                        key={cleanup.id}
                        onClick={() => router.push(`/clean/${cleanup.id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer border border-transparent hover:border-slate-100 transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cleanup.resolvedImageUrl || cleanup.imageUrl} alt="Cleaned" className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 animate-in fade-in" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 capitalize truncate">{cleanup.type || "Mixed"} Waste</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{cleanup.location.name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 uppercase tracking-wider">
                            Cleaned
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="bg-slate-900 dark:bg-zinc-100 rounded-[2rem] p-6 text-white dark:text-zinc-900 relative overflow-hidden shadow-md mt-2"
        >
          <div className="relative z-10">
             <h3 className="font-bold flex items-center gap-2 mb-2">
               <Sparkles size={16} /> Did you know?
             </h3>
             <p className="text-sm text-slate-300 dark:text-zinc-600 leading-relaxed font-medium">
               Snapping a photo of waste directly from the app automatically captures the exact GPS coordinates. This helps BBMP verify and clear it 3x faster!
             </p>
          </div>
        </motion.div>

        {/* About Link */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-2"
        >
           <button onClick={() => router.push("/about")} className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 font-bold py-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-950 transition-colors active:scale-[0.98] shadow-sm">
             <Info size={18} className="text-blue-500" /> About SwachBandhu
           </button>
        </motion.div>

        {/* Admin Link */}
        {isAdmin && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2"
          >
             <button onClick={() => router.push("/admin")} className="w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
               <Shield size={18} className="text-emerald-500" /> Admin Command Center
             </button>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-2"
        >
           <button onClick={handleSignOut} className="w-full bg-white dark:bg-zinc-900 text-red-500 dark:text-red-400 font-bold py-4 rounded-2xl border border-red-200 dark:border-red-900/50 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors active:scale-[0.98] shadow-sm">
             <LogOut size={18} /> Sign Out
           </button>
        </motion.div>
      </div>
    </div>
  );
}

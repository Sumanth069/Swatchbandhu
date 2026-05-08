"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { Award, MapPin, Camera, Sparkles, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [stats, setStats] = useState({ reported: 0, cleaned: 0, points: 2450 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      try {
        const q = query(collection(db, "swatchbandhu_v2_reports"));
        const snapshot = await getDocs(q);
        let reported = 0;
        let cleaned = 0;
        snapshot.forEach(doc => {
          reported++;
          if (doc.data().status === "resolved") cleaned++;
        });
        
        setStats({
          reported: Math.max(1, Math.floor(reported * 0.2)),
          cleaned: Math.max(0, Math.floor(cleaned * 0.5)),
          points: cleaned * 100 || 2450
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

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
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-900 dark:text-zinc-100 font-bold text-3xl border-4 border-white dark:border-zinc-900 shadow-sm shrink-0">
             C
          </div>
          <div className="flex-1">
             <h2 className="font-bold text-2xl text-slate-900 dark:text-zinc-50 leading-tight">Citizen Hero</h2>
             <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
               <MapPin size={14} className="text-slate-400" /> Bengaluru Urban
             </p>
             <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 dark:border-zinc-200 shadow-sm">
               <Award size={14} /> Level 4 Eco-Warrior
             </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
             className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-2"
           >
              <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center mb-1 border border-slate-100 dark:border-zinc-700">
                 <Camera size={20} />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tighter">
                {loading ? "..." : stats.reported}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Reports</span>
           </motion.div>

           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
             className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-2"
           >
              <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center mb-1 border border-slate-100 dark:border-zinc-700">
                 <Sparkles size={20} />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tighter">
                {loading ? "..." : stats.cleaned}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Cleanups</span>
           </motion.div>
        </div>

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

        {/* Logout */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
           <button onClick={handleSignOut} className="w-full bg-white dark:bg-zinc-900 text-red-500 dark:text-red-400 font-bold py-4 rounded-2xl border border-red-200 dark:border-red-900/50 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors active:scale-[0.98] shadow-sm">
             <LogOut size={18} /> Sign Out
           </button>
        </motion.div>
      </div>
    </div>
  );
}

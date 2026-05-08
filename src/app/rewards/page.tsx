"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { motion } from "framer-motion";
import { Gift, Wallet, GraduationCap, CalendarDays } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function RewardsPage() {
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCoins() {
      try {
        const q = query(collection(db, "swatchbandhu_v2_reports"));
        const snapshot = await getDocs(q);
        let cleaned = 0;
        snapshot.forEach(doc => {
          if (doc.data().status === "resolved") cleaned++;
        });
        setCoins(cleaned * 100);
      } catch (error) {
        console.error("Error fetching coins:", error);
        setCoins(0);
      }
    }
    fetchCoins();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white dark:bg-zinc-950 pb-24 md:pb-12 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-6 py-5 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 transition-colors duration-300">
        <h1 className="font-extrabold text-2xl text-slate-900 dark:text-zinc-50 tracking-tight max-w-2xl mx-auto">Rewards Store</h1>
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Coin Balance Card */}
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-slate-900 dark:bg-zinc-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg border border-slate-800"
        >
          <div className="relative z-10 flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 text-slate-400 font-bold tracking-wider text-[10px] uppercase">
              <Wallet size={14} /> My Swachh Coins
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-6xl font-black tracking-tighter text-white">
                {coins === null ? "..." : coins}
              </span>
              <span className="text-slate-300 font-bold text-lg">SC</span>
            </div>
          </div>
        </motion.div>

        {/* VTU Student Section */}
        <Link href="/vtu-batches">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-zinc-700 transition-transform duration-300 group-hover:scale-105">
                 <GraduationCap size={24} />
               </div>
               <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-zinc-700">VTU Exclusive</span>
            </div>
            <h2 className="font-bold text-slate-900 dark:text-zinc-50 text-xl tracking-tight relative z-10">AICTE Activity Points</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1.5 mb-6 leading-relaxed relative z-10">
              Verify 5 cleanups to automatically generate your official Activity Certificate for VTU submissions.
            </p>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-4 relative z-10">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "60%" }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="bg-slate-900 dark:bg-zinc-100 h-full rounded-full"
               ></motion.div>
            </div>
            <div className="flex justify-between items-center mt-6 relative z-10">
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">3 / 5 Cleanups</p>
              <div className="bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 group-hover:opacity-90 transition-opacity active:scale-95">
                 <CalendarDays size={16} /> Join Live Batch
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Vouchers Store */}
        <div>
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Gift size={18} className="text-slate-400" />
            <h2 className="font-bold text-slate-900 dark:text-zinc-50 text-lg">Redeem Vouchers</h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          >
             <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3 border border-slate-200 dark:border-zinc-700 shadow-sm">
                <Gift size={24} />
             </div>
             <h3 className="font-bold text-slate-700 dark:text-zinc-300 mb-1">Partnerships Coming Soon</h3>
             <p className="text-sm text-slate-500 dark:text-zinc-500 max-w-sm">We are actively onboarding eco-friendly brands. Your Swachh Coins will soon be redeemable for exclusive vouchers.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

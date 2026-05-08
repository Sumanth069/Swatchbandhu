"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, MapPin, Calendar, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VTUBatchesPage() {
  const router = useRouter();
  
  const [batches, setBatches] = useState([
    {
      id: "batch_1",
      location: "Hebbal Lake Cleanup",
      date: "Sunday, 12th May",
      time: "07:00 AM",
      totalSlots: 15,
      filledSlots: 12,
      whatsappGroup: "https://chat.whatsapp.com/sample_hebbal",
      points: 10
    },
    {
      id: "batch_2",
      location: "Madiwala Market Drive",
      date: "Saturday, 18th May",
      time: "08:30 AM",
      totalSlots: 10,
      filledSlots: 10, // Full
      whatsappGroup: "https://chat.whatsapp.com/sample_madiwala",
      points: 15
    }
  ]);

  const [joinedBatch, setJoinedBatch] = useState<string | null>(null);

  const handleJoin = (id: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id === id && b.filledSlots < b.totalSlots) {
        return { ...b, filledSlots: b.filledSlots + 1 };
      }
      return b;
    }));
    setJoinedBatch(id);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 relative z-10 shrink-0 sticky top-0 transition-colors duration-300">
        <div className="px-4 py-4 flex items-center gap-3 max-w-2xl mx-auto w-full">
          <button onClick={() => router.back()} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 p-2 rounded-full transition active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50 tracking-tight leading-none mb-1">Live Batches</h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">AICTE Activity Point Meetups</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
         <div className="max-w-2xl mx-auto flex flex-col gap-5">
            {batches.map((batch, idx) => {
              const isFull = batch.filledSlots >= batch.totalSlots;
              const isJoined = joinedBatch === batch.id;
              
              return (
                <motion.div 
                  key={batch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
                >
                   {isJoined && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-zinc-800 rounded-full blur-2xl pointer-events-none transition-all"></div>
                   )}

                   <div className="flex justify-between items-start mb-5 relative z-10">
                      <div>
                        <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-50">{batch.location}</h2>
                        <div className="flex items-center gap-3 mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
                           <span className="flex items-center gap-1"><Calendar size={14} className="text-slate-400 dark:text-zinc-500" /> {batch.date}</span>
                           <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400 dark:text-zinc-500" /> {batch.time}</span>
                        </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 shadow-sm">
                         +{batch.points} Pts
                      </div>
                   </div>

                   {/* Progress Bar for Vacancies */}
                   <div className="mb-5 relative z-10">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1"><Users size={12} /> Live Vacancy</span>
                       <span className={`text-xs font-bold ${isFull ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                         {batch.totalSlots - batch.filledSlots} Slots Left
                       </span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700/50">
                       <motion.div 
                         className={`h-full rounded-full ${isFull ? 'bg-red-500 dark:bg-red-400' : 'bg-slate-900 dark:bg-zinc-100'}`}
                         initial={{ width: 0 }}
                         animate={{ width: `${(batch.filledSlots / batch.totalSlots) * 100}%` }}
                         transition={{ duration: 0.8, ease: "easeOut" }}
                       />
                     </div>
                   </div>

                   <AnimatePresence mode="wait">
                     {isJoined ? (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: "auto" }}
                         className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-slate-200 dark:border-zinc-700 mt-4 relative z-10"
                       >
                         <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
                           <CheckCircle2 size={16} /> Successfully Joined!
                         </p>
                         <Link href={batch.whatsappGroup} target="_blank">
                           <button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98]">
                             <MessageCircle size={18} /> Join WhatsApp Group
                           </button>
                         </Link>
                       </motion.div>
                     ) : (
                       <button 
                         onClick={() => handleJoin(batch.id)}
                         disabled={isFull}
                         className={`w-full font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition active:scale-[0.98] mt-2 relative z-10 ${
                           isFull 
                             ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed border border-slate-200 dark:border-zinc-700/50' 
                             : 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 shadow-sm border border-transparent'
                         }`}
                       >
                         {isFull ? "Batch Full" : "Join Batch"}
                       </button>
                     )}
                   </AnimatePresence>
                </motion.div>
              );
            })}
         </div>
      </div>
    </div>
  );
}

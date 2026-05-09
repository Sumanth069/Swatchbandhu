"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { GraduationCap, MapPin, Calendar, ArrowLeft, Users, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function VTUBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [college, setCollege] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const snapshot = await getDocs(collection(db, "swatchbandhu_batches"));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = (batch: any) => {
    if (!auth.currentUser) {
      alert("Please log in to join a batch.");
      return;
    }
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const submitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      const memberData = {
        userId: user?.uid,
        name,
        usn,
        college,
        phone,
        joinedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, "swatchbandhu_batches", selectedBatch.id), {
        currentMembers: arrayUnion(memberData)
      });

      // Redirect to WhatsApp immediately after successful join
      window.location.href = selectedBatch.whatsappLink;
      
    } catch (err) {
      console.error(err);
      alert("Failed to join batch.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-zinc-950 transition-colors">
      <div className="bg-emerald-600 px-4 py-4 flex items-center gap-3 text-white sticky top-0 z-10 shadow-md">
        <button onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-full transition"><ArrowLeft size={24} /></button>
        <h1 className="font-extrabold text-xl tracking-tight">VTU Activity Points</h1>
      </div>

      <div className="p-5 flex flex-col gap-6 max-w-xl mx-auto w-full pb-24">
        
        {/* Rules Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-5">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <GraduationCap size={24} />
              </div>
              <h2 className="font-bold text-lg text-emerald-900 dark:text-emerald-50">How it Works</h2>
           </div>
           <ul className="text-sm text-emerald-800 dark:text-emerald-200/80 space-y-2 font-medium">
             <li className="flex items-start gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5"/> Join a weekend cleanup batch below.</li>
             <li className="flex items-start gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5"/> You will be added to a WhatsApp group.</li>
             <li className="flex items-start gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5"/> Participate in the drive, log it on SwachBandhu.</li>
             <li className="flex items-start gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5"/> Earn a verified certificate for VTU AICTE Activity Points.</li>
           </ul>
        </div>

        <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight mt-2">Active Batches</h2>
        
        {loading ? (
          <div className="text-center p-8 text-slate-500">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="text-center p-8 text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            No active batches currently. Check back later!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
             {batches.map(batch => {
               const membersCount = batch.currentMembers?.length || 0;
               const isFull = membersCount >= batch.maxCapacity;
               const vacancies = batch.maxCapacity - membersCount;

               return (
                 <div key={batch.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col gap-4">
                    <div>
                       <h3 className="font-bold text-xl text-slate-900 dark:text-white">{batch.area}</h3>
                       <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium flex items-center gap-1 mt-1"><Calendar size={14}/> {batch.date}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Users size={18} className="text-slate-400" />
                          <span className="font-bold text-sm text-slate-700 dark:text-zinc-300">{membersCount} / {batch.maxCapacity} joined</span>
                       </div>
                       {!isFull ? (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">{vacancies} Vacancy Left</span>
                       ) : (
                          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-md">Batch Full</span>
                       )}
                    </div>

                    <button 
                      onClick={() => handleJoinClick(batch)}
                      disabled={isFull}
                      className="w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3 rounded-xl disabled:opacity-30 disabled:bg-slate-300 dark:disabled:bg-zinc-800"
                    >
                      {isFull ? "No Slots Available" : "Join Batch & Get WhatsApp Link"}
                    </button>
                 </div>
               );
             })}
          </div>
        )}

      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showModal && selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
             <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl">
                <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-1">Student Details</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium">Verify your student identity to join the {selectedBatch.area} batch.</p>
                
                <form onSubmit={submitJoin} className="flex flex-col gap-4">
                   <input required type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500" />
                   <input required type="text" placeholder="College Name" value={college} onChange={e=>setCollege(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500" />
                   <input required type="text" placeholder="USN / Roll Number" value={usn} onChange={e=>setUsn(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500" />
                   <input required type="tel" placeholder="Phone Number (WhatsApp)" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500" />
                   
                   <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl mt-2 shadow-lg disabled:opacity-50">
                     {isSubmitting ? "Joining..." : "Join & Open WhatsApp"}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

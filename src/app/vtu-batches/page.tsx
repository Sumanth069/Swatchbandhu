"use client";

import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { GraduationCap, MapPin, Calendar, ArrowLeft, Users, CheckCircle2, ChevronDown, Globe, Lightbulb, Award, HeartHandshake, Map, MessageSquare, Camera, Sparkles } from "lucide-react";
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

  // Refs for scrolling
  const whyJoinRef = useRef<HTMLElement | null>(null);
  const howItWorksRef = useRef<HTMLElement | null>(null);
  const batchesRef = useRef<HTMLElement | null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

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

      window.location.href = selectedBatch.whatsappLink;
    } catch (err) {
      console.error(err);
      alert("Failed to join batch.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-zinc-950 transition-colors relative overflow-x-hidden">
      
      {/* Sticky Header */}
      <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center gap-4 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50 shadow-sm">
        <button onClick={() => router.push("/")} className="hover:bg-slate-100 dark:hover:bg-zinc-800 p-2 rounded-full transition text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
        <h1 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
           <GraduationCap className="text-emerald-500" /> VTU Hub
        </h1>
        <button onClick={() => scrollToSection(batchesRef)} className="ml-auto bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 active:scale-95 transition shadow-md">
           View Batches
        </button>
      </div>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 py-20 overflow-hidden text-center z-10">
         {/* Background Decor */}
         <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/students_cleanup_hero.png" alt="Students Cleanup Hero" className="w-full h-full object-cover opacity-[0.15] dark:opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-slate-50/80 to-slate-50 dark:from-zinc-950/50 dark:via-zinc-950/80 dark:to-zinc-950"></div>
         </div>

         <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} className="mb-6 flex flex-wrap justify-center gap-2">
               <span className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">🎓 VTU Activity Points</span>
               <span className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">🏆 Verified Certificates</span>
               <span className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">🤝 Community Driven</span>
               <span className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">🌱 Real Impact</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-black text-5xl md:text-7xl text-slate-900 dark:text-white tracking-tighter leading-tight mb-6">
               Turn Your Weekends <br className="hidden md:block"/> into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Impact 🚀</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 font-medium max-w-2xl mb-8 leading-relaxed">
               Join SwatchBandhu Cleanup Batches, Meet Like-minded People, Earn Certificates & Make Your City Proud.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200/90 text-sm font-bold px-5 py-3 rounded-2xl mb-10 shadow-sm">
               💡 Pro Tip: Come in your own groups so that it would be easy to coordinate!
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <button onClick={() => scrollToSection(whyJoinRef)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto border border-transparent">
                  WHY JOIN
               </button>
               <button onClick={() => scrollToSection(howItWorksRef)} className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-black px-8 py-4 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all w-full sm:w-auto">
                  HOW IT WORKS
               </button>
            </motion.div>
         </div>

         <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 text-slate-400 dark:text-zinc-600">
            <ChevronDown size={32} />
         </motion.div>
      </section>

      {/* SECTION 2: WHY JOIN */}
      <section ref={whyJoinRef} className="py-24 px-6 relative z-20">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="font-black text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight">Why Students Love SwatchBandhu ❤️</h2>
               <p className="text-slate-500 dark:text-zinc-400 text-lg font-medium">It is more than just picking up trash. It is a movement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
               <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col gap-4 group transition-all">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Globe size={28} /></div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Be part of something bigger than yourself</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">Contribute directly to the cleanliness and health of your local environment.</p>
               </motion.div>

               <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col gap-4 group transition-all">
                  <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><Lightbulb size={28} /></div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Not just cleaning — awareness + teamwork</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">Develop leadership skills and raise ecological awareness in your community.</p>
               </motion.div>

               <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col gap-4 group transition-all">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><Award size={28} /></div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Earn official activity points (VTU / AICTE)</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">Get verified digital certificates that fulfill your mandatory academic requirements.</p>
               </motion.div>

               <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col gap-4 group transition-all">
                  <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform"><HeartHandshake size={28} /></div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Meet new people & build real connections</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">Network with students from other colleges and form lifelong friendships.</p>
               </motion.div>
            </div>

            <div className="text-center">
               <button onClick={() => scrollToSection(batchesRef)} className="bg-emerald-500 text-white font-black text-lg px-12 py-5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3">
                  Join a Batch Now <ArrowLeft className="rotate-180" />
               </button>
            </div>
         </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section ref={howItWorksRef} className="py-24 px-6 bg-slate-900 dark:bg-zinc-900 relative z-20 text-white overflow-hidden">
         {/* Background Decor */}
         <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none hidden lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/students_cleanup_journey.png" alt="Journey" className="w-full h-full object-cover rounded-l-[4rem]" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 dark:from-zinc-900 to-transparent"></div>
         </div>

         <div className="max-w-5xl mx-auto relative z-10">
            <h2 className="font-black text-4xl md:text-5xl mb-4 tracking-tight">Your Journey with SwatchBandhu 🚀</h2>
            <p className="text-slate-400 text-lg font-medium mb-16">Five simple steps to making a difference.</p>

            <div className="flex flex-col gap-8 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
               
               {/* Step 1 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 text-emerald-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10">
                     <Map size={24} />
                  </div>
                  <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-3xl group-hover:bg-slate-800 transition-colors">
                     <div className="text-emerald-400 font-bold text-sm mb-1 uppercase tracking-wider">Step 1</div>
                     <h3 className="font-bold text-2xl mb-2">Join a Batch</h3>
                     <p className="text-slate-400 font-medium leading-relaxed">Pick a location near you from the Active Batches list below and reserve your spot.</p>
                  </div>
               </div>

               {/* Step 2 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 text-blue-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10">
                     <MessageSquare size={24} />
                  </div>
                  <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-3xl group-hover:bg-slate-800 transition-colors">
                     <div className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wider">Step 2</div>
                     <h3 className="font-bold text-2xl mb-2">Get Connected</h3>
                     <p className="text-slate-400 font-medium leading-relaxed">Instantly join a WhatsApp group with your team to coordinate timings and travel plans.</p>
                  </div>
               </div>

               {/* Step 3 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 text-amber-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10">
                     <Users size={24} />
                  </div>
                  <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-3xl group-hover:bg-slate-800 transition-colors">
                     <div className="text-amber-400 font-bold text-sm mb-1 uppercase tracking-wider">Step 3</div>
                     <h3 className="font-bold text-2xl mb-2">Show Up & Take Action</h3>
                     <p className="text-slate-400 font-medium leading-relaxed">Meet your batch at the designated spot, clean the area, collaborate, and enjoy the process.</p>
                  </div>
               </div>

               {/* Step 4 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 text-pink-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10">
                     <Camera size={24} />
                  </div>
                  <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-3xl group-hover:bg-slate-800 transition-colors">
                     <div className="text-pink-400 font-bold text-sm mb-1 uppercase tracking-wider">Step 4</div>
                     <h3 className="font-bold text-2xl mb-2">Capture & Upload</h3>
                     <p className="text-slate-400 font-medium leading-relaxed">Upload before/after images on the SwatchBandhu app to digitally verify the cleanup using AI.</p>
                  </div>
               </div>

               {/* Step 5 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 border-4 border-slate-900 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 shadow-emerald-500/30">
                     <Sparkles size={24} />
                  </div>
                  <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-slate-800/50 backdrop-blur-sm border border-emerald-500/30 p-6 rounded-3xl group-hover:bg-slate-800 transition-colors relative overflow-hidden">
                     <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                     <div className="text-emerald-400 font-bold text-sm mb-1 uppercase tracking-wider relative z-10">Step 5</div>
                     <h3 className="font-bold text-2xl mb-2 relative z-10">Earn Rewards & Certificate</h3>
                     <p className="text-slate-300 font-medium leading-relaxed relative z-10">Get verified points added to your profile and receive official recognition for your work.</p>
                  </div>
               </div>
            </div>

            <div className="mt-16 text-center md:text-left">
               <button onClick={() => scrollToSection(batchesRef)} className="bg-white text-slate-900 font-black text-lg px-12 py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3">
                  Browse Active Batches <ArrowLeft className="rotate-180" />
               </button>
            </div>
         </div>
      </section>

      {/* SECTION 4: ACTIVE BATCHES */}
      <section ref={batchesRef} className="py-24 px-6 relative z-20">
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="font-black text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight">Active Batches</h2>
               <p className="text-slate-500 dark:text-zinc-400 text-lg font-medium">Find a cleanup drive near you and secure your spot.</p>
            </div>

            {loading ? (
               <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-500"></div>
               </div>
            ) : batches.length === 0 ? (
               <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                     <Calendar size={32} />
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-2">No Active Batches</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">There are currently no cleanup drives scheduled. Check back later!</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {batches.map(batch => {
                     const membersCount = batch.currentMembers?.length || 0;
                     const isFull = membersCount >= batch.maxCapacity;
                     const vacancies = batch.maxCapacity - membersCount;

                     return (
                        <div key={batch.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 flex flex-col gap-6 hover:-translate-y-1 transition-transform">
                           <div>
                              <div className="flex justify-between items-start mb-2">
                                 <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-tight">{batch.area}</h3>
                                 {!isFull ? (
                                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 border border-emerald-200 dark:border-emerald-800">{vacancies} Left</span>
                                 ) : (
                                    <span className="bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 border border-rose-200 dark:border-rose-800">Full</span>
                                 )}
                              </div>
                              <p className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {batch.date}</p>
                           </div>
                           
                           <div className="bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="font-bold text-sm text-slate-700 dark:text-zinc-300 flex items-center gap-2"><Users size={16} /> Capacity</span>
                                 <span className="font-bold text-sm text-slate-900 dark:text-white">{membersCount} / {batch.maxCapacity}</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((membersCount / batch.maxCapacity) * 100, 100)}%` }}></div>
                              </div>
                           </div>

                           <button 
                             onClick={() => handleJoinClick(batch)}
                             disabled={isFull}
                             className={`w-full font-black py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isFull ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:opacity-90'}`}
                           >
                             {isFull ? "No Slots Available" : "Join Batch"}
                           </button>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </section>

      {/* Join Modal */}
      <AnimatePresence>
        {showModal && selectedBatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
             <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl border border-slate-200 dark:border-zinc-800">
                <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2">Student Details</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium">Verify your student identity to secure your spot for the <strong className="text-slate-900 dark:text-white">{selectedBatch.area}</strong> batch.</p>
                
                <form onSubmit={submitJoin} className="flex flex-col gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                     <input required type="text" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">College Name</label>
                     <input required type="text" placeholder="e.g. RV College of Engineering" value={college} onChange={e=>setCollege(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">USN / Roll Number</label>
                     <input required type="text" placeholder="1RV21CS001" value={usn} onChange={e=>setUsn(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">WhatsApp Number</label>
                     <input required type="tel" placeholder="+91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors" />
                   </div>
                   
                   <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl mt-4 shadow-xl shadow-emerald-500/20 disabled:opacity-50 hover:bg-emerald-600 active:scale-95 transition-all">
                     {isSubmitting ? "Securing Spot..." : "Join & Open WhatsApp"}
                   </button>
                   <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-500 dark:text-zinc-400 font-bold py-3 mt-1 hover:text-slate-900 dark:hover:text-white transition-colors">
                     Cancel
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

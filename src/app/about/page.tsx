"use client";

import { motion } from "framer-motion";
import { ArrowLeft, HeartHandshake, Shield, Sparkles, Code2, Users, Mail, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedTagline from "@/components/AnimatedTagline";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-zinc-950 pb-24 md:pb-12 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-4 py-3 flex items-center gap-4 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 transition-colors duration-300">
        <button onClick={() => router.back()} className="text-slate-900 dark:text-zinc-50 hover:bg-slate-100 dark:hover:bg-zinc-900 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50 tracking-tight leading-none">
            About Us
          </h1>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-slate-900 dark:bg-zinc-100 rounded-[2rem] p-8 md:p-10 text-white dark:text-zinc-900 shadow-xl relative overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-2xl shadow-sm border border-slate-700 dark:border-zinc-300 bg-white dark:bg-zinc-900 mb-6" />
          
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">SwachBandhu</h2>
          <div className="text-emerald-400 dark:text-emerald-600 font-bold tracking-widest uppercase text-xs mb-6">
            <AnimatedTagline />
          </div>
          
          <p className="text-slate-300 dark:text-zinc-600 font-medium leading-relaxed text-lg">
            Empowering citizens to take charge of their city&apos;s cleanliness. We bridge the gap between civic bodies and local communities through AI-verified reporting and transparent tracking.
          </p>
        </motion.div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm"
          >
             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
               <Shield size={24} />
             </div>
             <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Transparency</h3>
             <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
               Every report is tracked on a public map. You can see exactly what gets fixed and when.
             </p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm"
          >
             <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
               <HeartHandshake size={24} />
             </div>
             <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Community Driven</h3>
             <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
               Bringing together passionate citizens, college students, and authorities to build a cleaner future.
             </p>
          </motion.div>
        </div>

        {/* Team Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm mt-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-500 rounded-xl">
               <Code2 size={20} />
            </div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white">The Creators</h3>
          </div>
          
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed font-medium mb-6">
            SwachBandhu was developed by a dedicated team of student engineers passionate about using cutting-edge technology for social impact.
          </p>

          <div className="flex flex-col gap-4">
            {/* KP Sumanth */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300">
                    KP
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white">KP Sumanth</h4>
                   <p className="text-xs font-bold text-emerald-500 tracking-wider uppercase mt-0.5">Co-Founder & Developer</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 pl-16 sm:pl-0">
                 <a href="mailto:kpsumanth212@gmail.com" className="p-2 bg-white dark:bg-zinc-900 text-slate-400 hover:text-red-500 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors" title="Email Sumanth">
                   <Mail size={16} />
                 </a>
                 <a href="https://kp-portfolio212.vercel.app/" target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-zinc-900 text-slate-400 hover:text-blue-500 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors" title="View Portfolio">
                   <Globe size={16} />
                 </a>
               </div>
            </div>
            
            {/* Pranav SP */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300">
                    SP
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white">Pranav SP</h4>
                   <p className="text-xs font-bold text-emerald-500 tracking-wider uppercase mt-0.5">Co-Founder & Developer</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 pl-16 sm:pl-0">
                 <a href="mailto:sppranav2005@gmail.com" className="p-2 bg-white dark:bg-zinc-900 text-slate-400 hover:text-red-500 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors" title="Email Pranav">
                   <Mail size={16} />
                 </a>
                 <a href="https://portfolio-six-zeta-e6o67xze8y.vercel.app/" target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-zinc-900 text-slate-400 hover:text-blue-500 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors" title="View Portfolio">
                   <Globe size={16} />
                 </a>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-6 mb-4">
          <p className="text-sm font-bold text-slate-400 dark:text-zinc-500 flex items-center justify-center gap-1.5">
            Built with <Sparkles size={14} className="text-yellow-500" /> for Bengaluru
          </p>
        </div>

      </div>
    </div>
  );
}

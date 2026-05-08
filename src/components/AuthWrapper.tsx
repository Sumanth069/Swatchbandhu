"use client";

import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase/client";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Auth failed", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-slate-50">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-[100dvh] bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
         {/* Background Elements */}
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"></div>

         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-3xl text-white shadow-2xl shadow-emerald-500/30 mb-8"
         >
           <Trash2 size={48} strokeWidth={2} />
         </motion.div>

         <motion.h1 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="text-4xl font-black text-white tracking-tight mb-2"
         >
           Swatchbandhu
         </motion.h1>
         
         <motion.p 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-slate-400 font-medium text-lg mb-12"
         >
           Namma Ooru, Namma Kasa
         </motion.p>

         <motion.button
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.3 }}
           onClick={handleGoogleSignIn}
           className="bg-white text-slate-900 font-bold text-lg px-8 py-4 rounded-full shadow-xl flex items-center gap-3 hover:bg-slate-50 transition transform active:scale-95 w-full max-w-sm justify-center"
         >
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
           Continue with Google
         </motion.button>
      </div>
    );
  }

  return <>{children}</>;
}

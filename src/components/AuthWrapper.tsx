"use client";

import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase/client";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, User } from "firebase/auth";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";

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
      // Always use popup. signInWithRedirect fails on mobile due to 3rd-party cookie blocking (ITP)
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Auth failed", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert("Failed to sign in: " + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-white dark:bg-zinc-950 transition-colors">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-zinc-800 border-t-slate-900 dark:border-t-zinc-100"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-[100dvh] bg-white dark:bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden p-6 text-center transition-colors">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="bg-slate-900 dark:bg-zinc-100 p-4 rounded-3xl text-white dark:text-zinc-900 shadow-sm mb-8"
         >
           <Sprout size={48} strokeWidth={2.5} />
         </motion.div>

         <motion.h1 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="text-4xl font-black text-slate-900 dark:text-zinc-50 tracking-tight mb-2"
         >
           SwachBandu
         </motion.h1>
         
         <motion.p 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-slate-500 dark:text-zinc-400 font-medium text-lg mb-12"
         >
           Namma Ooru, Namma Kasa
         </motion.p>

         <motion.button
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.3 }}
           onClick={handleGoogleSignIn}
           className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-50 font-bold text-lg px-6 py-4 rounded-full shadow-sm flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-zinc-800 transition transform active:scale-[0.98] w-full max-w-sm"
         >
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6 shrink-0" />
           <span className="whitespace-nowrap">Continue with Google</span>
         </motion.button>
      </div>
    );
  }

  return <>{children}</>;
}

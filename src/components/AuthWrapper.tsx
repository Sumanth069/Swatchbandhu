"use client";

import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase/client";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, User } from "firebase/auth";
import { motion } from "framer-motion";
import AnimatedTagline from "./AnimatedTagline";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check local storage for quick cached user to prevent showing login screen
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem("sb_user") : null;
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
      } catch (e) {}
    }

    // Upfront Permissions Request
    if (typeof navigator !== 'undefined') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => console.log("Location permission verified"),
          () => console.warn("Location permission not granted upfront"),
          { timeout: 5000 }
        );
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            console.log("Camera permission verified");
          })
          .catch(err => {
            console.warn("Camera permission not granted upfront", err);
          });
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("sb_user", JSON.stringify({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        }));
      } else {
        setUser(null);
        localStorage.removeItem("sb_user");
      }
      setLoading(false);
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      // Always use popup. signInWithRedirect fails on mobile due to 3rd-party cookie blocking (ITP)
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Auth failed", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert("Failed to sign in: " + error.message);
      }
      setIsAuthenticating(false); // Only reset if failed. If success, onAuthStateChanged will handle it.
    }
  };

  if (loading || isAuthenticating) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-white dark:bg-zinc-950 transition-colors gap-4">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-zinc-800 border-t-emerald-500"></div>
         {isAuthenticating && <p className="text-slate-500 font-medium animate-pulse">Authenticating...</p>}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-[100dvh] bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden p-6 text-center transition-colors">
         {/* Background Decoration */}
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

         <motion.div 
           initial={{ scale: 0.8, opacity: 0, y: 20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           transition={{ type: "spring", damping: 20 }}
           className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl mb-8 relative border border-slate-200/50 dark:border-zinc-800/50"
         >
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="/logo.png" alt="SwachBandhu Logo" className="w-full h-full object-cover" />
         </motion.div>

         <motion.h1 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="text-4xl md:text-5xl font-black text-slate-900 dark:text-zinc-50 tracking-tight mb-3"
         >
           SwachBandhu
         </motion.h1>
         
         <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-slate-500 dark:text-zinc-400 font-bold text-xl mb-12 uppercase tracking-widest"
         >
           <AnimatedTagline />
         </motion.div>

         <motion.button
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.3 }}
           onClick={handleGoogleSignIn}
           className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-50 font-bold text-lg px-8 py-4 rounded-[2rem] shadow-xl flex items-center justify-center gap-4 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all transform active:scale-[0.98] w-full max-w-sm relative overflow-hidden group"
         >
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6 shrink-0 relative z-10" />
           <span className="whitespace-nowrap relative z-10">Sign in with Google</span>
         </motion.button>
      </div>
    );
  }

  return <>{children}</>;
}

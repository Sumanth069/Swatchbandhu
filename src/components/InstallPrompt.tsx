"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error("SW registration failed", err));
    }

    // Capture install prompt for Android/Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show prompt if they haven't dismissed it recently
      if (!localStorage.getItem("pwa_prompt_dismissed")) {
         setTimeout(() => setShowPrompt(true), 3000);
      }
    });

    // If iOS and not in standalone mode (not installed yet)
    if (isIosDevice && !window.matchMedia('(display-mode: standalone)').matches) {
       if (!localStorage.getItem("pwa_prompt_dismissed")) {
          setTimeout(() => setShowPrompt(true), 3000);
       }
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-zinc-800"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 p-1.5 rounded-full transition"
          >
             <X size={16} />
          </button>
          
          <div className="flex items-center gap-4 mb-4 pr-6">
             <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-50 leading-tight">Install SwachBandhu</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Get the full native app experience.</p>
             </div>
          </div>

          {isIOS ? (
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 text-sm text-slate-600 dark:text-zinc-300">
              <span className="font-bold text-slate-900 dark:text-zinc-50">iOS Users:</span> Tap <Share size={14} className="inline mx-1 text-blue-500" /> then select <span className="font-bold">"Add to Home Screen"</span>.
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98] shadow-md"
            >
              <Download size={18} className="text-emerald-500" /> Install App Now
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

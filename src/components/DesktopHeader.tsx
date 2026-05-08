"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export default function DesktopHeader() {
  const [showQRModal, setShowQRModal] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Map" },
    { href: "/feed", label: "Feed" },
    { href: "/vtu-batches", label: "Batches" },
    { href: "/rewards", label: "Rewards" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <>
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-[60] p-6 pointer-events-none">
        <div className="pointer-events-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-sm dark:shadow-none rounded-2xl p-3 px-5 flex items-center justify-between border border-slate-200 dark:border-zinc-800 w-full max-w-7xl mx-auto transition-colors duration-300">
          
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <div className="bg-slate-900 dark:bg-zinc-100 p-2.5 rounded-xl text-white dark:text-zinc-900 transition-transform active:scale-95 duration-200">
              <Sprout size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none text-slate-900 dark:text-zinc-50 tracking-tight mb-0.5">SwachBandu</h1>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold leading-none uppercase tracking-widest">Namma Ooru, Namma Kasa</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 font-semibold text-sm">
              {links.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? "text-slate-900 dark:text-zinc-50" 
                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-slate-100 dark:bg-zinc-800 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800"></div>

            <ThemeToggle />

            <button 
              onClick={() => setShowQRModal(true)}
              className="bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-zinc-300 transition-colors active:scale-95"
            >
              <Camera size={16} /> Report
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQRModal && (
          <div className="hidden md:flex fixed inset-0 z-[70] items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-zinc-800 relative overflow-hidden"
            >
                <div className="flex justify-end mb-2">
                  <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 bg-slate-100 dark:bg-zinc-800 p-2 rounded-full transition">
                    <X size={16} />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mb-2 tracking-tight">Report from Phone</h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
                  Reporting waste requires camera and GPS access. Scan this QR code to open Swatchbandhu on your mobile device.
                </p>
                
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm inline-block mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://swatchbandhu.vercel.app&margin=0" alt="QR Code" className="w-48 h-48" />
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

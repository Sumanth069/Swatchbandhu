"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Trash2, AlertCircle, RefreshCw, MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedTagline from "@/components/AnimatedTagline";

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-emerald-600">
      <RefreshCw className="h-8 w-8 animate-spin mb-4" />
      <p className="font-medium animate-pulse">Loading City Map...</p>
    </div>
  )
});

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const locateUser = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
        },
        () => {
          alert("Could not get location quickly. Please ensure GPS is enabled.");
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 } // Fast cached location
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "swatchbandhu_v2_reports"), orderBy("reportedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative w-full h-[100dvh]">
      {/* Mobile Map Tagline Overlay */}
      <div className="absolute left-4 top-4 z-40 md:hidden flex items-center gap-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        <div className="flex flex-col justify-center">
          <span className="text-xs font-black text-slate-900 dark:text-zinc-50 leading-none">SwachBandhu</span>
          <div className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase h-4 w-28 relative overflow-hidden flex items-center mt-0.5">
            <AnimatedTagline className="text-emerald-500 font-extrabold text-[10px] w-full" />
          </div>
        </div>
      </div>
      {/* Floating Action Button for Location centering */}
      <div className="absolute right-4 bottom-28 z-40 flex flex-col gap-3 md:bottom-32">
        <button 
          onClick={locateUser}
          disabled={isLocating}
          className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] text-cyan-400 hover:bg-slate-800 transition border border-indigo-500/30 disabled:opacity-50"
        >
          {isLocating ? <RefreshCw size={24} className="animate-spin" /> : <Navigation size={24} fill="currentColor" />}
        </button>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 bg-slate-100 z-0 h-[100dvh] md:h-screen">
        <MapComponent reports={reports} externalCenter={mapCenter} />
      </div>
    </div>
  );
}



"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Trash2, AlertCircle, RefreshCw, MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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



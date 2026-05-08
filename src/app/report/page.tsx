"use client";

import React, { useState, useRef, useEffect } from "react";

import { Camera, MapPin, UploadCloud, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ScanSearch } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ReportPage() {
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    fetchLocation();
    return () => stopCamera();
  }, []);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => console.warn("Geolocation denied")
      );
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Play interrupted", e));
        }
      }, 100);
    } catch (err) {
      console.warn("Unable to access camera, fallback to input.", err);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoPreview(dataUrl);
        canvas.toBlob((blob) => {
           if (blob) {
             const file = new File([blob], 'before.jpg', { type: 'image/jpeg' });
             setPhotoFile(file);
             analyzeImage(file);
           }
        }, 'image/jpeg', 0.8);
      }
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setAiAnalysis(null);
    startCamera();
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error("AI Analysis Failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!photoPreview || !location) {
      alert("Please ensure photo is taken and location is enabled.");
      return;
    }
    
    if (aiAnalysis && !aiAnalysis.isGarbage) {
       alert("AI Analysis detected this is not garbage. Please take a clearer picture.");
       return;
    }

    setIsUploading(true);
    try {
      await addDoc(collection(db, "swatchbandhu_v2_reports"), {
        imageUrl: photoPreview,
        location: {
          lat: location.lat,
          lon: location.lon,
          name: "Reported via App"
        },
        type: aiAnalysis?.type || "mixed",
        estimatedVolume: aiAnalysis?.estimatedVolume || 20,
        status: "active",
        reportedAt: new Date().toISOString(),
        source: "Citizen App",
      });
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit report.");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[100dvh] p-6 text-center bg-white"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
        >
          <CheckCircle2 size={56} className="text-emerald-500" />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Report Verified!</h2>
        <p className="text-slate-500 mt-3 font-medium text-lg">Thank you for making your city cleaner.</p>
        <div className="mt-8 bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl font-bold text-xl flex items-center gap-2 border border-amber-200">
           +50 Points Awarded
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-[100dvh] bg-slate-50/50"
    >
      <div className="bg-white/80 backdrop-blur-xl px-4 py-4 flex items-center gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative z-10 shrink-0 border-b border-slate-100">
        <button onClick={() => router.back()} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">Report Garbage</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-6">
        
        {/* Camera / Preview Area */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Camera size={18} className="text-emerald-500" />
            1. Live Capture
          </h2>
          
          <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-inner">
            {!photoPreview ? (
               <>
                 {isCameraOpen ? (
                    <>
                      <video ref={videoRef} className="object-cover w-full h-full" playsInline autoPlay muted />
                      <button 
                        onClick={handleCapture}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-600 shadow-xl transition transform active:scale-95 flex items-center justify-center"
                      >
                         <Camera size={24} className="text-white" />
                      </button>
                    </>
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm p-4 text-center">
                       Camera access denied. Please enable permissions.
                    </div>
                 )}
                 <canvas ref={canvasRef} className="hidden" />
               </>
            ) : (
               <>
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
                 <button 
                   onClick={handleRetake}
                   className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-lg flex items-center gap-1 hover:bg-white transition"
                 >
                   <RefreshCw size={14} /> Retake
                 </button>
               </>
            )}
          </div>
        </div>

        {/* AI Analysis Overlay */}
        {photoPreview && (
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <ScanSearch size={18} className="text-emerald-500" />
              2. AI Forensic Analysis
            </h2>
            {isAnalyzing ? (
               <div className="flex items-center justify-center gap-3 text-slate-500 p-4">
                  <RefreshCw className="animate-spin text-emerald-500" size={20} />
                  <span className="text-sm font-medium animate-pulse">Analyzing waste density...</span>
               </div>
            ) : aiAnalysis ? (
               aiAnalysis.isGarbage ? (
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                       <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Estimated Vol</p>
                       <p className="text-xl font-black text-emerald-600">{aiAnalysis.estimatedVolume} kg</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                       <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Waste Type</p>
                       <p className="text-lg font-bold text-blue-600 capitalize">{aiAnalysis.type}</p>
                    </div>
                 </div>
               ) : (
                 <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex items-start gap-2 text-red-700">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p className="text-sm font-medium">AI indicates this is not waste. Please take a clearer photo of the actual garbage pile.</p>
                 </div>
               )
            ) : null}
          </div>
        )}

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-500" />
            3. Location Tagging
          </h2>
          {location ? (
            <div className="bg-slate-50 text-emerald-700 p-3 rounded-2xl text-sm font-medium flex items-center justify-between border border-emerald-100">
              <span className="flex items-center gap-2"><CheckCircle2 size={18} /> GPS Locked</span>
              <button onClick={fetchLocation} className="text-slate-400 hover:text-emerald-600"><RefreshCw size={16} /></button>
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-2xl text-sm font-medium flex items-center gap-2">
              <RefreshCw className="animate-spin shrink-0" size={16} /> Waiting for GPS...
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!photoPreview || !location || isUploading || isAnalyzing || (aiAnalysis && !aiAnalysis.isGarbage)}
          className="mt-4 w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-[2rem] shadow-xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none transition transform active:scale-95"
        >
          {isUploading ? <RefreshCw className="animate-spin" size={24} /> : <UploadCloud size={24} />}
          {isUploading ? "Transmitting..." : "Submit Report"}
        </button>
      </div>
    </motion.div>
  );
}

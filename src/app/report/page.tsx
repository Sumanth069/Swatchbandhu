"use client";

import React, { useState, useRef, useEffect } from "react";

import { Camera, MapPin, UploadCloud, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ScanSearch, Shield } from "lucide-react";
import { db, auth } from "@/lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ReportPage() {
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Privacy State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(false);

  // Zoom and Camera Facing states
  const [zoom, setZoom] = useState(1);
  const [hasHardwareZoom, setHasHardwareZoom] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera(facingMode);
    fetchLocation();
    return () => stopCamera();
  }, []);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
             const data = await res.json();
             setLocation({ lat, lon, name: data.display_name?.split(",").slice(0, 2).join(",") || "Bengaluru Urban" });
          } catch (err) {
             console.warn("Reverse geocoding failed", err);
             setLocation({ lat, lon, name: "Bengaluru Urban" });
          }
        },
        () => console.warn("Geolocation denied")
      );
    }
  };

  const startCamera = async (mode: 'environment' | 'user' = 'environment') => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setIsCameraOpen(true);
      setFacingMode(mode);
      setHasHardwareZoom(false);
      setZoom(1);
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Play interrupted", e));

          // Check hardware zoom support
          const track = stream.getVideoTracks()[0];
          if (track && typeof track.getCapabilities === 'function') {
            const capabilities = track.getCapabilities() as any;
            if (capabilities && capabilities.zoom) {
              setHasHardwareZoom(true);
              try {
                await track.applyConstraints({
                  advanced: [{ zoom: capabilities.zoom.min || 1 }]
                } as any);
              } catch (e) {
                console.warn("Init zoom failed", e);
              }
            }
          }
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

  const applyZoom = async (targetZoom: number) => {
    setZoom(targetZoom);
    if (hasHardwareZoom && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = track.getCapabilities() as any;
          if (capabilities && capabilities.zoom) {
            const min = capabilities.zoom.min || 1;
            const max = capabilities.zoom.max || 3;
            const target = targetZoom === 1 ? min : min + (max - min) / 2;
            await track.applyConstraints({
              advanced: [{ zoom: target }]
            } as any);
          }
        } catch (e) {
          console.warn("Failed to apply hardware zoom", e);
        }
      }
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };



  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (!hasHardwareZoom && zoom > 1) {
          const sWidth = video.videoWidth / zoom;
          const sHeight = video.videoHeight / zoom;
          const sx = (video.videoWidth - sWidth) / 2;
          const sy = (video.videoHeight - sHeight) / 2;
          ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        
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
    startCamera(facingMode);
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
          name: location.name || "Bengaluru Urban"
        },
        type: aiAnalysis?.type || "mixed",
        estimatedVolume: aiAnalysis?.estimatedVolume || 20,
        status: "active",
        reportedAt: new Date().toISOString(),
        source: "Citizen App",
        userId: isAnonymous ? "anonymous" : (auth.currentUser?.uid || "unknown"),
        userName: isAnonymous ? "Anonymous Hero" : (auth.currentUser?.displayName || "Citizen Hero"),
        commentsDisabled: commentsDisabled
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
      {/* Full-screen Camera overlay when capturing */}
      {isCameraOpen && !photoPreview && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden">
          {/* Video stream background */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover transition-transform duration-200" 
              style={!hasHardwareZoom && zoom > 1 ? { transform: `scale(${zoom})`, transformOrigin: 'center' } : {}}
              playsInline 
              autoPlay 
              muted 
            />
          </div>

          {/* Top Bar Overlay */}
          <div className="relative z-10 w-full bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
            <button 
              onClick={() => { stopCamera(); setIsCameraOpen(false); }} 
              className="text-white bg-black/40 hover:bg-black/60 p-2.5 rounded-full backdrop-blur-md transition active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-white font-extrabold text-lg tracking-tight drop-shadow-md">Capture Garbage</h2>
            <div className="w-10 h-10" />
          </div>

          {/* Center Target Frame (HUD guide) */}
          <div className="relative z-10 pointer-events-none flex-1 flex items-center justify-center p-8">
            <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative flex items-center justify-center">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-md"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-md"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-md"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-md"></div>
              
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Align waste here</span>
            </div>
          </div>

          {/* Bottom Bar Overlay */}
          <div className="relative z-10 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col items-center gap-6 pb-safe-bottom">
            {/* Zoom Selector (1x & 2x options) */}
            <div className="flex gap-2 bg-black/60 p-1 rounded-full border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => applyZoom(1)}
                className={`text-xs font-black px-4 py-2 rounded-full transition active:scale-95 ${zoom === 1 ? 'bg-emerald-500 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
              >
                1X
              </button>
              <button 
                onClick={() => applyZoom(2)}
                className={`text-xs font-black px-4 py-2 rounded-full transition active:scale-95 ${zoom === 2 ? 'bg-emerald-500 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
              >
                2X
              </button>
            </div>

            <div className="flex items-center justify-between w-full max-w-xs">
              <div className="w-16" />

              <button 
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white/30 p-1 bg-transparent transition active:scale-90 hover:scale-105"
              >
                <div className="w-full h-full rounded-full bg-emerald-500 hover:bg-emerald-600 transition flex items-center justify-center">
                  <Camera size={28} className="text-white" />
                </div>
              </button>

              <button 
                onClick={toggleCameraFacing}
                className="flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition w-16"
              >
                <div className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
                  <RefreshCw size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Flip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl px-4 py-4 flex items-center gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative z-10 shrink-0 border-b border-slate-100">
        <button onClick={() => router.back()} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">Report Garbage</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-32">
        
        {/* Camera / Preview Area */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Camera size={18} className="text-emerald-500" />
            1. Captured Photo
          </h2>
          
          <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {photoPreview ? (
               <>
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
                 <button 
                   onClick={handleRetake}
                   className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-lg flex items-center gap-1 hover:bg-white transition"
                 >
                   <RefreshCw size={14} /> Retake / Capture
                 </button>
               </>
            ) : (
               <div className="flex flex-col items-center gap-4 p-6 text-center">
                 <button 
                   onClick={() => startCamera(facingMode)}
                   className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2"
                 >
                   <Camera size={20} /> Open Camera
                 </button>
               </div>
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
              <span className="flex items-center gap-2"><CheckCircle2 size={18} /> GPS Locked <span className="text-emerald-900 ml-1 text-xs">{location.name} ({location.lat.toFixed(6)}, {location.lon.toFixed(6)})</span></span>
              <button onClick={fetchLocation} className="text-slate-400 hover:text-emerald-600"><RefreshCw size={16} /></button>
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-2xl text-sm font-medium flex items-center gap-2">
              <RefreshCw className="animate-spin shrink-0" size={16} /> Waiting for GPS...
            </div>
          )}
        </div>

        {/* Privacy Toggles */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3">
           <h2 className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
             <Shield size={18} className="text-slate-500" />
             Privacy Controls
           </h2>
           <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-600">Post Anonymously</span>
              <input type="checkbox" checked={isAnonymous} onChange={e=>setIsAnonymous(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded" />
           </label>
           <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-600">Turn off Comments</span>
              <input type="checkbox" checked={commentsDisabled} onChange={e=>setCommentsDisabled(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded" />
           </label>
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
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </motion.div>
  );
}

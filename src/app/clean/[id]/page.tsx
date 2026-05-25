"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, MapPin, UploadCloud, ArrowLeft, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CleanVerifyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [reportData, setReportData] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Zoom & camera facing states
  const [zoom, setZoom] = useState(1);
  const [hasHardwareZoom, setHasHardwareZoom] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Desktop detection
  const [isDesktop, setIsDesktop] = useState(false);
  const [qrUrl, setQrUrl] = useState("https://www.swachbandhu.site");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      const d = await getDoc(doc(db, "swatchbandhu_v2_reports", id as string));
      if (d.exists()) {
        setReportData(d.data());
      }
    };
    fetchReport();
    
    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    setQrUrl(window.location.href);

    startCamera(facingMode);

    return () => {
      stopCamera();
      window.removeEventListener("resize", checkDesktop);
    };
  }, [id]);

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
      console.warn("Unable to access camera", err);
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
             const file = new File([blob], 'after.jpg', { type: 'image/jpeg' });
             setPhotoFile(file);
           }
        }, 'image/jpeg', 0.8);
      }
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setErrorMsg("");
    startCamera(facingMode);
  };

  const handleVerify = async () => {
    if (!photoFile || !reportData?.imageUrl) return;
    
    setIsAnalyzing(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append('image', photoFile);
    formData.append('originalImageUrl', reportData.imageUrl);
    formData.append('reportId', id as string);

    try {
      const res = await fetch('/api/clean', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
         // Update firebase document
         await updateDoc(doc(db, "swatchbandhu_v2_reports", id as string), {
           status: "resolved",
           resolvedAt: new Date().toISOString(),
           resolvedImageUrl: photoPreview,
           cleanerReason: data.aiReason
         });
         setSuccess(true);
         setTimeout(() => router.push("/"), 3000);
      } else {
         setErrorMsg(data.error || "AI Verification Failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection to AI Engine failed.");
    } finally {
      setIsAnalyzing(false);
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
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Verified by AI!</h2>
        <p className="text-slate-500 mt-3 font-medium text-lg">Incredible work! The AI verified the location is pristine.</p>
        <div className="mt-8 bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl font-bold text-xl flex items-center gap-2 border border-amber-200">
           +500 Points Awarded
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">


      {/* Full-screen Camera overlay when capturing (Mobile only) */}
      {!isDesktop && isCameraOpen && !photoPreview && (
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
            <h2 className="text-white font-extrabold text-lg tracking-tight drop-shadow-md">Capture Cleanup</h2>
            <div className="w-10 h-10" />
          </div>

          {/* Center Target Frame (HUD guide) */}
          <div className="relative z-10 pointer-events-none flex-1 flex items-center justify-center p-8">
            <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative flex items-center justify-center">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-md"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-md"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-md"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-md"></div>
              
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Show cleaned area</span>
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

      {/* Main Header */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-4 py-4 flex items-center gap-3 shadow-sm relative z-10 shrink-0 border-b border-slate-100 dark:border-zinc-800">
        <button onClick={() => router.back()} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 p-2 rounded-full transition active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-extrabold text-xl text-slate-800 dark:text-zinc-150 tracking-tight">Verify Cleanup</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-32">
        
        {/* Location Info & GPS coordinates */}
        {reportData?.location && (
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col gap-1">
             <h2 className="font-semibold text-slate-700 dark:text-zinc-350 mb-1 flex items-center gap-2">
               <MapPin size={18} className="text-emerald-500" />
               Cleanup Location
             </h2>
             <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{reportData.location.name}</p>
             <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
               GPS: {(reportData.location.lat ?? reportData.location.latitude)?.toFixed(6)}, {(reportData.location.lon ?? reportData.location.longitude)?.toFixed(6)}
             </p>
          </div>
        )}

        {/* Desktop View: Show QR Code Modal */}
        {isDesktop ? (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center gap-4">
             <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-2xl">
               <Camera size={28} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-lg">Verify Cleanup on Phone</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
                   Cleanup verification requires camera and GPS access. Scan this QR code to continue on your mobile device.
                </p>
             </div>
             
             <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm inline-block my-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}&margin=0`} alt="QR Code" className="w-44 h-44" />
             </div>
             

          </div>
        ) : (
          /* Mobile Camera & Comparison View */
          <div className="bg-white dark:bg-zinc-900 p-3 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Before</span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <Camera size={14}/> {photoPreview ? "Live Captured" : "Live After"}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 h-48">
               <div className="rounded-2xl overflow-hidden bg-slate-200 dark:bg-zinc-800">
                  {reportData?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reportData.imageUrl} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-500">
                      <RefreshCw className="animate-spin" size={20}/>
                    </div>
                  )}
               </div>
               
               <div className="relative rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
                 {photoPreview ? (
                   <>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
                     <button 
                       onClick={handleRetake}
                       className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-slate-700 flex items-center gap-1"
                     >
                       <RefreshCw size={10} /> Retake
                     </button>
                   </>
                 ) : (
                    <div className="flex flex-col items-center gap-3 p-4 text-center">
                      <button 
                        onClick={() => startCamera(facingMode)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-3 rounded-full shadow-md transition active:scale-95 flex items-center justify-center"
                        title="Open camera"
                      >
                        <Camera size={20} />
                      </button>
                    </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* AI Error display */}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl text-rose-700 dark:text-rose-400 flex items-start gap-3">
             <ShieldAlert className="shrink-0 mt-0.5" size={20} />
             <p className="text-sm font-medium">{errorMsg}</p>
          </motion.div>
        )}

        <button 
          onClick={handleVerify}
          disabled={!photoPreview || isAnalyzing}
          className="mt-auto w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-lg py-4 rounded-[2rem] shadow-xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none transition transform active:scale-95"
        >
          {isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <UploadCloud size={24} />}
          {isAnalyzing ? "AI Verification in Progress..." : "Submit for AI Verification"}
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

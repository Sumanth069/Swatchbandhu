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
    startCamera();
    return () => stopCamera();
  }, [id]);

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
    startCamera();
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
    <div className="flex flex-col h-[100dvh] bg-slate-50">
      <div className="bg-white/80 backdrop-blur-xl px-4 py-4 flex items-center gap-3 shadow-sm relative z-10 shrink-0 border-b border-slate-100">
        <button onClick={() => router.back()} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">Verify Cleanup</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-32">
        
        {/* Dual Camera View */}
        <div className="bg-white p-3 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center px-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before</span>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1"><Camera size={14}/> Live After</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 h-48">
             <div className="rounded-2xl overflow-hidden bg-slate-200">
                {reportData?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reportData.imageUrl} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><RefreshCw className="animate-spin" size={20}/></div>
                )}
             </div>
             
             <div className="relative rounded-2xl overflow-hidden bg-black shadow-inner">
               {!photoPreview ? (
                 <>
                   {isCameraOpen ? (
                     <>
                        <video ref={videoRef} className="object-cover w-full h-full" playsInline autoPlay muted />
                        <button 
                          onClick={handleCapture}
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-white bg-emerald-500 hover:bg-emerald-600 transition flex items-center justify-center z-10"
                        >
                           <Camera size={18} className="text-white" />
                        </button>
                     </>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs p-2 text-center">Camera error</div>
                   )}
                   <canvas ref={canvasRef} className="hidden" />
                 </>
               ) : (
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
               )}
             </div>
          </div>
        </div>

        {/* AI Error display */}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-700 flex items-start gap-3">
             <ShieldAlert className="shrink-0 mt-0.5" size={20} />
             <p className="text-sm font-medium">{errorMsg}</p>
          </motion.div>
        )}

        <button 
          onClick={handleVerify}
          disabled={!photoPreview || isAnalyzing}
          className="mt-auto w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-[2rem] shadow-xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none transition transform active:scale-95"
        >
          {isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <UploadCloud size={24} />}
          {isAnalyzing ? "AI Verification in Progress..." : "Submit for AI Verification"}
        </button>
      </div>
    </div>
  );
}

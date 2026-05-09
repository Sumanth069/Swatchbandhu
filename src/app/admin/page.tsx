"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, query, orderBy, limit, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { Trash2, Shield, Users, Ban, FileText, PlusCircle, CheckCircle, Edit, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = ["kpsumanth212@gmail.com", "sppranav2005@gmail.com"];

export default function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Analytics State
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    uniqueUsers: 0,
    activeBatches: 0
  });

  // VTU Batch State
  const [batchArea, setBatchArea] = useState("");
  const [batchDate, setBatchDate] = useState("");
  const [googleFormLink, setGoogleFormLink] = useState("");
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        fetchData();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Latest 50 Reports for Feed (Performance Optimization)
      const reportsQuery = query(collection(db, "swatchbandhu_v2_reports"), orderBy("reportedAt", "desc"), limit(50));
      const reportsSnap = await getDocs(reportsQuery);
      const reportsData = reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);

      // 2. Fetch Batches
      const batchesSnap = await getDocs(collection(db, "swatchbandhu_batches"));
      const batchesData = batchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBatches(batchesData);

      // 3. Compute Global Analytics (Optimized counting strategy could be used, but for now we fetch all to count if small scale, or just count what we have. Let's fetch all for true counts if needed, or rely on aggregation queries).
      // Since aggregation queries are better: 
      // Workaround for now: Fetch all just for counting, it's fast enough without fetching large images if we just pull metadata, but Firestore pulls whole docs.
      const allReportsSnap = await getDocs(collection(db, "swatchbandhu_v2_reports"));
      let total = 0;
      let resolved = 0;
      const uniqueUserSet = new Set();
      
      allReportsSnap.docs.forEach(doc => {
         const data = doc.data();
         total++;
         if (data.status === "resolved") resolved++;
         if (data.userId && data.userId !== "anonymous") uniqueUserSet.add(data.userId);
      });

      setStats({
        totalReports: total,
        resolvedReports: resolved,
        uniqueUsers: uniqueUserSet.size,
        activeBatches: batchesData.length
      });

    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this report?")) return;
    try {
      await deleteDoc(doc(db, "swatchbandhu_v2_reports", id));
      setReports(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({ ...prev, totalReports: prev.totalReports - 1 }));
    } catch (error) {
      console.error("Error deleting report", error);
    }
  };

  const handleBlockUser = async (userId: string) => {
    alert(`User ${userId} blocked. (Prototype logic)`);
  };

  const handleCreateOrUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchArea || !batchDate || !googleFormLink) return alert("Please fill all fields");

    try {
      if (editingBatchId) {
        await updateDoc(doc(db, "swatchbandhu_batches", editingBatchId), {
          area: batchArea,
          date: batchDate,
          googleFormLink: googleFormLink,
        });
        alert("Batch updated successfully!");
        setEditingBatchId(null);
      } else {
        await addDoc(collection(db, "swatchbandhu_batches"), {
          area: batchArea,
          date: batchDate,
          googleFormLink: googleFormLink,
          createdAt: new Date().toISOString()
        });
        alert("Batch created successfully!");
      }
      setBatchArea("");
      setBatchDate("");
      setGoogleFormLink("");
      fetchData(); // Refresh to show new batch
    } catch (err) {
      console.error("Failed to save batch", err);
      alert("Failed to save batch");
    }
  };

  const handleEditBatch = (batch: any) => {
     setEditingBatchId(batch.id);
     setBatchArea(batch.area);
     setBatchDate(batch.date);
     setGoogleFormLink(batch.googleFormLink || batch.whatsappLink || "");
     window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBatch = async (id: string) => {
     if (!confirm("Are you sure you want to permanently delete this batch?")) return;
     try {
       await deleteDoc(doc(db, "swatchbandhu_batches", id));
       setBatches(prev => prev.filter(b => b.id !== id));
       setStats(prev => ({ ...prev, activeBatches: prev.activeBatches - 1 }));
     } catch (err) {
       console.error("Error deleting batch", err);
     }
  };

  if (loading) {
     return (
        <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-slate-50 gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-500"></div>
           <p className="text-slate-500 font-bold">Loading secure environment...</p>
        </div>
     );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-slate-50 p-6 text-center">
        <Shield size={64} className="text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You do not have administrator privileges to view this page.</p>
        <button onClick={() => router.push("/")} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all">Return Home</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-10 md:py-12 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto w-full">
           <h1 className="font-black text-3xl md:text-4xl flex items-center gap-3">
             <Shield className="text-emerald-400" size={36} /> Command Center
           </h1>
           <p className="text-slate-400 mt-2 font-medium text-lg">Platform metrics, moderation, and VTU batch control.</p>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full -mt-8 md:-mt-10 relative z-10">
        
        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-1 transition-transform hover:-translate-y-1 duration-300">
            <Users size={24} className="text-blue-500 mb-2" />
            <span className="text-3xl font-black text-slate-900">{stats.uniqueUsers}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citizens</span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-1 transition-transform hover:-translate-y-1 duration-300">
            <FileText size={24} className="text-orange-500 mb-2" />
            <span className="text-3xl font-black text-slate-900">{stats.totalReports}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-1 transition-transform hover:-translate-y-1 duration-300">
            <CheckCircle size={24} className="text-emerald-500 mb-2" />
            <span className="text-3xl font-black text-slate-900">{stats.resolvedReports}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cleanups</span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-1 transition-transform hover:-translate-y-1 duration-300">
            <Calendar size={24} className="text-purple-500 mb-2" />
            <span className="text-3xl font-black text-slate-900">{stats.activeBatches}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Batches</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left Column: Batches Management */}
           <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* VTU Batch Form */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                   <PlusCircle size={20} className="text-emerald-500" /> 
                   {editingBatchId ? "Edit Batch" : "Create VTU Batch"}
                </h2>
                <form onSubmit={handleCreateOrUpdateBatch} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Cleanup Area</label>
                    <input type="text" required value={batchArea} onChange={e => setBatchArea(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="e.g. Indiranagar Metro Station" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date & Time</label>
                    <input type="text" required value={batchDate} onChange={e => setBatchDate(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="e.g. Sunday, 10:00 AM" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Google Form Link</label>
                    <input type="url" required value={googleFormLink} onChange={e => setGoogleFormLink(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="https://forms.gle/..." />
                  </div>
                  <div className="flex gap-2 mt-2">
                     <button type="submit" className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition active:scale-95">
                        {editingBatchId ? "Update Batch" : "Create Batch"}
                     </button>
                     {editingBatchId && (
                        <button type="button" onClick={() => { setEditingBatchId(null); setBatchArea(''); setBatchDate(''); setGoogleFormLink(''); }} className="bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 transition active:scale-95">Cancel</button>
                     )}
                  </div>
                </form>
              </div>

              {/* Active Batches List */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                 <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Calendar size={20} className="text-purple-500" /> Active Batches
                 </h2>
                 {batches.length === 0 ? (
                    <p className="text-slate-500 text-sm">No active batches right now.</p>
                 ) : (
                    <div className="flex flex-col gap-3">
                       {batches.map(batch => (
                          <div key={batch.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 relative">
                             <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={() => handleEditBatch(batch)} className="text-slate-400 hover:text-blue-500 transition"><Edit size={16} /></button>
                                <button onClick={() => handleDeleteBatch(batch.id)} className="text-slate-400 hover:text-rose-500 transition"><Trash2 size={16} /></button>
                             </div>
                             <h3 className="font-bold text-slate-900 pr-12">{batch.area}</h3>
                             <p className="text-xs font-bold text-emerald-600">{batch.date}</p>
                             <div className="text-xs font-medium text-slate-500 flex justify-between items-center mt-1">
                                <a href={batch.googleFormLink || batch.whatsappLink} target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">Open Google Form</a>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

           </div>

           {/* Right Column: Database Feed */}
           <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div>
                     <h2 className="font-bold text-lg text-slate-900">Database Feed</h2>
                     <p className="text-xs text-slate-500 font-medium">Showing latest 50 reports for performance</p>
                  </div>
                  <button onClick={fetchData} className="text-sm font-bold bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-100 transition">Refresh</button>
                </div>

                <div className="divide-y divide-slate-100 max-h-[800px] overflow-y-auto">
                  {reports.map(report => (
                    <div key={report.id} className="p-4 md:p-5 flex gap-4 items-start md:items-center hover:bg-slate-50 transition-colors">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={report.imageUrl} alt="report" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">ID: {report.id}</p>
                        <p className="text-xs font-medium text-slate-500 truncate mb-2">User: {report.userId}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                             {report.status}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">{report.type || 'Mixed'}</span>
                          {report.estimatedVolume && (
                             <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{report.estimatedVolume}kg</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 self-center">
                        <button onClick={() => handleDeleteReport(report.id)} className="bg-white border border-rose-200 text-rose-500 p-2.5 md:p-3 rounded-xl hover:bg-rose-50 active:scale-95 transition shadow-sm" title="Delete Report">
                           <Trash2 size={18} />
                        </button>
                        <button onClick={() => handleBlockUser(report.userId)} className="bg-white border border-orange-200 text-orange-500 p-2.5 md:p-3 rounded-xl hover:bg-orange-50 active:scale-95 transition shadow-sm" title="Block User">
                           <Ban size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && <div className="p-8 text-center text-slate-500 font-medium">Database is empty.</div>}
                </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { Trash2, Shield, Users, Ban, FileText, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Hardcoded initial admin
const ADMIN_EMAILS = ["kpsumanth212@gmail.com"];

export default function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // VTU Batch State
  const [batchArea, setBatchArea] = useState("");
  const [batchDate, setBatchDate] = useState("");
  const [batchLink, setBatchLink] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        fetchReports();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "swatchbandhu_v2_reports"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data.sort((a: any, b: any) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()));
    } catch (error) {
      console.error("Error fetching reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this report?")) return;
    try {
      await deleteDoc(doc(db, "swatchbandhu_v2_reports", id));
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting report", error);
      alert("Failed to delete report");
    }
  };

  const handleBlockUser = async (userId: string) => {
    // In a real app, this would write to a blocked_users collection
    alert(`User ${userId} blocked. (Prototype logic)`);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchArea || !batchDate || !batchLink) return alert("Please fill all fields");
    
    try {
      await addDoc(collection(db, "swatchbandhu_batches"), {
        area: batchArea,
        date: batchDate,
        whatsappLink: batchLink,
        maxCapacity: 15,
        currentMembers: [],
        createdAt: new Date().toISOString()
      });
      alert("Batch created successfully!");
      setBatchArea("");
      setBatchDate("");
      setBatchLink("");
    } catch (err) {
      console.error("Failed to create batch", err);
      alert("Failed to create batch");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Admin Dashboard...</div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-slate-50 p-6 text-center">
        <Shield size={64} className="text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You do not have administrator privileges to view this page.</p>
        <button onClick={() => router.push("/")} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">Return Home</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 pb-24">
      <div className="bg-slate-900 px-6 py-8 text-white">
        <h1 className="font-black text-3xl flex items-center gap-3">
          <Shield className="text-emerald-400" /> Admin Command Center
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Manage database, users, and reports.</p>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full -mt-6">
        
        {/* Controls Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-2">
             <FileText size={24} className="text-blue-500" />
             <span className="text-2xl font-black text-slate-900">{reports.length}</span>
             <span className="text-xs font-bold text-slate-500 uppercase">Total Reports</span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-2">
             <Users size={24} className="text-emerald-500" />
             <span className="text-2xl font-black text-slate-900">Active</span>
             <span className="text-xs font-bold text-slate-500 uppercase">System Status</span>
          </div>
        </div>

        {/* VTU Batch Creation */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-emerald-500"/> Create VTU Activity Batch</h2>
          <form onSubmit={handleCreateBatch} className="flex flex-col gap-4">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Cleanup Area</label>
               <input type="text" required value={batchArea} onChange={e=>setBatchArea(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Indiranagar Metro Station" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date & Time</label>
               <input type="text" required value={batchDate} onChange={e=>setBatchDate(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Sunday, 10:00 AM" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">WhatsApp Group Link</label>
               <input type="url" required value={batchLink} onChange={e=>setBatchLink(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://chat.whatsapp.com/..." />
            </div>
            <button type="submit" className="bg-emerald-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-emerald-600 transition">Create Batch (15 Max)</button>
          </form>
        </div>

        {/* Database Management */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">Live Database Feed</h2>
            <button onClick={fetchReports} className="text-sm font-bold text-emerald-600 hover:opacity-70">Refresh</button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {reports.map(report => (
              <div key={report.id} className="p-4 flex gap-4 items-center">
                 <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={report.imageUrl} alt="report" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">ID: {report.id}</p>
                    <p className="text-xs font-medium text-slate-500 truncate">User: {report.userId}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{report.status}</span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded capitalize">{report.type}</span>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleDeleteReport(report.id)} className="bg-rose-50 text-rose-600 p-2 rounded-lg hover:bg-rose-100 transition"><Trash2 size={16}/></button>
                    <button onClick={() => handleBlockUser(report.userId)} className="bg-orange-50 text-orange-600 p-2 rounded-lg hover:bg-orange-100 transition"><Ban size={16}/></button>
                 </div>
              </div>
            ))}
            {reports.length === 0 && <div className="p-8 text-center text-slate-500">Database is empty.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { MapPin, AlertCircle, Heart, MessageCircle, MoreHorizontal, Share2, Bookmark, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Report {
  id: string;
  imageUrl: string;
  location: { latitude: number; longitude: number; name?: string };
  status: string;
  reportedAt: string;
  userId: string;
  type?: string;
  estimatedVolume?: number;
  likes?: string[];
  comments?: any[];
  userName?: string;
  commentsDisabled?: boolean;
}

export default function FeedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  
  // Interactive State
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState("");

  const toggleLike = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in to like posts.");

    const isLiked = likedPosts[id];
    setLikedPosts(prev => ({ ...prev, [id]: !isLiked }));
    
    try {
      await updateDoc(doc(db, "swatchbandhu_v2_reports", id), {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (e) {
      console.error("Error updating like", e);
      setLikedPosts(prev => ({ ...prev, [id]: isLiked })); // revert on error
    }
  };

  const handlePostComment = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in to comment.");
    if (!activeCommentId || !newComment.trim()) return;
    
    const commentObj = { 
      id: Date.now().toString(),
      userId: user.uid,
      user: user.displayName || "Citizen",
      text: newComment,
      time: new Date().toISOString()
    };

    setComments(prev => ({
      ...prev,
      [activeCommentId]: [...(prev[activeCommentId] || []), commentObj]
    }));
    setNewComment("");

    try {
      await updateDoc(doc(db, "swatchbandhu_v2_reports", activeCommentId), {
        comments: arrayUnion(commentObj)
      });
    } catch (e) {
      console.error("Error posting comment", e);
    }
  };

  const handleShare = async (report: Report) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SwachBandu Report',
          text: `Check out this waste report in ${report.location?.name || 'Bengaluru'} on SwachBandu!`,
          url: `${window.location.origin}/clean/${report.id}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  useEffect(() => {
    async function fetchFeed() {
      try {
        const q = query(collection(db, "swatchbandhu_v2_reports"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
        
        // Initialize local state from DB
        const initialLikes: Record<string, boolean> = {};
        const initialComments: Record<string, any[]> = {};
        const user = auth.currentUser;
        
        data.forEach(d => {
          if (user && d.likes?.includes(user.uid)) {
            initialLikes[d.id] = true;
          }
          if (d.comments) {
            initialComments[d.id] = d.comments;
          }
        });
        setLikedPosts(initialLikes);
        setComments(initialComments);

        const sortedData = data.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
        setReports(sortedData.filter(r => r.status !== "resolved"));
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-zinc-950 md:flex-1 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 transition-colors duration-300">
        <h1 className="font-bold text-xl text-slate-900 dark:text-zinc-50 tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
           SwachBandu
        </h1>
        <div className="flex items-center gap-4 text-slate-900 dark:text-zinc-50">
           <Heart size={24} className="hover:opacity-70 transition-opacity cursor-pointer" strokeWidth={2} />
           <MessageCircle size={24} className="hover:opacity-70 transition-opacity cursor-pointer" strokeWidth={2} />
        </div>
      </div>

      <div className="flex-1 w-full max-w-xl mx-auto pb-24 md:pb-8">
        {loading ? (
           <div className="w-full h-[60vh] flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-zinc-800 border-t-emerald-500"></div>
           </div>
        ) : reports.length === 0 ? (
           <div className="w-full h-[60vh] flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400 p-8 text-center">
              <AlertCircle size={48} className="mb-4 text-slate-300 dark:text-zinc-700" />
              <p className="text-xl font-bold text-slate-900 dark:text-zinc-50">No active reports nearby!</p>
              <p className="text-sm mt-2 text-slate-500 dark:text-zinc-400">Your city is looking clean today.</p>
           </div>
        ) : (
          <div className="flex flex-col bg-slate-50 dark:bg-zinc-950">
            <AnimatePresence>
            {reports.map((report, idx) => {
               const reportDate = new Date(report.reportedAt);
               const timeAgo = Math.floor((Date.now() - reportDate.getTime()) / 3600000) + "h ago";
               const isCitizen = report.userId !== "anonymous";

               return (
                <motion.article 
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 mb-2 sm:border sm:rounded-2xl sm:my-4 sm:shadow-sm overflow-hidden"
                >
                   {/* Post Header */}
                   <div className="flex items-center justify-between p-3.5">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-900 dark:text-zinc-100 font-bold text-sm border border-slate-200 dark:border-zinc-700">
                            {isCitizen ? (report.userName?.charAt(0).toUpperCase() || "C") : "A"}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 dark:text-zinc-50 leading-tight">
                               {isCitizen ? (report.userName || "Citizen Hero") : "Anonymous Reporter"}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                               <MapPin size={10} /> {report.location?.name || "Bengaluru Urban"}
                            </span>
                         </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-900 dark:hover:text-zinc-50 p-1 transition-colors">
                         <MoreHorizontal size={20} />
                      </button>
                   </div>

                   {/* Post Image */}
                   <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-zinc-950 relative border-y border-slate-200 dark:border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={report.imageUrl} alt="Garbage" className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-slate-200 dark:border-zinc-800 uppercase tracking-widest">
                         ACTIVE REPORT
                      </div>
                   </div>

                   {/* Post Actions */}
                   <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <div className="flex items-center gap-4 text-slate-900 dark:text-zinc-50">
                         <button onClick={() => toggleLike(report.id)} className="hover:opacity-70 transition-opacity active:scale-95 transform">
                           <Heart size={24} strokeWidth={2} className={likedPosts[report.id] ? "fill-red-500 text-red-500" : ""} />
                         </button>
                         <button 
                            onClick={() => !report.commentsDisabled && setActiveCommentId(report.id)} 
                            className={`transition-opacity active:scale-95 transform ${report.commentsDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70'}`}
                         >
                            <MessageCircle size={24} className="-scale-x-100" strokeWidth={2} />
                         </button>
                         <button onClick={() => handleShare(report)} className="hover:opacity-70 transition-opacity active:scale-95 transform"><Share2 size={22} strokeWidth={2} /></button>
                      </div>
                      <button className="text-slate-900 dark:text-zinc-50 hover:opacity-70 transition-opacity active:scale-95 transform"><Bookmark size={24} strokeWidth={2} /></button>
                   </div>

                   {/* Post Details & Caption */}
                   <div className="px-4 pb-5">
                      <p className="font-bold text-sm text-slate-900 dark:text-zinc-50 mb-1.5">
                        {report.likes?.length ? report.likes.length + (likedPosts[report.id] && !report.likes.includes(auth.currentUser?.uid || "") ? 1 : 0) - (!likedPosts[report.id] && report.likes.includes(auth.currentUser?.uid || "") ? 1 : 0) : (likedPosts[report.id] ? 1 : 0)} likes
                      </p>
                      <p className="text-sm text-slate-900 dark:text-zinc-50 leading-snug">
                         <span className="font-bold mr-2 text-slate-900 dark:text-zinc-50">{isCitizen ? (report.userName || "Citizen Hero") : "Anonymous Reporter"}</span>
                         AI Verified: Found <span className="font-semibold">{report.type ? report.type : "mixed"} waste</span> dumped here. Estimated volume is {report.estimatedVolume || "unknown"}kg. Needs immediate attention! 🚨🌍
                      </p>
                      
                      {!report.commentsDisabled ? (
                        <button 
                           onClick={() => setActiveCommentId(report.id)}
                           className="text-slate-500 dark:text-zinc-400 text-sm mt-2 mb-1.5 hover:text-slate-900 dark:hover:text-zinc-50 transition-colors"
                        >
                           View all {comments[report.id]?.length || 0} comments
                        </button>
                      ) : (
                        <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold mt-2 mb-1.5 uppercase tracking-wider">Comments Disabled</p>
                      )}
                     
                     <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium uppercase tracking-wider">{timeAgo}</p>

                     {/* Call to Action for Cleaners */}
                     <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                        <Link href={`/clean/${report.id}`}>
                           <button className="w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm py-3 rounded-xl border border-transparent transition-all active:scale-[0.98] hover:opacity-90 shadow-sm">
                              I Cleaned This!
                           </button>
                        </Link>
                     </div>
                  </div>
                </motion.article>
               );
            })}
          </AnimatePresence>
        </div>
        )}

        {/* Comments Overlay */}
        <AnimatePresence>
        {activeCommentId && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[70vh] flex flex-col border-t border-slate-200 dark:border-zinc-800 md:w-[400px] md:right-auto md:left-1/2 md:-translate-x-1/2 md:bottom-10 md:rounded-3xl md:h-[600px] md:border md:shadow-2xl"
          >
             {/* Handle bar for dragging visual */}
             <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full"></div>
             </div>

             <div className="flex justify-between items-center px-5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-slate-900 dark:text-zinc-50 text-base">Comments</h3>
                <button onClick={() => setActiveCommentId(null)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-50 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                   <X size={18} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                {comments[activeCommentId]?.length === 0 || !comments[activeCommentId] ? (
                  <div className="text-slate-400 text-center py-10 text-sm font-medium">No comments yet. Be the first!</div>
                ) : (
                  comments[activeCommentId]?.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-900 dark:text-emerald-100 font-bold text-xs shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                         {comment.user ? comment.user.charAt(0).toUpperCase() : "U"}
                       </div>
                       <div>
                          <p className="text-sm text-slate-700 dark:text-zinc-300 leading-snug">
                             <span className="font-bold mr-2 text-slate-900 dark:text-zinc-50">{comment.user}</span>
                             {comment.text}
                          </p>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-zinc-500 font-medium">
                             <span>{new Date(comment.time).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(comment.time).toLocaleDateString()}</span>
                             <button className="hover:text-slate-900 dark:hover:text-zinc-300 transition-colors">Reply</button>
                          </div>
                       </div>
                       <button className="ml-auto shrink-0 self-center text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Heart size={14} /></button>
                    </div>
                  ))
                )}
             </div>

             <div className="p-3 px-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 mb-safe">
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs shrink-0">U</div>
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  placeholder="Add a comment..." 
                  className="flex-1 bg-transparent border-none px-2 py-2 text-sm focus:ring-0 outline-none text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-500" 
                />
                <button 
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="text-emerald-600 dark:text-emerald-400 font-bold text-sm px-2 hover:opacity-70 transition-opacity disabled:opacity-30"
                >
                  Post
                </button>
             </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

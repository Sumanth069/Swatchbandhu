"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import { useTheme } from "next-themes";
import { CheckCircle2, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";

function getSeverityColor(volume: number, isResolved: boolean) {
  if (isResolved) return "emerald";
  if (volume > 50) return "rose";
  if (volume > 20) return "orange";
  return "amber";
}

function createSeverityIcon(volume: number, status: string, reportCount: number = 1) {
  const isResolved = status === "resolved";
  const colorKey = getSeverityColor(volume, isResolved);
  
  // Tailwind color mappings for the marker
  const colors: Record<string, { bg: string, border: string, text: string }> = {
    emerald: { bg: "bg-emerald-500", border: "border-emerald-200", text: "text-emerald-50" },
    rose: { bg: "bg-rose-500", border: "border-rose-200", text: "text-rose-50" },
    orange: { bg: "bg-orange-500", border: "border-orange-200", text: "text-orange-50" },
    amber: { bg: "bg-amber-400", border: "border-amber-100", text: "text-amber-900" },
  };

  const c = colors[colorKey];

  const iconHtml = renderToString(
    <div className="relative flex items-center justify-center w-10 h-10">
      {/* Outer Glow (No animations to prevent lag) */}
      <div className={`absolute inset-0 rounded-full opacity-30 ${c.bg}`}></div>
      
      {/* Core Marker */}
      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-md border-[3px] border-white ${c.bg} ${c.text}`}>
        {isResolved ? <CheckCircle2 size={16} strokeWidth={3} /> : <ShieldAlert size={16} strokeWidth={3} />}
      </div>
      
      {/* Duplicate Report Badge */}
      {!isResolved && reportCount > 1 && (
        <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
          {reportCount}
        </div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: "bg-transparent",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 12.9716) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({ reports, externalCenter }: { reports: any[], externalCenter?: [number, number] | null }) {
  const defaultCenter: [number, number] = [12.9716, 77.5946];
  const mapCenter = externalCenter || defaultCenter;
  const { theme } = useTheme();

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={13} 
      className="w-full h-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
      />
      <ZoomControl position="bottomright" />
      <MapUpdater center={mapCenter} />

      {reports.map((report) => {
        // Simulate duplicate reporting logic based on volume
        const reportCount = report.estimatedVolume > 50 ? Math.floor(report.estimatedVolume / 10) : 1;
        
        return (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lon]}
            icon={createSeverityIcon(report.estimatedVolume || 20, report.status, reportCount)}
          >
            <Popup className="custom-popup">
              <div className="w-64 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col font-sans -m-[13px]">
                <div className="relative h-40 w-full bg-slate-100 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={report.imageUrl} alt="Garbage" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-zinc-900/60 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute top-3 left-3 bg-white dark:bg-zinc-900 shadow-sm px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-700">
                     <p className="text-[9px] font-bold text-slate-900 dark:text-zinc-50 uppercase tracking-widest leading-none">
                       {report.status === "resolved" ? "CLEANED UP" : "ACTIVE REPORT"}
                     </p>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col gap-3 relative z-10">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-zinc-50 text-base leading-tight">
                      {report.type ? <span className="capitalize">{report.type} Waste</span> : "Mixed Waste"}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{report.location.name || "Bengaluru Urban"}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                     <Users size={16} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                     <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Reported by <span className="font-bold text-slate-900 dark:text-zinc-50">{reportCount} citizens</span></p>
                  </div>
                  
                  {report.status !== "resolved" && (
                    <Link href={`/clean/${report.id}`} className="mt-1">
                      <button className="w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm font-bold text-sm py-3 rounded-xl hover:opacity-90 transition active:scale-[0.98]">
                        I Cleaned This!
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

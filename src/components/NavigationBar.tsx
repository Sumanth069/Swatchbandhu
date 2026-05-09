"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Camera, User, Layers, Gift } from "lucide-react";
import { motion } from "framer-motion";

export default function NavigationBar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Map, label: "Map" },
    { href: "/feed", icon: Layers, label: "Feed" },
    { href: "/report", icon: Camera, label: "Report", isPrimary: true },
    { href: "/rewards", icon: Gift, label: "Rewards" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)] md:hidden transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith("/clean") && item.href === "/feed");
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-5 mx-1">
                <div className="flex items-center justify-center w-14 h-14 bg-slate-900 dark:bg-zinc-100 rounded-full shadow-lg text-white dark:text-zinc-900 transition-transform active:scale-95 border-4 border-white dark:border-zinc-950">
                  <Camera size={24} strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                isActive ? "text-slate-900 dark:text-zinc-50" : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute top-0 w-8 h-1 bg-slate-900 dark:bg-zinc-100 rounded-b-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`transition-transform duration-200 ${isActive ? "scale-110 mt-1" : "mt-1"}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-semibold transition-all ${
                  isActive ? "opacity-100" : "opacity-0 translate-y-1"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

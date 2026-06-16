"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedTagline({ className = "", justifyClass = "justify-center" }: { className?: string; justifyClass?: string }) {
  const [index, setIndex] = useState(0);
  const taglines = ["Report ಮಾಡಿ", "Change ನೋಡಿ"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block align-bottom ${className}`}>
      {/* Invisible placeholder to reserve exact width of longest text */}
      <span className="invisible pointer-events-none whitespace-nowrap block h-[1.2em]" aria-hidden="true">
        CHANGE ನೋಡಿ
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`absolute inset-0 whitespace-nowrap flex items-center ${justifyClass}`}
        >
          {taglines[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

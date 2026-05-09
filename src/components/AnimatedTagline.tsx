"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedTagline({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const taglines = ["Report ಮಾಡಿ", "Change ನೋಡಿ"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative overflow-hidden h-[1.2em] w-[90px] inline-block align-bottom ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 whitespace-nowrap"
        >
          {taglines[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

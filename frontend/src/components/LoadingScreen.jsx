import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbit } from 'lucide-react';

export default function LoadingScreen({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="cosmos-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center select-none"
        >
          {/* Animated Orbit Spinner */}
          <div className="relative w-24 h-24 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border border-sky-500/20 animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-full border border-t-sky-400 border-r-transparent border-b-sky-600/30 border-l-transparent animate-spin" />
            <div className="absolute w-12 h-12 rounded-full border border-b-amber-400 border-t-transparent border-l-transparent border-r-transparent animate-spin-reverse" />
            <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_15px_#38bdf8]" />
          </div>

          <span className="font-display text-sm tracking-[0.3em] uppercase text-white font-semibold mb-2">
            INITIALIZING COSMOS
          </span>
          <span className="text-[11px] font-mono tracking-widest text-slate-500">
            COMPUTING PLANETARY EPHEMERIDES
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function PlanetZoomOverlay({
  planet,
  visible = true,
  onZoomOut
}) {
  if (!visible || !planet) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-8 sm:p-14 md:p-16">
      {/* Top Left Back Control */}
      <div className="pointer-events-auto">
        <button
          onClick={onZoomOut}
          className="group flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO ORBIT</span>
        </button>
      </div>

      {/* Bottom Right Text Block (Matches reference video sec_06.jpg) */}
      <div className="w-full flex justify-end pointer-events-auto">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md flex flex-col items-end text-right"
          >
            {/* Cyan Accent Line */}
            <div className="w-16 h-[2px] bg-[#4DEEEA] mb-4 shadow-[0_0_8px_#4DEEEA]" />

            {/* Concise Right-Aligned Description */}
            <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed font-sans">
              {planet.zoomDescription}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


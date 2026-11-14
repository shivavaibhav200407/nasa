import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowLeft } from 'lucide-react';

export default function PlanetInformation({
  planet,
  visible = true,
  onLearnMore,
  onBackToLanding
}) {
  if (!visible || !planet) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex items-center px-8 sm:px-16 md:px-20 lg:px-24">
      {/* Back Button (Top Left) */}
      <div className="absolute top-10 left-8 sm:left-14 pointer-events-auto">
        <button
          onClick={onBackToLanding}
          className="group flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN</span>
        </button>
      </div>

      {/* Left Column Content */}
      <div className="w-full max-w-lg pointer-events-auto flex flex-col items-start mt-4 sm:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={planet.id}
            initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start text-left"
          >
            {/* Eyebrow Label */}
            <span className="font-sans text-[11px] sm:text-xs tracking-[0.35em] uppercase text-white/80 font-semibold mb-2">
              {planet.eyebrow}
            </span>

            {/* Planet Name */}
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-[0.1em] uppercase text-white leading-none">
              {planet.name}
            </h1>

            {/* Cyan Accent Line */}
            <div className="w-14 h-[2px] bg-[#4DEEEA] my-5 shadow-[0_0_8px_#4DEEEA]" />

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed mb-9 font-sans max-w-md sm:max-w-lg">
              {planet.detailDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5">
              <button
                onClick={onLearnMore}
                className="px-8 py-3 rounded-full bg-[#E5EEF8] hover:bg-white text-[#050B18] font-bold text-xs tracking-[0.16em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-95"
              >
                VIEW MORE
              </button>

              <button
                onClick={onLearnMore}
                className="w-11 h-11 rounded-full bg-[#E5EEF8] hover:bg-white text-[#050B18] flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.35)] active:scale-95 pl-0.5"
                title="Zoom into Surface"
              >
                <Play className="w-4 h-4 fill-[#050B18] text-[#050B18]" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right side is open for the massive 3D planet */}
      <div className="w-full md:w-[55%] pointer-events-none" />
    </div>
  );
}

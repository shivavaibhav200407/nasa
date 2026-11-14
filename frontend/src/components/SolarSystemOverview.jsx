import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Orbit } from 'lucide-react';
import { PLANETS } from '../data/planets';

export default function SolarSystemOverview({
  visible = true,
  onStartExploring,
  onSelectPlanet
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex flex-col justify-between items-center pt-24 pb-12 px-6 sm:px-12 text-center">
      {/* Top Title */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center mt-10 pointer-events-auto">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-[11px] sm:text-xs tracking-[0.35em] uppercase text-cyan-400 font-semibold mb-2"
        >
          THE CELESTIAL SYSTEM
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-[0.2em] uppercase text-white leading-tight"
        >
          SOLAR SYSTEM
        </motion.h1>

        <div className="w-16 h-[2px] bg-cyan-400 my-4 shadow-[0_0_10px_#22d3ee]" />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xs sm:text-sm text-slate-300/90 font-light leading-relaxed max-w-md mb-8 font-sans"
        >
          Eight unique worlds revolving around a G-type main-sequence star. Travel through our celestial neighborhood.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onClick={() => onStartExploring(2)} // Earth by default
          className="px-8 py-3 rounded-full bg-white text-slate-900 hover:bg-cyan-100 font-medium text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] active:scale-95 flex items-center gap-2"
        >
          <span>EXPLORE PLANETS</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Bottom Planet Quick-Jump Chips */}
      <div className="w-full max-w-3xl mx-auto pointer-events-auto">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {PLANETS.map((planet, idx) => (
            <button
              key={planet.id}
              onClick={() => onSelectPlanet(idx)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/40 text-[11px] font-mono tracking-wider text-slate-300 hover:text-white transition-all flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: planet.visual.accentColor }}
              />
              <span>{planet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


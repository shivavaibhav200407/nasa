import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Orbit } from 'lucide-react';
import { PLANETS } from '../data/planets';

export default function LandingScreen({
  visible,
  onBegin,
  onSelectPlanet
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="landing-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-30 flex flex-col justify-between items-center px-6 py-28 pointer-events-none select-none text-center"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-b from-amber-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Top Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-pill text-[11px] font-mono tracking-[0.25em] uppercase text-sky-300"
          >
            <Orbit className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>INTERACTIVE CELESTIAL ODYSSEY</span>
          </motion.div>

          {/* Center Hero Title & Subtitle */}
          <div className="max-w-4xl mx-auto flex flex-col items-center pointer-events-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.2em] sm:tracking-[0.24em] text-white uppercase text-glow-white mb-6 leading-tight"
            >
              The Solar System
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.9 }}
              className="text-base sm:text-lg md:text-xl text-slate-300/90 font-light tracking-wide max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
            >
              A journey through our celestial neighborhood.
            </motion.p>

            {/* Primary Action Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <button
                onClick={() => onBegin(2)} // Default starts on Earth or Mercury
                className="group relative inline-flex items-center gap-4 px-9 py-4 rounded-full bg-gradient-to-r from-sky-500/20 via-sky-400/30 to-amber-500/20 hover:from-sky-500/30 hover:to-amber-500/30 border border-sky-400/50 hover:border-sky-300 text-white font-medium text-sm tracking-[0.22em] uppercase transition-all duration-300 hover:shadow-[0_0_35px_rgba(56,189,248,0.35)] active:scale-95"
              >
                <span className="relative z-10">BEGIN EXPLORATION</span>
                <div className="w-7 h-7 rounded-full bg-sky-400/30 group-hover:bg-sky-400/50 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-sky-200 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </motion.div>
          </div>

          {/* Bottom Quick Planets Carousel / Shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="w-full max-w-4xl mx-auto pointer-events-auto"
          >
            <p className="text-[10px] tracking-[0.25em] uppercase text-slate-500 mb-3 font-mono">
              DIRECT PLANET ACCESS
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {PLANETS.map((planet, idx) => (
                <button
                  key={planet.id}
                  onClick={() => onSelectPlanet(idx)}
                  className="group px-3 py-1.5 rounded-full glass-panel hover:bg-white/10 border border-white/5 hover:border-sky-400/40 transition-all flex items-center gap-2 text-xs"
                >
                  <span
                    className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: planet.visual.accentColor }}
                  />
                  <span className="text-slate-300 group-hover:text-white font-mono text-[11px] tracking-wider">
                    {planet.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


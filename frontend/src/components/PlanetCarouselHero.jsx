import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PLANETS } from '../data/planets';

export default function PlanetCarouselHero({
  currentIndex,
  onSelectPlanet,
  onExploreDetail,
  visible = true
}) {
  if (!visible) return null;

  const currentPlanet = PLANETS[currentIndex];
  const prevIndex = (currentIndex - 1 + PLANETS.length) % PLANETS.length;
  const nextIndex = (currentIndex + 1) % PLANETS.length;
  const prevPlanet = PLANETS[prevIndex];
  const nextPlanet = PLANETS[nextIndex];

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex flex-col justify-between pt-20 pb-8 px-6 sm:px-12">
      {/* Center Top Title & Intro (Spaced comfortably below the navbar) */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center mt-6 sm:mt-10 pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlanet.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Eyebrow */}
            <span className="font-sans text-[11px] sm:text-xs tracking-[0.35em] uppercase text-slate-300 font-semibold mb-2">
              PLANET
            </span>

            {/* Planet Name */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-[0.18em] uppercase text-white leading-tight">
              {currentPlanet.name}
            </h1>

            {/* Cyan Accent Line */}
            <div className="w-16 h-[2px] bg-cyan-400 my-4 shadow-[0_0_10px_#22d3ee]" />

            {/* Concise 2-line Description */}
            <p className="text-xs sm:text-sm text-slate-300/90 font-light leading-relaxed max-w-lg mb-7 font-sans">
              {currentPlanet.overview}
            </p>

            {/* Get Started / Explore Pill Button */}
            <button
              onClick={onExploreDetail}
              className="px-8 py-3 rounded-full bg-white text-slate-900 hover:bg-cyan-100 font-medium text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(34,211,238,0.4)] active:scale-95"
            >
              GET STARTED
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Middle Left & Right Planet Labels (matches video left/right side labels) */}
      <div className="w-full flex items-center justify-between pointer-events-none -mt-16">
        {/* Left Planet Preview Label */}
        <button
          onClick={() => onSelectPlanet(prevIndex)}
          className="pointer-events-auto group flex items-center gap-2 pl-2 sm:pl-8 text-xs font-display tracking-[0.25em] uppercase text-slate-300 hover:text-cyan-400 transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">{prevPlanet.name}</span>
        </button>

        {/* Right Planet Preview Label */}
        <button
          onClick={() => onSelectPlanet(nextIndex)}
          className="pointer-events-auto group flex items-center gap-2 pr-2 sm:pr-8 text-xs font-display tracking-[0.25em] uppercase text-slate-300 hover:text-cyan-400 transition-colors focus:outline-none"
        >
          <span className="hidden sm:inline">{nextPlanet.name}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Bottom Center Circular Down Arrow Indicator (matches reference video) */}
      <div className="w-full flex flex-col items-center pointer-events-auto">
        <button
          onClick={onExploreDetail}
          className="group w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/20 hover:border-cyan-400/50 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-lg active:scale-95"
          aria-label="Scroll down to explore"
          title="Explore Details"
        >
          <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-cyan-300 group-hover:translate-y-0.5 transition-all animate-bounce" />
        </button>
      </div>
    </div>
  );
}


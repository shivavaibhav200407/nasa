import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PLANETS } from '../data/planets';

export default function PlanetLanding({
  currentIndex,
  onSelectPlanet,
  onGetStarted,
  visible = true
}) {
  if (!visible) return null;

  const currentPlanet = PLANETS[currentIndex];
  const prevIndex = (currentIndex - 1 + PLANETS.length) % PLANETS.length;
  const nextIndex = (currentIndex + 1) % PLANETS.length;
  const prevPlanet = PLANETS[prevIndex];
  const nextPlanet = PLANETS[nextIndex];

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex flex-col justify-between pt-10 sm:pt-14 pb-6 px-6 sm:px-12">
      {/* Center Top Hero Block */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center mt-4 sm:mt-8 pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlanet.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* PLANET Eyebrow */}
            <span className="font-sans text-[11px] sm:text-xs tracking-[0.35em] uppercase text-white/80 font-semibold mb-2">
              PLANET
            </span>

            {/* Large Serif Title */}
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-[0.12em] uppercase text-white leading-tight">
              {currentPlanet.name}
            </h1>

            {/* Cyan Accent Line */}
            <div className="w-14 h-[2px] bg-[#4DEEEA] my-4 shadow-[0_0_8px_#4DEEEA]" />

            {/* Short Centered Description */}
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-lg mb-8 font-sans">
              {currentPlanet.landingIntro}
            </p>

            {/* GET STARTED Pill Button */}
            <button
              onClick={onGetStarted}
              className="px-9 py-3 rounded-full bg-[#E5EEF8] hover:bg-white text-[#050B18] font-bold text-xs tracking-[0.16em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-95"
            >
              GET STARTED
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Neighboring Planet Names on the Left and Right Edges */}
      <div className="w-full flex items-center justify-between pointer-events-none -mt-20 px-2 sm:px-6">
        {/* Left Neighbor Name */}
        <button
          onClick={() => onSelectPlanet(prevIndex)}
          className="pointer-events-auto group pl-12 sm:pl-20 text-xs sm:text-sm font-serif tracking-[0.35em] uppercase text-white/90 hover:text-[#4DEEEA] transition-colors focus:outline-none"
        >
          {prevPlanet.name.split('').join(' ')}
        </button>

        {/* Right Neighbor Name */}
        <button
          onClick={() => onSelectPlanet(nextIndex)}
          className="pointer-events-auto group pr-12 sm:pr-20 text-xs sm:text-sm font-serif tracking-[0.35em] uppercase text-white/90 hover:text-[#4DEEEA] transition-colors focus:outline-none"
        >
          {nextPlanet.name.split('').join(' ')}
        </button>
      </div>

      {/* Circular Downward Arrow Indicator at Bottom Center */}
      <div className="w-full flex justify-center pointer-events-auto pb-2">
        <button
          onClick={onGetStarted}
          className="w-11 h-11 rounded-full bg-[#050B18]/70 hover:bg-[#050B18]/90 border border-white/20 hover:border-[#4DEEEA]/60 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg active:scale-95 group"
          aria-label="Explore Details"
          title="Scroll or click to explore"
        >
          <ChevronDown className="w-5 h-5 text-white/90 group-hover:text-[#4DEEEA] group-hover:translate-y-0.5 transition-all" />
        </button>
      </div>
    </div>
  );
}

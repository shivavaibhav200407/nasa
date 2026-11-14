import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbit, ChevronUp, X, Compass, Globe2, Thermometer, Layers, Sparkles } from 'lucide-react';

export default function PlanetDetailView({
  planet,
  visible = true,
  onBackToCarousel,
  isOrbitEnabled,
  onToggleOrbit
}) {
  const [showMetrics, setShowMetrics] = useState(false);

  if (!visible || !planet) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex items-center px-6 sm:px-12 md:px-20 lg:px-24">
      {/* Return to Carousel Arrow at the Top Left */}
      <div className="absolute top-24 left-6 sm:left-12 pointer-events-auto">
        <button
          onClick={onBackToCarousel}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-400/40 text-xs font-mono tracking-wider text-slate-300 hover:text-white transition-all backdrop-blur-md active:scale-95"
        >
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span>BACK TO PLANETS</span>
        </button>
      </div>

      {/* Main Content: Left Column (Matches Reference Video Frame 1) */}
      <div className="w-full max-w-xl pointer-events-auto flex flex-col items-start mt-6 sm:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={planet.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start text-left"
          >
            {/* Eyebrow Tagline */}
            <span className="font-sans text-[11px] sm:text-xs tracking-[0.3em] uppercase text-slate-300 font-semibold mb-2">
              {planet.tagline}
            </span>

            {/* Large Serif Title */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.14em] uppercase text-white leading-none">
              {planet.name}
            </h1>

            {/* Cyan Accent Line */}
            <div className="w-16 h-[2px] bg-cyan-400 my-5 shadow-[0_0_10px_#22d3ee]" />

            {/* Concise Readable Paragraph */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300/90 font-light leading-relaxed mb-8 font-sans max-w-md sm:max-w-lg">
              {planet.description}
            </p>

            {/* Two Action Buttons: LEARN MORE pill + Free 3D Orbit Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMetrics(true)}
                className="px-8 py-3 rounded-full bg-white text-slate-900 hover:bg-cyan-100 font-medium text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(34,211,238,0.4)] active:scale-95"
              >
                LEARN MORE
              </button>

              {/* Free 3D Orbit Button */}
              <button
                onClick={onToggleOrbit}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                  isOrbitEnabled
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/20 text-slate-300 hover:text-white'
                }`}
                title={isOrbitEnabled ? 'Free Orbit Active (Drag with mouse)' : 'Toggle Free 3D Orbit'}
              >
                <Orbit className={`w-4 h-4 ${isOrbitEnabled ? 'animate-spin-slow text-cyan-400' : ''}`} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide-over Astronomical Metrics & Facts Sheet (Opened via LEARN MORE) */}
      <AnimatePresence>
        {showMetrics && (
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMetrics(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md h-full bg-[#060B19]/95 border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar shadow-2xl z-10"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">
                      PLANETARY DOSSIER
                    </span>
                    <h3 className="font-display text-2xl font-light tracking-wider text-white">
                      {planet.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowMetrics(false)}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 6 Key Astronomical Metrics */}
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-3 block">
                  PHYSICAL & ORBITAL PARAMETERS
                </span>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <DetailMetric
                    icon={<Compass className="w-3.5 h-3.5 text-cyan-400" />}
                    label="DISTANCE FROM SUN"
                    value={planet.distanceFromSun}
                  />
                  <DetailMetric
                    icon={<Globe2 className="w-3.5 h-3.5 text-amber-400" />}
                    label="DIAMETER"
                    value={planet.diameter}
                  />
                  <DetailMetric
                    icon={<Orbit className="w-3.5 h-3.5 text-emerald-400" />}
                    label="ORBITAL PERIOD"
                    value={planet.orbitalPeriod}
                  />
                  <DetailMetric
                    icon={<Thermometer className="w-3.5 h-3.5 text-rose-400" />}
                    label="AVG TEMPERATURE"
                    value={planet.averageTemperature}
                  />
                  <DetailMetric
                    icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
                    label="GRAVITY"
                    value={planet.gravity}
                  />
                  <DetailMetric
                    icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                    label="CONFIRMED MOONS"
                    value={planet.moons.toString()}
                  />
                </div>

                {/* Key Celestial Facts */}
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-3 block">
                  KEY CELESTIAL PHENOMENA
                </span>
                <div className="space-y-2.5">
                  {planet.facts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 leading-relaxed"
                    >
                      <strong className="text-white block mb-0.5">{fact.label}</strong>
                      <span className="text-slate-400">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button at the bottom */}
              <div className="pt-6 border-t border-white/10 mt-6">
                <button
                  onClick={() => setShowMetrics(false)}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs tracking-wider transition-all"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailMetric({ icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="text-xs font-semibold text-white tracking-wide truncate">
        {value}
      </span>
    </div>
  );
}


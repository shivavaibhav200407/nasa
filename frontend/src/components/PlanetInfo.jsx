import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, Orbit, Thermometer, Compass, Sparkles, Layers } from 'lucide-react';

export default function PlanetInfo({
  planet,
  visible,
  isAnimationDone,
  isMobile = false
}) {
  if (!visible || !planet) return null;

  // Staggered motion container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: 0.35, ease: 'easeInOut' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex items-center px-6 md:px-16 lg:px-24">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pointer-events-none h-full pt-20 pb-36 sm:pb-32">
        {/* Left Side: Planet Information Content */}
        <div className="w-full md:w-[48%] lg:w-[45%] flex flex-col justify-center pointer-events-auto mt-auto md:mt-0 max-h-[60vh] md:max-h-none overflow-y-auto no-scrollbar pr-2">
          <AnimatePresence mode="wait">
            {isAnimationDone && (
              <motion.div
                key={planet.id}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col text-left"
              >
                {/* 1. Eyebrow Index & Category */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-sky-400 font-semibold">
                    PLANET {planet.index} / 08
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {planet.type}
                  </span>
                </motion.div>

                {/* 2. Large Planet Name */}
                <motion.h1
                  variants={itemVariants}
                  className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.14em] sm:tracking-[0.18em] uppercase text-white leading-none mb-3"
                  style={{
                    textShadow: `0 0 35px ${planet.visual.glowColor}55`
                  }}
                >
                  {planet.name}
                </motion.h1>

                {/* 3. Poetic Tagline */}
                <motion.p
                  variants={itemVariants}
                  className="text-xs sm:text-sm font-medium tracking-[0.15em] uppercase text-slate-300 mb-4"
                  style={{ color: planet.visual.accentColor }}
                >
                  {planet.tagline}
                </motion.p>

                {/* 4. Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-sm sm:text-base text-slate-300/90 font-light leading-relaxed mb-6 font-sans max-w-xl"
                >
                  {planet.description}
                </motion.p>

                {/* 5. Metrics Grid */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6 max-w-xl"
                >
                  <MetricCard
                    icon={<Compass className="w-3.5 h-3.5 text-sky-400" />}
                    label="DISTANCE FROM SUN"
                    value={planet.distanceFromSun}
                  />
                  <MetricCard
                    icon={<Globe2 className="w-3.5 h-3.5 text-amber-400" />}
                    label="DIAMETER"
                    value={planet.diameter}
                  />
                  <MetricCard
                    icon={<Orbit className="w-3.5 h-3.5 text-emerald-400" />}
                    label="ORBITAL PERIOD"
                    value={planet.orbitalPeriod}
                  />
                  <MetricCard
                    icon={<Thermometer className="w-3.5 h-3.5 text-rose-400" />}
                    label="AVG TEMPERATURE"
                    value={planet.averageTemperature}
                  />
                  <MetricCard
                    icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
                    label="GRAVITY"
                    value={planet.gravity}
                  />
                  <MetricCard
                    icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                    label="KNOWN MOONS"
                    value={planet.moons.toString()}
                  />
                </motion.div>

                {/* 6. Interesting Key Facts */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2 max-w-xl">
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-slate-400">
                    KEY CELESTIAL PHENOMENA
                  </span>
                  <div className="flex flex-col gap-2">
                    {planet.facts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2 rounded-lg glass-panel-subtle border border-white/5 hover:border-white/10 transition-colors flex items-start gap-2.5 text-xs text-slate-300"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: planet.visual.accentColor }}
                        />
                        <div>
                          <strong className="text-white font-medium mr-1.5">
                            {fact.label}:
                          </strong>
                          <span className="text-slate-300/80 font-light leading-snug">
                            {fact.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Reserved for Large 3D Planet visual */}
        <div className="w-full md:w-[50%] lg:w-[55%] pointer-events-none" />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="p-2.5 sm:p-3 rounded-xl glass-panel-subtle border border-white/5 flex flex-col">
      <div className="flex items-center gap-1.5 mb-1 text-[10px] tracking-wider uppercase font-mono text-slate-400">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
        {value}
      </span>
    </div>
  );
}


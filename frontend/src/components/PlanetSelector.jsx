import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PLANETS } from '../data/planets';

export default function PlanetSelector({
  currentIndex,
  onSelectPlanet,
  visible = true
}) {
  const containerRef = useRef(null);
  const activeBtnRef = useRef(null);

  // Auto-scroll active planet into view on mobile
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeBtnRef.current;
      const scrollLeft = element.offsetLeft - container.offsetWidth / 2 + element.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentIndex]);

  if (!visible) return null;

  return (
    <nav
      aria-label="Planet Selector"
      className="fixed bottom-24 sm:bottom-20 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none select-none"
    >
      <div
        ref={containerRef}
        className="pointer-events-auto max-w-full overflow-x-auto no-scrollbar py-2 px-3 sm:px-4 rounded-full glass-panel border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-1 sm:gap-2"
      >
        {PLANETS.map((planet, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={planet.id}
              ref={isActive ? activeBtnRef : null}
              onClick={() => onSelectPlanet(index)}
              className={`relative group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 focus:outline-none whitespace-nowrap ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="activePlanetIndicator"
                  className="absolute inset-0 rounded-full bg-white/10 border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Number Index (01–08) */}
              <span className={`text-[10px] font-mono tracking-wider transition-colors relative z-10 ${
                isActive ? 'text-sky-300 font-semibold' : 'text-slate-500 group-hover:text-slate-400'
              }`}>
                {planet.index}
              </span>

              {/* Planet Color Dot */}
              <span
                className={`relative z-10 w-2 h-2 rounded-full transition-transform duration-300 ${
                  isActive ? 'scale-125' : 'group-hover:scale-110 opacity-70'
                }`}
                style={{
                  backgroundColor: planet.visual.accentColor,
                  boxShadow: isActive ? `0 0 10px ${planet.visual.accentColor}` : 'none'
                }}
              />

              {/* Planet Name */}
              <span className="relative z-10 text-xs sm:text-sm font-medium tracking-[0.1em] uppercase">
                {planet.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


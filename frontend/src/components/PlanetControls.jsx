import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Orbit } from 'lucide-react';

export default function PlanetControls({
  currentIndex,
  totalPlanets,
  onPrev,
  onNext,
  isOrbitEnabled,
  onToggleOrbit,
  onBackToSun,
  visible = true
}) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 px-6 md:px-12 flex items-center justify-between pointer-events-none select-none">
      {/* Left: Return to Overview (Sun) */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={onBackToSun}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-mono tracking-wider text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
          title="Return to Solar System Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">OVERVIEW</span>
        </button>

        {/* Free Orbit Inspection Toggle */}
        <button
          onClick={onToggleOrbit}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono tracking-wider transition-all active:scale-95 ${
            isOrbitEnabled
              ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
              : 'glass-pill text-slate-400 hover:text-white'
          }`}
          title="Toggle Free 3D Orbit Drag"
        >
          <Orbit className={`w-3.5 h-3.5 ${isOrbitEnabled ? 'animate-spin-slow text-sky-400' : ''}`} />
          <span className="hidden sm:inline">{isOrbitEnabled ? 'ORBIT: ON' : 'FREE ORBIT'}</span>
        </button>
      </div>

      {/* Center: Hint */}
      <div className="hidden lg:flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-slate-500 font-mono">
        <span>USE ARROW KEYS [←] [→] OR SCROLL TO EXPLORE</span>
      </div>

      {/* Right: Prev / Next Navigation */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          onClick={onPrev}
          className="p-2.5 rounded-full glass-panel hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-sky-400/30 transition-all active:scale-95"
          aria-label="Previous Planet"
          title="Previous Planet [←]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Planet Index Counter */}
        <div className="px-3.5 py-1.5 rounded-full glass-panel border border-white/10 font-mono text-xs tracking-widest text-slate-300 flex items-center gap-1.5">
          <span className="text-white font-semibold">{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{String(totalPlanets).padStart(2, '0')}</span>
        </div>

        <button
          onClick={onNext}
          className="p-2.5 rounded-full glass-panel hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-sky-400/30 transition-all active:scale-95"
          aria-label="Next Planet"
          title="Next Planet [→]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


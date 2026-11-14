import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function Navbar({
  viewMode, // 'carousel' | 'detail' | 'overview'
  onViewModeChange,
  onAboutClick,
  isMuted,
  onToggleMute
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 select-none">
      <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onViewModeChange('carousel')}
          className="flex items-center gap-2 group focus:outline-none"
        >
          <span className="font-sans font-semibold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            cosmos<span className="text-cyan-400">.</span>
          </span>
        </button>

        {/* Center / Right Links */}
        <div className="flex items-center gap-6 sm:gap-10">
          <nav className="flex items-center gap-6 sm:gap-8 text-xs font-medium tracking-wider text-slate-300">
            <button
              onClick={() => onViewModeChange('carousel')}
              className={`relative py-5 transition-colors hover:text-white ${
                viewMode === 'carousel' || viewMode === 'detail' ? 'text-white' : 'text-slate-400'
              }`}
            >
              Planets
              {(viewMode === 'carousel' || viewMode === 'detail') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>

            <button
              onClick={() => onViewModeChange('overview')}
              className={`relative py-5 transition-colors hover:text-white ${
                viewMode === 'overview' ? 'text-white' : 'text-slate-400'
              }`}
            >
              Solar System
              {viewMode === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>

            <button
              onClick={onAboutClick}
              className="py-5 text-slate-400 hover:text-white transition-colors hidden sm:inline-block"
            >
              About
            </button>
          </nav>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Turn Sound On' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            )}
          </button>

          {/* Action Button: Enroll / Explore */}
          <button
            onClick={() => onViewModeChange(viewMode === 'detail' ? 'carousel' : 'detail')}
            className="px-5 py-2 rounded-full bg-white text-slate-900 font-medium text-xs tracking-wider hover:bg-cyan-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
          >
            {viewMode === 'detail' ? 'Overview' : 'Explore'}
          </button>
        </div>
      </div>

      {/* Thin Minimal Separator Line */}
      <div className="w-full h-[1px] bg-white/10" />
    </header>
  );
}

import React from 'react';
import { Volume2, VolumeX, BookOpen, HelpCircle } from 'lucide-react';
import { sound } from '../utils/soundFx';

export default function Header({
  activeTab = 'cosmos',
  onTabChange,
  onLaunchMission,
  onOpenFlightManual,
  onOpenScienceModal,
  activeMission = null,
  isAudioMuted = false,
  onToggleAudio
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 select-none bg-gradient-to-b from-[#030712]/90 via-[#030712]/50 to-transparent backdrop-blur-[2px]">
      <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
        {/* Logo / Brand (ASTRA ECLSS) */}
        <div
          onClick={() => onTabChange && onTabChange('cosmos')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-baseline">
            <span className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-white group-hover:text-white/95">
              ast<span className="text-[#4DEEEA]">ra</span>
            </span>
            <span className="ml-2.5 text-[10px] tracking-widest uppercase font-mono text-cyan-300/80 px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 hidden sm:inline">
              NASA ECLSS TRAINER
            </span>
          </div>
        </div>

        {/* Center / Right Navigation */}
        <div className="flex items-center gap-4 sm:gap-8">
          <nav className="hidden md:flex items-center gap-6 sm:gap-7 text-xs font-medium tracking-wide">
            <button
              onClick={() => onTabChange && onTabChange('cosmos')}
              className={`relative py-5 transition-colors ${
                activeTab === 'cosmos' ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              🪐 3D Solar System
              {activeTab === 'cosmos' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4DEEEA] shadow-[0_0_8px_#4DEEEA]" />
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (onLaunchMission) onLaunchMission();
              }}
              className={`relative py-5 transition-colors ${
                activeTab === 'simulation' ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              🚀 Mission Control
              {activeTab === 'simulation' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4DEEEA] shadow-[0_0_8px_#4DEEEA]" />
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (onOpenFlightManual) onOpenFlightManual();
              }}
              className="py-5 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
              <span>Flight Manual</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (onOpenScienceModal) onOpenScienceModal();
              }}
              className="py-5 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
              <span>Science Specs</span>
            </button>
          </nav>

          {/* Audio Mute Button */}
          <button
            onClick={onToggleAudio}
            className="p-2 rounded-full bg-slate-900/60 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle Audio"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#4DEEEA]" />}
          </button>

          {/* Launch / Resume Mission Pill Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onLaunchMission) onLaunchMission();
            }}
            className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#050B18] font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(77,238,234,0.4)] active:scale-95 flex items-center gap-2"
          >
            <span>{activeMission ? `Resume Sol ${activeMission.current_day}` : 'Launch Mission'}</span>
            <span className="text-sm">🚀</span>
          </button>
        </div>
      </div>

      {/* Full-width Divider Line */}
      <div className="w-full h-[1px] bg-white/10" />
    </header>
  );
}

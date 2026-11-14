import React, { useEffect, useState } from 'react';
import { RotateCw, Radio } from 'lucide-react';
import { sound } from '../utils/soundFx';

const TELEMETRY_LINES = [
  'PROPAGATING LUNAR ORBITAL TRAJECTORY...',
  'COMPUTING RESIDUAL ECLSS MASS BALANCE...',
  'EVALUATING SOLAR ARRAY IRRADIANCE...',
  'ANALYZING REGOLITH IONIZING RADIATION FLUX...',
  'ORBITAL CYCLE SYNCHRONIZATION COMPLETE',
];

interface CinematicCycleTransitionProps {
  currentDay: number;
  onComplete: () => void;
}

export const CinematicCycleTransition: React.FC<CinematicCycleTransitionProps> = ({
  currentDay,
  onComplete,
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    sound.playDayAdvance();

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < TELEMETRY_LINES.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        setTimeout(onComplete, 300);
        return prev;
      });
    }, 220);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-fadeIn">
      {/* High-tech Scanning line */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-lunar-cyan to-transparent animate-pulse shadow-lg shadow-cyan-500/50" />

      <div className="max-w-md w-full hud-card hud-corner-bracket p-6 text-center space-y-5 border-lunar-cyan/60 shadow-2xl relative">
        {/* Header telemetry badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-850 border border-lunar-cyan/40 text-lunar-cyan font-mono text-xs">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>MISSION CONTROL ORBITAL PROPAGATION</span>
        </div>

        {/* Day Increment Display */}
        <div className="py-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
            TRANSITIONING EXPEDITION CYCLE
          </div>
          <div className="flex items-center justify-center gap-4 font-mono font-extrabold text-3xl sm:text-4xl text-white">
            <span className="text-slate-400">SOL {currentDay}</span>
            <span className="text-lunar-cyan animate-pulse">→</span>
            <span className="text-lunar-cyan drop-shadow-lg">SOL {currentDay + 1}</span>
          </div>
        </div>

        {/* Telemetry Log Stream */}
        <div className="bg-space-950 p-3 rounded-lg border border-space-800 text-left font-mono text-[11px] space-y-1.5 shadow-inner">
          {TELEMETRY_LINES.slice(0, step + 1).map((line, idx) => (
            <div
              key={line}
              className={`flex items-center justify-between ${
                idx === step ? 'text-lunar-cyan font-bold' : 'text-slate-400'
              }`}
            >
              <span className="truncate pr-2">{line}</span>
              <span className="text-emerald-400 text-[10px] shrink-0">[OK]</span>
            </div>
          ))}
        </div>

        {/* Spinner */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 pt-2">
          <RotateCw className="w-3.5 h-3.5 animate-spin text-lunar-cyan" />
          <span>Synchronizing telemetry databases...</span>
        </div>
      </div>
    </div>
  );
};

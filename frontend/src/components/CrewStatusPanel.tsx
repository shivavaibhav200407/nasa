import React from 'react';
import { User, AlertCircle, Shield, Heart, Activity } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { CrewMember } from '../types/mission';
import { sound } from '../utils/soundFx';

interface CrewStatusPanelProps {
  crew: CrewMember[];
}

export const CrewStatusPanel: React.FC<CrewStatusPanelProps> = ({ crew }) => {
  const getRoleBadge = (role: string) => {
    if (role.includes('Commander')) return 'CMD';
    if (role.includes('Engineer')) return 'ENG';
    if (role.includes('Life Support')) return 'LSS';
    return 'SCI';
  };

  return (
    <div className="hud-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-space-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-lunar-cyan/10 border border-lunar-cyan/30 text-lunar-cyan">
            <User className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-2">
            <span>Astronaut Flight Medical Biotelemetry</span>
            <span className="text-[10px] text-lunar-cyan font-mono px-1.5 py-0.2 rounded bg-space-950 border border-lunar-cyan/30 hidden sm:inline">
              4 ACTIVE BIOSENSORS
            </span>
          </h3>
        </div>
        <div className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span>STRICT 4/4 SURVIVAL: 1 FATALITY = ABORT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {crew.map((member) => {
          const isDeceased = member.survival_status === 'DECEASED';
          const isCritical = member.survival_status === 'CRITICAL' || member.health < 30.0;
          const isHighStress = member.stress > 70.0;
          const roleCode = getRoleBadge(member.role);

          // Simulated physiological biomarkers derived from health & stress
          const bpm = isDeceased ? 0 : Math.round(68 + (member.stress / 100) * 48 + (100 - member.health) * 0.2);
          const spo2 = isDeceased ? 0 : Math.max(86, Math.min(99, Math.round(98 - (100 - member.health) * 0.1)));

          return (
            <div
              key={member.astronaut_id}
              onClick={() => sound.playClick(1200)}
              className={`p-3.5 rounded-xl border transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                isDeceased
                  ? 'bg-zinc-950/90 border-zinc-700 opacity-60'
                  : isCritical
                  ? 'bg-gradient-to-b from-rose-950/50 to-space-900 border-rose-500/60 shadow-lg shadow-rose-950/40'
                  : 'bg-space-900/80 border-space-700/80 hover:border-lunar-cyan/40 hover:shadow-lg'
              }`}
            >
              {/* Header with Avatar, Role & Status */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-space-800 to-space-700 border border-space-600 flex items-center justify-center text-xs font-mono font-bold text-lunar-cyan shadow-inner">
                      {roleCode}
                    </div>
                    {!isDeceased && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-space-950" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white font-mono leading-tight truncate max-w-[130px]">
                      {member.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[130px]">
                      {member.role}
                    </div>
                  </div>
                </div>
                <StatusBadge status={member.survival_status} size="sm" />
              </div>

              {/* Real-time Physiological Readouts: BPM & SpO2 */}
              {!isDeceased && (
                <div className="grid grid-cols-2 gap-2 my-2.5 p-2 rounded-lg bg-space-950/80 border border-space-800 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">HR (BPM):</span>
                    <span className={`font-bold flex items-center gap-1 ${bpm > 100 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                      <Heart className="w-2.5 h-2.5 fill-current text-rose-500" />
                      <span>{bpm}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-l border-space-800 pl-2">
                    <span className="text-slate-400 text-[10px]">SpO₂:</span>
                    <span className={`font-bold ${spo2 < 92 ? 'text-amber-400' : 'text-cyan-300'}`}>
                      {spo2}%
                    </span>
                  </div>
                </div>
              )}

              {/* Vitals Telemetry */}
              <div className="space-y-2.5 text-xs font-mono">
                {/* Physiological Health with miniature ECG */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span>Health Index:</span>
                    </span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        member.health > 70
                          ? 'text-emerald-400'
                          : member.health > 30
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {/* Animated miniature heartbeat wave */}
                      {!isDeceased && (
                        <svg className="w-8 h-3 text-current overflow-hidden inline" viewBox="0 0 32 10">
                          <path
                            d="M 0 5 L 8 5 L 11 1 L 15 9 L 18 3 L 22 5 L 32 5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="animate-pulse"
                          />
                        </svg>
                      )}
                      <span>{member.health.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-space-950 rounded-full h-1.5 overflow-hidden border border-space-800/80">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        member.health > 70
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : member.health > 30
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-600 to-red-500'
                      }`}
                      style={{ width: `${Math.max(member.health, 0)}%` }}
                    />
                  </div>
                </div>

                {/* Workload Stress */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <AlertCircle className={`w-3 h-3 ${isHighStress ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                      <span>Workload Stress:</span>
                    </span>
                    <span className={`font-bold ${isHighStress ? 'text-rose-400' : 'text-slate-200'}`}>
                      {member.stress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-space-950 rounded-full h-1.5 overflow-hidden border border-space-800/80">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isHighStress
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                      }`}
                      style={{ width: `${Math.min(member.stress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cumulative Radiation Burden */}
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-space-800/80 text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>Radiation Dose:</span>
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      member.cumulative_radiation > 45.0
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                        : member.cumulative_radiation > 25.0
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-space-850 text-purple-300 border border-purple-500/20'
                    }`}
                  >
                    {member.cumulative_radiation.toFixed(2)} mSv
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

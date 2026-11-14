import React from 'react';
import { StatusBadge } from './StatusBadge';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface RadialGaugeCardProps {
  code: string;
  title: string;
  value: number;
  unit: string;
  max: number;
  criticalFloor?: number;
  delta?: number;
  status: 'nominal' | 'warning' | 'critical';
  icon: React.ReactNode;
  colorGrad: string;
  footerNote: string;
}

export const RadialGaugeCard: React.FC<RadialGaugeCardProps> = ({
  code,
  title,
  value,
  unit,
  max,
  criticalFloor,
  delta,
  status,
  icon,
  colorGrad,
  footerNote,
}) => {
  // Arc calculation: 220 degree arc from -200 deg to 20 deg
  const radius = 38;
  const stroke = 6;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = normalizedValue / max;

  const circumference = 2 * Math.PI * radius;
  // Arc is ~220 degrees out of 360 (approx 61% of total circle)
  const arcLength = circumference * (220 / 360);
  const strokeDashoffset = arcLength - percentage * arcLength;

  const getTrendBadge = (d?: number) => {
    if (d === undefined || Math.abs(d) < 0.05) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5 rounded bg-space-850 text-slate-400 border border-space-800">
          <Minus className="w-2.5 h-2.5" />
          <span>STBL</span>
        </span>
      );
    }
    const isGain = d > 0;
    const formatted = d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1);

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5 rounded border ${
          isGain
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
            : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
        }`}
      >
        {isGain ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
        <span>{formatted}</span>
      </span>
    );
  };

  return (
    <div className="hud-card p-3.5 flex flex-col justify-between group hover:border-space-600 transition-all duration-300 relative overflow-hidden">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-space-850 border border-space-700/80 shadow-inner">
            {icon}
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider">{code}</div>
            <div className="text-[11px] font-mono text-slate-200 font-bold truncate max-w-[95px]">{title}</div>
          </div>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Central Circular Gauge */}
      <div className="relative flex items-center justify-center my-2">
        <svg width="100" height="85" viewBox="0 0 100 85" className="overflow-visible">
          <defs>
            <linearGradient id={`grad-${code}`} x1="0%" y1="100%" x2="100%" y2="0%">
              {colorGrad === 'cyan' && (
                <>
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </>
              )}
              {colorGrad === 'amber' && (
                <>
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </>
              )}
              {colorGrad === 'emerald' && (
                <>
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#34d399" />
                </>
              )}
              {colorGrad === 'rose' && (
                <>
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#fb7185" />
                </>
              )}
              {colorGrad === 'purple' && (
                <>
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#c084fc" />
                </>
              )}
            </linearGradient>
            <filter id={`glow-${code}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Meter Track */}
          <path
            d="M 18 68 A 38 38 0 1 1 82 68"
            fill="none"
            stroke="#1e293b"
            strokeWidth={stroke}
            strokeLinecap="round"
          />

          {/* Critical floor marker arc / indicator */}
          {criticalFloor !== undefined && (
            <path
              d="M 18 68 A 38 38 0 0 1 28 45"
              fill="none"
              stroke="rgba(244, 63, 94, 0.4)"
              strokeWidth={stroke + 1}
              strokeLinecap="round"
            />
          )}

          {/* Active Progress Arc */}
          <path
            d="M 18 68 A 38 38 0 1 1 82 68"
            fill="none"
            stroke={`url(#grad-${code})`}
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#glow-${code})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Value overlay inside the gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-xl font-mono font-extrabold text-white tracking-tight leading-none drop-shadow">
            {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{unit}</span>
        </div>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-space-850">
        <span className="text-slate-400 truncate max-w-[100px]">{footerNote}</span>
        <div>{getTrendBadge(delta)}</div>
      </div>
    </div>
  );
};

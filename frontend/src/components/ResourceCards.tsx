import React, { useState } from 'react';
import { Wind, Droplets, Zap, Apple, ShieldAlert, HeartPulse, Gauge, LayoutGrid } from 'lucide-react';
import { RadialGaugeCard } from './RadialGaugeCard';
import { StatusBadge } from './StatusBadge';
import type { SystemLevels } from '../types/mission';
import { sound } from '../utils/soundFx';

interface ResourceCardsProps {
  systems: SystemLevels;
  deltas?: {
    oxygen_delta?: number;
    water_delta?: number;
    battery_delta?: number;
    food_delta?: number;
    radiation_absorbed?: number;
  };
  avgCrewHealth?: number;
}

export const ResourceCards: React.FC<ResourceCardsProps> = ({
  systems,
  deltas,
  avgCrewHealth = 100.0,
}) => {
  const [viewMode, setViewMode] = useState<'radial' | 'compact'>('radial');

  const getO2Status = (): 'nominal' | 'warning' | 'critical' => {
    if (systems.oxygen_level <= 15.0) return 'critical';
    if (systems.oxygen_level <= 35.0) return 'warning';
    return 'nominal';
  };

  const getWaterStatus = (): 'nominal' | 'warning' | 'critical' => {
    if (systems.water_level <= 20.0) return 'critical';
    if (systems.water_level <= 50.0) return 'warning';
    return 'nominal';
  };

  const getEnergyStatus = (): 'nominal' | 'warning' | 'critical' => {
    if (systems.battery_level <= 10.0) return 'critical';
    if (systems.battery_level <= 40.0) return 'warning';
    return 'nominal';
  };

  const getFoodStatus = (): 'nominal' | 'warning' | 'critical' => {
    if (systems.food_level <= 20.0) return 'critical';
    if (systems.food_level <= 60.0) return 'warning';
    return 'nominal';
  };

  const getRadiationStatus = (): 'nominal' | 'warning' | 'critical' => {
    if (systems.radiation_daily_dose > 0.4) return 'warning';
    return 'nominal';
  };

  const getCrewHealthStatus = (): 'nominal' | 'warning' | 'critical' => {
    if (avgCrewHealth <= 30.0) return 'critical';
    if (avgCrewHealth <= 70.0) return 'warning';
    return 'nominal';
  };

  const gauges = [
    {
      code: 'SYS.O2',
      title: 'Oxygen Reserve',
      value: systems.oxygen_level,
      unit: 'units',
      max: 120.0,
      criticalFloor: 15.0,
      delta: deltas?.oxygen_delta,
      status: getO2Status(),
      icon: <Wind className="w-3.5 h-3.5 text-lunar-cyan" />,
      colorGrad: 'cyan',
      glowColor: 'rgba(56,189,248,0.5)',
      footerNote: 'Critical Floor: 15.0',
    },
    {
      code: 'SYS.H2O',
      title: 'Potable Water',
      value: systems.water_level,
      unit: 'Liters',
      max: 350.0,
      criticalFloor: 20.0,
      delta: deltas?.water_delta,
      status: getWaterStatus(),
      icon: <Droplets className="w-3.5 h-3.5 text-cyan-400" />,
      colorGrad: 'cyan',
      glowColor: 'rgba(6,182,212,0.5)',
      footerNote: 'Recycler Loop: 90%',
    },
    {
      code: 'SYS.PWR',
      title: 'Battery Reserve',
      value: systems.battery_level,
      unit: 'kWh',
      max: 120.0,
      criticalFloor: 10.0,
      delta: deltas?.battery_delta,
      status: getEnergyStatus(),
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      colorGrad: 'amber',
      glowColor: 'rgba(245,158,11,0.5)',
      footerNote: `Gen ${systems.solar_generation}kW | Load ${systems.total_energy_load}kW`,
    },
    {
      code: 'SYS.BIO',
      title: 'Food Rations',
      value: systems.food_level,
      unit: 'rations',
      max: 240.0,
      criticalFloor: 20.0,
      delta: deltas?.food_delta,
      status: getFoodStatus(),
      icon: <Apple className="w-3.5 h-3.5 text-emerald-400" />,
      colorGrad: 'emerald',
      glowColor: 'rgba(16,185,129,0.5)',
      footerNote: `Crop Cycle: ${systems.greenhouse_progress}/15d`,
    },
    {
      code: 'SYS.RAD',
      title: 'Radiation Flux',
      value: systems.radiation_daily_dose,
      unit: 'mSv/d',
      max: 1.0,
      criticalFloor: 0.8,
      delta: deltas?.radiation_absorbed,
      status: getRadiationStatus(),
      icon: <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />,
      colorGrad: 'purple',
      glowColor: 'rgba(192,132,252,0.5)',
      footerNote: 'Shield Attenuated',
    },
    {
      code: 'SYS.VIT',
      title: 'Crew Vitals Avg',
      value: avgCrewHealth,
      unit: '% vitals',
      max: 100.0,
      criticalFloor: 30.0,
      delta: undefined,
      status: getCrewHealthStatus(),
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-400" />,
      colorGrad: 'rose',
      glowColor: 'rgba(244,63,94,0.5)',
      footerNote: 'Strict 4/4 Survival',
    },
  ];

  return (
    <div className="space-y-2">
      {/* View mode toggle pill */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-lunar-cyan animate-pulse" />
          <span>Real-Time Closed-Loop ECLSS Telemetry Gauges</span>
        </span>

        <div className="flex items-center gap-1 bg-space-950 p-0.5 rounded-lg border border-space-800 text-[10px] font-mono shadow-inner">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('radial');
            }}
            className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
              viewMode === 'radial'
                ? 'bg-lunar-cyan text-space-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3 h-3" />
            <span>Radial Dials</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('compact');
            }}
            className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
              viewMode === 'compact'
                ? 'bg-lunar-cyan text-space-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Linear Tiles</span>
          </button>
        </div>
      </div>

      {viewMode === 'radial' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {gauges.map((g) => (
            <RadialGaugeCard
              key={g.code}
              code={g.code}
              title={g.title}
              value={g.value}
              unit={g.unit}
              max={g.max}
              criticalFloor={g.criticalFloor}
              delta={g.delta}
              status={g.status}
              icon={g.icon}
              colorGrad={g.colorGrad}
              footerNote={g.footerNote}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {gauges.map((g) => (
            <div
              key={g.code}
              className="hud-card p-3 flex flex-col justify-between hover:border-space-600 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-space-850 border border-space-700/80">
                      {g.icon}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{g.code}</span>
                  </div>
                  <StatusBadge status={g.status} size="sm" />
                </div>
                <div className="text-[11px] font-mono text-slate-300 font-semibold truncate">{g.title}</div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-bold font-mono text-white">
                    {g.value.toFixed(g.value < 10 ? 1 : 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{g.unit}</span>
                </div>
              </div>

              <div className="mt-1 pt-1.5 border-t border-space-850 text-[10px] font-mono text-slate-400 truncate">
                {g.footerNote}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

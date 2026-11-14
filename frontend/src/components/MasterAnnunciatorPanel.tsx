import React from 'react';
import type { SystemLevels, CrewMember } from '../types/mission';
import { AlertTriangle, Bell, ShieldCheck } from 'lucide-react';

interface MasterAnnunciatorPanelProps {
  systems: SystemLevels;
  crew: CrewMember[];
  onInspectSubsystem?: (sysKey: string) => void;
}

export const MasterAnnunciatorPanel: React.FC<MasterAnnunciatorPanelProps> = ({
  systems,
  crew,
  onInspectSubsystem,
}) => {
  // Compute statuses for annunciator tiles
  const isO2Low = systems.oxygen_level <= 35.0;
  const isO2Crit = systems.oxygen_level <= 15.0;

  const isWaterLow = systems.water_level <= 50.0;
  const isWaterCrit = systems.water_level <= 20.0;

  const isBattLow = systems.battery_level <= 40.0;
  const isBattCrit = systems.battery_level <= 10.0;

  const isFoodLow = systems.food_level <= 60.0;
  const isFoodCrit = systems.food_level <= 20.0;

  const isRadHigh = systems.radiation_daily_dose > 0.4;
  const isRadCrit = systems.radiation_daily_dose > 0.7;

  const minCrewHealth = Math.min(...crew.map((c) => c.health));
  const maxCrewStress = Math.max(...crew.map((c) => c.stress));
  const isCrewCrit = minCrewHealth < 30.0 || maxCrewStress > 85.0;
  const isCrewWarn = minCrewHealth < 60.0 || maxCrewStress > 65.0;

  const hasAnyCritical = isO2Crit || isWaterCrit || isBattCrit || isFoodCrit || isRadCrit || isCrewCrit;
  const hasAnyWarning = isO2Low || isWaterLow || isBattLow || isFoodLow || isRadHigh || isCrewWarn;

  const tiles = [
    { id: 'o2', label: 'O₂ PRESS', active: isO2Low, crit: isO2Crit },
    { id: 'co2', label: 'CO₂ SCRUB', active: systems.oxygen_level < 30, crit: systems.oxygen_level < 18 },
    { id: 'water', label: 'H₂O RESV', active: isWaterLow, crit: isWaterCrit },
    { id: 'loop', label: 'H₂O RECYC', active: systems.water_level < 40, crit: systems.water_level < 20 },
    { id: 'bus_a', label: 'PWR BUS-A', active: systems.solar_generation < 45, crit: systems.solar_generation < 25 },
    { id: 'bus_b', label: 'BATT DCHG', active: isBattLow, crit: isBattCrit },
    { id: 'bio', label: 'BIO HARV', active: isFoodLow, crit: isFoodCrit },
    { id: 'rad', label: 'RAD FLUX', active: isRadHigh, crit: isRadCrit },
    { id: 'vit', label: 'CREW VIT', active: isCrewWarn, crit: isCrewCrit },
    { id: 'dsn', label: 'COMM DSN', active: false, crit: false },
    { id: 'therm', label: 'THERMAL', active: false, crit: false },
    { id: 'hull', label: 'HULL PRESS', active: false, crit: false },
  ];

  return (
    <div className="bg-space-950/90 border border-space-800 rounded-xl p-3 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-space-800/80">
        <div className="flex items-center gap-2">
          {hasAnyCritical ? (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
          ) : hasAnyWarning ? (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          )}

          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <span>MASTER CAUTION & WARNING ANNUNCIATOR</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          {hasAnyCritical ? (
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>MASTER ALARM ACTIVE</span>
            </span>
          ) : hasAnyWarning ? (
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-bold flex items-center gap-1">
              <Bell className="w-3 h-3 text-amber-400" />
              <span>CAUTION: ADVISORY LIMITS</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>ALL BUSES NOMINAL</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of Authentic Annunciator Backlit Tiles */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
        {tiles.map((t) => {
          let styleClass = 'bg-space-900/90 text-slate-600 border-space-850';
          if (t.crit) {
            styleClass = 'bg-rose-950 text-rose-200 border-rose-500 shadow-lg shadow-rose-950/50 animate-pulse font-extrabold';
          } else if (t.active) {
            styleClass = 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-md shadow-amber-950/50 font-bold';
          }

          return (
            <button
              key={t.id}
              onClick={() => onInspectSubsystem?.(t.id)}
              className={`p-1.5 rounded border font-mono text-[10px] text-center transition-all truncate select-none ${styleClass}`}
              title={`${t.label}: ${t.crit ? 'CRITICAL DEFICIT' : t.active ? 'CAUTION WARNING' : 'NOMINAL'}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

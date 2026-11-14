import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Zap,
  Wind,
  Droplets,
  Apple,
  Shield,
  AlertTriangle,
  RotateCcw,
  Cpu,
} from 'lucide-react';
import { LayoutHeader } from '../components/LayoutHeader';
import { Button, SliderWithStepper, ToggleSwitch } from '../components/ui';
import type { AdvanceDayPayload, MissionDetail, SubsystemMode } from '../types/mission';
import { sound } from '../utils/soundFx';

interface EngineeringPageProps {
  mission: MissionDetail;
  allocations: AdvanceDayPayload;
  onSaveAllocations: (updated: AdvanceDayPayload) => void;
  onNavigate: (screen: 'dashboard' | 'engineering' | 'events') => void;
  onExit: () => void;
}

export const EngineeringPage: React.FC<EngineeringPageProps> = ({
  mission,
  allocations,
  onSaveAllocations,
  onNavigate,
  onExit,
}) => {
  const [staged, setStaged] = useState<AdvanceDayPayload>({ ...allocations });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'o2' | 'h2o' | 'bio' | 'rad'>('all');

  const solarGen = mission.systems.solar_generation;
  const batteryLevel = mission.systems.battery_level;
  const maxAvailableEnergy = solarGen + batteryLevel;

  // Compute total staged power demand
  const baseHabitatLoad = 15.0;
  const totalStagedDemand =
    baseHabitatLoad +
    staged.power_allocations.life_support +
    staged.power_allocations.water_recycling +
    (staged.greenhouse_active ? staged.power_allocations.greenhouse : 0) +
    (staged.storm_shelter_posture ? staged.power_allocations.radiation_shelter : 0);

  const isOverAllocated = totalStagedDemand > maxAvailableEnergy;

  const handleApply = () => {
    if (isOverAllocated) return;
    sound.playSuccess();
    onSaveAllocations(staged);
    setSavedSuccess(true);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 450);
  };

  const handleReset = () => {
    sound.playClick(800);
    setStaged({
      expected_day: mission.current_day,
      power_allocations: {
        life_support: 12.0,
        water_recycling: 8.0,
        greenhouse: 10.0,
        radiation_shelter: 0.0,
      },
      water_allocations: {
        crew_share: 4.0,
        greenhouse_share: 2.0,
        electrolysis_share: 1.0,
      },
      oxygen_mode: 'NOMINAL',
      greenhouse_active: true,
      storm_shelter_posture: false,
      crew_rest_posture: false,
    });
  };

  return (
    <div className="min-h-screen bg-astra-bg text-astra-text flex flex-col selection:bg-astra-accent/25">
      <LayoutHeader
        currentScreen="engineering"
        onNavigate={onNavigate}
        missionId={mission.id}
        missionLabel={mission.label}
        dayNumber={mission.current_day}
        difficultyMode={mission.difficulty_mode}
        missionStatus={mission.status}
        onExit={onExit}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('dashboard');
            }}
            className="flex items-center gap-2 text-xs font-mono text-astra-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Mission Control Dashboard</span>
          </button>
          <div className="text-xs font-mono text-astra-accent font-bold flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            <span>SUBSYSTEM MICROGRID POWER MATRIX</span>
          </div>
        </div>

        {/* Energy Budget & Balance Monitor */}
        <div className="hud-panel hud-corner-bracket p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-astra-caution/15 border border-astra-caution/40 text-astra-caution shadow-inner">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                  Outpost Electrical Microgrid & Bus Balance
                </h2>
                <div className="text-[11px] font-mono text-astra-muted">
                  Solar Bus Generation + Battery Storage Discharge
                </div>
              </div>
            </div>

            <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-astra-raised border border-astra-border text-right">
              <span className="text-astra-muted">Available Cap:</span>{' '}
              <span className="text-astra-caution font-bold">{Math.round(maxAvailableEnergy)} kW</span>{' '}
              <span className="text-astra-dim text-[10px]">
                ({solarGen} kW Sol + {batteryLevel} kWh Batt)
              </span>
            </div>
          </div>

          {/* Microgrid Barometer */}
          <div className="space-y-1">
            <div className="w-full bg-astra-raised rounded-full h-3.5 overflow-hidden border border-astra-border p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverAllocated
                    ? 'bg-astra-critical shadow-glow-critical'
                    : totalStagedDemand > solarGen
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-astra-nominal to-astra-accent'
                }`}
                style={{
                  width: `${Math.min(
                    (totalStagedDemand / Math.max(maxAvailableEnergy, 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-astra-text pt-1">
            <div>
              Total Scheduled Demand:{' '}
              <span className={`font-bold text-sm ${isOverAllocated ? 'text-astra-critical' : 'text-white'}`}>
                {totalStagedDemand.toFixed(1)} kW
              </span>{' '}
              <span className="text-astra-dim text-[11px]">(Base Habitat Load: {baseHabitatLoad} kW)</span>
            </div>
            {isOverAllocated ? (
              <span className="text-astra-critical font-bold flex items-center gap-1.5 px-2.5 py-1 rounded bg-astra-critical/20 border border-astra-critical/50 animate-pulse">
                <AlertTriangle className="w-4 h-4" /> OVER-ALLOCATION: Demand exceeds generation + batteries!
              </span>
            ) : totalStagedDemand > solarGen ? (
              <span className="text-astra-caution px-2.5 py-1 rounded bg-astra-caution/15 border border-astra-caution/30">
                Discharging battery by {(totalStagedDemand - solarGen).toFixed(1)} kW daily
              </span>
            ) : (
              <span className="text-astra-nominal px-2.5 py-1 rounded bg-astra-nominal/15 border border-astra-nominal/30">
                Surplus +{(solarGen - totalStagedDemand).toFixed(1)} kW charging batteries
              </span>
            )}
          </div>
        </div>

        {/* Subsystem Tabs */}
        <div className="flex items-center gap-2 border-b border-astra-border pb-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Subsystems' },
            { id: 'o2', label: 'Atmosphere (O2)' },
            { id: 'h2o', label: 'Water Recycling' },
            { id: 'bio', label: 'Hydroponics (Food)' },
            { id: 'rad', label: 'Radiation & Rest' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick(1200);
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-astra-accent text-astra-bg shadow-glow-accent'
                  : 'text-astra-muted hover:text-white bg-astra-surface border border-astra-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subsystems Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Oxygen & Life Support */}
          {(activeTab === 'all' || activeTab === 'o2') && (
            <div className="hud-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-astra-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-astra-accent/15 border border-astra-accent/30 text-astra-accent">
                    <Wind className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    SYS.O2 // Atmospheric Electrolysis
                  </h3>
                </div>
                <span className="text-xs font-mono text-astra-accent font-bold px-2 py-0.5 rounded bg-astra-raised border border-astra-border">
                  {staged.power_allocations.life_support} kW
                </span>
              </div>

              <SliderWithStepper
                id="o2-power"
                label="Electrolysis & Scrubber Power"
                value={staged.power_allocations.life_support}
                min={0}
                max={24}
                step={1}
                unit=" kW"
                onChange={(val) => {
                  sound.playSliderTick();
                  setStaged({
                    ...staged,
                    power_allocations: {
                      ...staged.power_allocations,
                      life_support: val,
                    },
                  });
                }}
              />

              <div>
                <label className="block text-[11px] font-mono text-astra-muted mb-1.5 uppercase tracking-wide">
                  Life Support Operational Posture:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CONSERVATION', 'NOMINAL', 'HIGH'] as SubsystemMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        sound.playToggle(true);
                        setStaged({ ...staged, oxygen_mode: m });
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
                        staged.oxygen_mode === m
                          ? 'bg-astra-accent text-astra-bg shadow-glow-accent'
                          : 'bg-astra-raised text-astra-muted hover:text-white border border-astra-border'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-astra-dim font-sans pt-1">
                [FACT] Oxygen production splits water via electrolysis, requiring both electrical power and water feedstock.
              </p>
            </div>
          )}

          {/* 2. Water Recycling & Routing */}
          {(activeTab === 'all' || activeTab === 'h2o') && (
            <div className="hud-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-astra-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-400">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    SYS.H2O // Reclamation & Routing
                  </h3>
                </div>
                <span className="text-xs font-mono text-sky-400 font-bold px-2 py-0.5 rounded bg-astra-raised border border-astra-border">
                  {staged.power_allocations.water_recycling} kW
                </span>
              </div>

              <SliderWithStepper
                id="water-power"
                label="Distillation & Filter Power"
                value={staged.power_allocations.water_recycling}
                min={0}
                max={18}
                step={1}
                unit=" kW"
                onChange={(val) => {
                  sound.playSliderTick();
                  setStaged({
                    ...staged,
                    power_allocations: {
                      ...staged.power_allocations,
                      water_recycling: val,
                    },
                  });
                }}
              />

              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-lg bg-astra-raised border border-astra-border text-center">
                  <span className="text-astra-muted text-[10px] block uppercase">Crew Hydration</span>
                  <span className="font-bold text-white text-sm">{staged.water_allocations.crew_share} L/d</span>
                </div>
                <div className="p-2.5 rounded-lg bg-astra-raised border border-astra-border text-center">
                  <span className="text-astra-muted text-[10px] block uppercase">Greenhouse</span>
                  <span className="font-bold text-white text-sm">{staged.water_allocations.greenhouse_share} L/d</span>
                </div>
                <div className="p-2.5 rounded-lg bg-astra-raised border border-astra-border text-center">
                  <span className="text-astra-muted text-[10px] block uppercase">Electrolysis</span>
                  <span className="font-bold text-white text-sm">{staged.water_allocations.electrolysis_share} L/d</span>
                </div>
              </div>

              <p className="text-[11px] text-astra-dim font-sans pt-1">
                [FACT] Closed-loop recycling is never 100% efficient; irreversible brine loss occurs every single cycle.
              </p>
            </div>
          )}

          {/* 3. Greenhouse (Food Production) */}
          {(activeTab === 'all' || activeTab === 'bio') && (
            <div className="hud-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-astra-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                    <Apple className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    SYS.BIO // Hydroponic Cultivation
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-astra-raised border border-astra-border">
                  {staged.greenhouse_active ? `${staged.power_allocations.greenhouse} kW` : 'STANDBY'}
                </span>
              </div>

              <ToggleSwitch
                id="gh_toggle"
                label="Hydroponic Lighting & Irrigation"
                description="Power active LED grow light arrays and circulating nutrient pumps."
                checked={staged.greenhouse_active}
                onChange={(checked) => {
                  sound.playToggle(checked);
                  setStaged({ ...staged, greenhouse_active: checked });
                }}
              />

              {staged.greenhouse_active && (
                <SliderWithStepper
                  id="gh-power"
                  label="Lighting & Thermal Regulation"
                  value={staged.power_allocations.greenhouse}
                  min={4}
                  max={16}
                  step={1}
                  unit=" kW"
                  onChange={(val) => {
                    sound.playSliderTick();
                    setStaged({
                      ...staged,
                      power_allocations: {
                        ...staged.power_allocations,
                        greenhouse: val,
                      },
                    });
                  }}
                />
              )}

              <p className="text-[11px] text-astra-dim font-sans pt-1">
                [FACT] Crops require daily water, lighting energy, and a multi-day growth cycle before yielding food.
              </p>
            </div>
          )}

          {/* 4. Radiation Safety & Crew Scheduling */}
          {(activeTab === 'all' || activeTab === 'rad') && (
            <div className="hud-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-astra-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    SYS.RAD // Deflector & Crew Posture
                  </h3>
                </div>
              </div>

              <ToggleSwitch
                id="storm_shelter_toggle"
                label="Storm Shelter Active Shielding"
                description={
                  staged.storm_shelter_posture
                    ? 'Auxiliary electromagnetic deflector coils active (+10 kW demand, 80% risk reduction)'
                    : 'Passive structural regolith shield only (50% risk attenuation)'
                }
                checked={staged.storm_shelter_posture}
                onChange={(checked) => {
                  sound.playToggle(checked);
                  setStaged({
                    ...staged,
                    storm_shelter_posture: checked,
                    power_allocations: {
                      ...staged.power_allocations,
                      radiation_shelter: checked ? 10.0 : 0.0,
                    },
                  });
                }}
              />

              <ToggleSwitch
                id="crew_rest_toggle"
                label="Crew Rest Posture"
                description={
                  staged.crew_rest_posture
                    ? 'Astronauts assigned sleep & restorative cycle (accelerates health recovery, reduces stress)'
                    : 'Standard operational mission shift'
                }
                checked={staged.crew_rest_posture}
                onChange={(checked) => {
                  sound.playToggle(checked);
                  setStaged({ ...staged, crew_rest_posture: checked });
                }}
              />

              <p className="text-[11px] text-astra-dim font-sans pt-1">
                [FACT] Shielding reduces radiation risk but never gives complete protection.
              </p>
            </div>
          )}
        </div>

        {/* Action Confirmation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-astra-border">
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={handleReset}
          >
            Reset to Standard Defaults
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sound.playClick();
                onNavigate('dashboard');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={isOverAllocated}
              icon={<Check size={16} />}
              onClick={handleApply}
            >
              {savedSuccess ? 'Allocations Applied!' : 'Apply Allocations & Return to Dashboard'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

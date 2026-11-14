import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Compass,
  Wind,
  Droplets,
  Zap,
  Apple,
  Shield,
  Heart,
  Award,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/soundFx';

export interface FlightManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlightManualModal: React.FC<FlightManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'mission' | 'systems' | 'operations' | 'scoring' | 'rules'>('mission');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-astra-bg/85 backdrop-blur-xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-title"
    >
      <div className="w-full max-w-4xl bg-astra-surface border border-astra-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-astra-border bg-astra-raised/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-astra-accent/15 border border-astra-accent/40 flex items-center justify-center text-astra-accent">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="manual-title" className="font-serif text-lg font-bold text-white tracking-wide">
                  ASTRA Astronaut Flight Manual
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-astra-accent/15 text-astra-accent border border-astra-accent/30 font-semibold uppercase">
                  NASA Space Apps 2026 Edition
                </span>
              </div>
              <p className="text-xs text-astra-muted font-sans">
                Official Commander's Field Guide: Closed-Loop ECLSS Operations & Rules of Engagement
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-astra-muted hover:text-white hover:bg-astra-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent"
            aria-label="Close Flight Manual"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-astra-border bg-astra-surface/90 overflow-x-auto">
          {[
            { id: 'mission', label: '1. Mission Directives', icon: <Compass size={14} /> },
            { id: 'systems', label: '2. The 6 ECLSS Loops', icon: <Layers size={14} /> },
            { id: 'operations', label: '3. Engineering & Postures', icon: <Zap size={14} /> },
            { id: 'scoring', label: '4. Scoring & Modes', icon: <Award size={14} /> },
            { id: 'rules', label: '5. Science [FACT] Index', icon: <Sparkles size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick(1300);
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-astra-accent text-white bg-astra-raised/40'
                  : 'border-transparent text-astra-muted hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-astra-text font-sans leading-relaxed">
          {/* TAB 1: MISSION DIRECTIVES */}
          {activeTab === 'mission' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-astra-raised border border-astra-border space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-astra-accent font-bold">
                  Prime Mission Objective
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  90-Day Lunar Surface Outpost Survival
                </h3>
                <p className="text-xs text-astra-text leading-relaxed">
                  As Mission Commander at <strong>Artemis Base Beta</strong>, you must sustain a four-astronaut crew
                  for 90 consecutive sols (lunar days). The outpost is completely isolated from Earth resupply: every breath of oxygen,
                  sip of water, kilowatt of solar power, and ration of food must be harvested and recycled within closed-loop limits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-astra-critical/10 border border-astra-critical/40 space-y-2">
                  <div className="flex items-center gap-2 text-astra-critical font-bold text-xs uppercase font-mono">
                    <AlertTriangle size={15} />
                    <span>Strict 4/4 Survival Rule</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed">
                    Human life is paramount. If any of the four astronauts perishes due to atmospheric hypoxia, dehydration,
                    starvation, or radiation poisoning, the mission is terminated immediately as an <strong>Expedition Failure</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-astra-nominal/10 border border-astra-nominal/40 space-y-2">
                  <div className="flex items-center gap-2 text-astra-nominal font-bold text-xs uppercase font-mono">
                    <Award size={15} />
                    <span>Mission Success Condition</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed">
                    All four crew members must remain alive at the conclusion of Day 90. Your performance score is calculated
                    based on crew health, ending resource reserves, radiation mitigation, and emergency response quality.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-astra-muted font-bold mb-3">
                  The Four Assigned Astronauts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { role: 'Commander', name: 'Dr. Elena Rostova', desc: 'Leads operational prioritization; maintains crew psychological morale.' },
                    { role: 'Flight Engineer', name: 'Marcus Chen', desc: 'Oversees the solar power bus, batteries, and habitat structural integrity.' },
                    { role: 'Life Support Specialist', name: 'Sarah Jenkins', desc: 'Manages oxygen electrolysis, CO2 scrubbers, and water reclamation.' },
                    { role: 'Science Officer', name: 'Dr. Tariq Al-Mansoor', desc: 'Operates hydroponic food cultivation and monitors ionizing radiation.' },
                  ].map((c) => (
                    <div key={c.role} className="p-3 rounded-lg bg-astra-raised border border-astra-border text-xs">
                      <div className="font-serif font-bold text-white">{c.name}</div>
                      <div className="text-[11px] font-mono text-astra-accent mb-1">{c.role}</div>
                      <p className="text-astra-muted text-[11px] leading-snug">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE 6 ECLSS LOOPS */}
          {activeTab === 'systems' && (
            <div className="space-y-4">
              <p className="text-xs text-astra-muted">
                Each subsystem operates through coupled closed-loop conservation equations. Adjusting one system directly impacts others.
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-astra-raised border border-astra-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-white flex items-center gap-2 text-sm">
                      <Wind className="w-4 h-4 text-astra-accent" />
                      1. Atmospheric O2 & CO2 Scrubbing (SYS.O2)
                    </span>
                    <span className="text-[10px] font-mono text-astra-accent">CRITICAL FLOOR: 15.0%</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed mb-2">
                    Four astronauts consume O2 and exhale CO2. Oxygen is replenished through water electrolysis (splitting H2O into O2 and H2),
                    which requires electrical power and water feedstock.
                  </p>
                  <div className="p-2 rounded bg-astra-surface font-mono text-[11px] text-astra-accent">
                    Consumption: 0.84 kg O2 / astronaut / day • Scrubber Demand: 12.0 kW nominal
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-astra-raised border border-astra-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-white flex items-center gap-2 text-sm">
                      <Droplets className="w-4 h-4 text-sky-400" />
                      2. Potable Water & Distillation (SYS.H2O)
                    </span>
                    <span className="text-[10px] font-mono text-sky-400">CRITICAL FLOOR: 20.0 L</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed mb-2">
                    Graywater and urine are recycled via vacuum distillation and catalytic oxidation.
                    <strong> Scientific Fact:</strong> Recycling is imperfect—an irreversible 10% brine loss occurs every cycle.
                  </p>
                  <div className="p-2 rounded bg-astra-surface font-mono text-[11px] text-sky-400">
                    Crew Need: 2.5 - 4.0 L / day • Recycler Efficiency: 90% closed loop
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-astra-raised border border-astra-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-white flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-astra-caution" />
                      3. Electrical Power Microgrid (SYS.PWR)
                    </span>
                    <span className="text-[10px] font-mono text-astra-caution">CRITICAL FLOOR: 10.0 kWh</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed mb-2">
                    High-efficiency PV solar arrays generate electricity. Surplus charges the 120 kWh battery storage bank.
                    Habitat baseline housekeeping demands an inflexible 15.0 kW load continuously.
                  </p>
                  <div className="p-2 rounded bg-astra-surface font-mono text-[11px] text-astra-caution">
                    Day Generation: ~65 kW • Storage: 120 kWh • Base Load: 15 kW
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-astra-raised border border-astra-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-white flex items-center gap-2 text-sm">
                      <Apple className="w-4 h-4 text-astra-nominal" />
                      4. Food Rations & Hydroponic Greenhouse (SYS.BIO)
                    </span>
                    <span className="text-[10px] font-mono text-astra-nominal">CRITICAL FLOOR: 20 meals</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed mb-2">
                    Astronauts consume 4 packaged rations daily. The greenhouse requires water, 10 kW lighting, and 15 growth days
                    to yield a supplementary harvest of 60 fresh food rations.
                  </p>
                  <div className="p-2 rounded bg-astra-surface font-mono text-[11px] text-astra-nominal">
                    Consumption: 4 meals / day • Harvest Yield: 60 rations every 15 growth days
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-astra-raised border border-astra-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-white flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-purple-400" />
                      5. Radiation Shielding & Storm Shelters (SYS.RAD)
                    </span>
                    <span className="text-[10px] font-mono text-purple-400">MAX TOLERANCE: 5.0 mSv/d</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed mb-2">
                    Passive lunar regolith provides 50% shielding against background galactic cosmic rays.
                    Active Storm Shelter posture engages electromagnetic deflector coils (+10 kW), elevating protection to 80%.
                  </p>
                  <div className="p-2 rounded bg-astra-surface font-mono text-[11px] text-purple-400">
                    Regolith Shielding: 50% attenuation • Active Shelter: 80% attenuation (+10 kW)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-astra-raised border border-astra-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-white flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-astra-critical" />
                      6. Flight Crew Biometrics (SYS.VIT)
                    </span>
                    <span className="text-[10px] font-mono text-astra-critical">HEALTH FLOOR: 0% (KIA)</span>
                  </div>
                  <p className="text-xs text-astra-muted leading-relaxed mb-2">
                    Each astronaut has independent vitals. Vitals decay when oxygen or water drops below thresholds, or when
                    radiation spikes. Assigning <strong>Crew Rest Posture</strong> significantly accelerates physical recovery and cuts stress.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ENGINEERING & POSTURES */}
          {activeTab === 'operations' && (
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-white">
                How to Command the Outpost Daily
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-astra-raised border border-astra-border space-y-1.5">
                  <div className="font-mono text-astra-accent font-bold">Step 1: Telemetry Check</div>
                  <p className="text-astra-muted">
                    Inspect the 12-tile Master Annunciator Panel and Left-Rail StatTiles on the dashboard. Look for CAUTION or CRITICAL badges.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-astra-raised border border-astra-border space-y-1.5">
                  <div className="font-mono text-astra-accent font-bold">Step 2: Configure Allocations</div>
                  <p className="text-astra-muted">
                    Open Engineering to adjust power sliders with precision stepper buttons. Balance total load against solar and battery capacity.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-astra-raised border border-astra-border space-y-1.5">
                  <div className="font-mono text-astra-accent font-bold">Step 3: Advance Day</div>
                  <p className="text-astra-muted">
                    Click "Advance to Day X" to trigger the simulation cycle. If an Anomaly triggers, resolve the emergency trade-off directive.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-astra-surface border border-astra-border space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-astra-text font-bold">
                  Tactical Operational Postures
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-astra-accent font-bold min-w-[140px]">Storm Shelter Posture:</span>
                    <span className="text-astra-muted">Draws +10 kW to power auxiliary deflector coils. Use during solar storms or high radiation flux.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-astra-accent font-bold min-w-[140px]">Crew Rest Posture:</span>
                    <span className="text-astra-muted">Halts non-essential EVA operations. Astronauts sleep and recuperate, dropping workload stress.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-astra-accent font-bold min-w-[140px]">Greenhouse Standby:</span>
                    <span className="text-astra-muted">Pauses plant lighting (-10 kW demand) and water flow. Growth cycle freezes without dying.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCORING & MODES */}
          {activeTab === 'scoring' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/40 space-y-2">
                  <div className="font-serif font-bold text-white text-base">Explorer Mode</div>
                  <div className="text-[11px] font-mono text-astra-accent">For Students & STEM Learners</div>
                  <ul className="text-xs text-astra-muted space-y-1 list-disc list-inside">
                    <li>Dynamic dashboard hints guide your choices</li>
                    <li>Automatic STEM explanation debrief cards</li>
                    <li>Standard starting resource inventories</li>
                    <li>1.0x Base Score</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                  <div className="font-serif font-bold text-white text-base">Commander Mode</div>
                  <div className="text-[11px] font-mono text-astra-caution">For Advanced Mission Control</div>
                  <ul className="text-xs text-astra-muted space-y-1 list-disc list-inside">
                    <li>Prescriptive hints hidden — pure data analysis</li>
                    <li>25% reduced starting inventory buffers</li>
                    <li>Strict hazard consequence modeling</li>
                    <li><strong>1.25x Final Score Multiplier</strong></li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-astra-muted font-bold mb-3">
                  1000-Point Factor-Based Scoring Model
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between p-2.5 rounded bg-astra-raised border border-astra-border">
                    <span className="text-white">Crew Survival:</span>
                    <span className="text-astra-nominal font-bold">Up to 400 pts (100 pts per living astronaut)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-astra-raised border border-astra-border">
                    <span className="text-white">Mission Duration:</span>
                    <span className="text-astra-accent font-bold">Up to 200 pts (pro-rated per day survived)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-astra-raised border border-astra-border">
                    <span className="text-white">Resource Stewardship:</span>
                    <span className="text-sky-400 font-bold">Up to 150 pts (ending resource buffers)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-astra-raised border border-astra-border">
                    <span className="text-white">Decision Quality:</span>
                    <span className="text-astra-caution font-bold">Up to 150 pts (effective anomaly mitigation)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-astra-raised border border-astra-border">
                    <span className="text-white">Radiation Protection:</span>
                    <span className="text-purple-400 font-bold">Up to 100 pts (minimizing cumulative mSv)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCIENCE FACT INDEX */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-white">
                Verified ECLSS Principles [FACT Index]
              </h3>
              <p className="text-xs text-astra-muted">
                All educational statements in ASTRA are grounded directly in aerospace life-support engineering principles:
              </p>

              <div className="space-y-2.5 text-xs">
                {[
                  { title: 'Electrolysis Requires Water and Electricity', fact: 'Oxygen cannot be generated from nothing. Water electrolysis splits H2O molecules using high-current electrical power.' },
                  { title: 'Imperfect Closed-Loop Water Recovery', fact: 'Zero-loss water recycling does not exist in space. Vacuum distillation leaves behind a concentrated brine that cannot be re-filtered.' },
                  { title: 'Solar Insolation Depends on Lunar Position', fact: 'Solar arrays only generate electricity during daylight phases. Outposts must rely on batteries or regenerative fuel cells during darkness.' },
                  { title: 'Biological Crops Require Time and Constant Feed', fact: 'Hydroponic crops do not yield instant food. They require continuous lighting, water circulation, and 15 days of growth.' },
                  { title: 'Radiation Attenuation Never Reaches 100%', fact: 'Physical shielding reduces ionizing flux but high-energy galactic cosmic rays (GCR) can penetrate any deployable thickness.' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-astra-raised border border-astra-border space-y-1">
                    <div className="font-bold text-white text-xs font-mono text-astra-accent flex items-center gap-1.5">
                      <Sparkles size={12} />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-astra-text font-sans">{item.fact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-astra-border bg-astra-raised/80 flex items-center justify-between">
          <span className="text-xs font-mono text-astra-muted">
            Press <kbd className="px-1.5 py-0.5 rounded bg-astra-surface border border-astra-border text-white text-[10px]">ESC</kbd> to dismiss
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-white text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

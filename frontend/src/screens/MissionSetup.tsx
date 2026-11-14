import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Compass,
  RotateCw,
  AlertCircle,
  HelpCircle,
  BookOpen,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { PillButton } from '../components/ui/PillButton';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Planet } from '../components/Planet';
import type { DifficultyMode } from '../types/mission';
import { sound } from '../utils/soundFx';

interface MissionSetupProps {
  onBack: () => void;
  onMissionLaunched: (missionId: string) => void;
}

export const MissionSetup: React.FC<MissionSetupProps> = ({ onBack, onMissionLaunched }) => {
  const [label, setLabel] = useState('Artemis Base Beta');
  const [mode, setMode] = useState<DifficultyMode>('EXPLORER');
  const [seed, setSeed] = useState(() => `seed_${Math.random().toString(36).substring(2, 8)}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const rollSeed = () => {
    sound.playClick(1500);
    setSeed(`seed_${Math.random().toString(36).substring(2, 8)}`);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick(1800);
    setLoading(true);
    setError(null);

    try {
      const mission = await api.createMission(mode, label, seed);
      onMissionLaunched(mission.id);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize expedition. Please retry.');
      setLoading(false);
    }
  };

  const crewRoster = [
    {
      name: 'Dr. Elena Rostova',
      role: 'Commander',
      specialty: 'Decision Oversight & Outpost Morale',
      avatarBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      initials: 'ER',
    },
    {
      name: 'Marcus Chen',
      role: 'Flight Engineer',
      specialty: 'Power Microgrid & Habitat Structural Integrity',
      avatarBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      initials: 'MC',
    },
    {
      name: 'Sarah Jenkins',
      role: 'Life Support Specialist',
      specialty: 'Oxygen Scrubbing & Water Reclamation Loops',
      avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      initials: 'SJ',
    },
    {
      name: 'Dr. Tariq Al-Mansoor',
      role: 'Science Officer',
      specialty: 'Hydroponic Biology & Radiation Dosimetry',
      avatarBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      initials: 'TA',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-cinematic-text flex flex-col justify-between selection:bg-cinematic-cyan/30 relative overflow-x-hidden font-sans">
      {/* Header */}
      <header className="bg-cinematic-bg-dark/90 backdrop-blur-md border-b border-cinematic-hairline px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cinematic-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Overview</span>
          </button>
          <div className="flex items-baseline">
            <span className="font-sans font-bold text-xl text-white">
              ast<span className="text-cinematic-cyan">ra</span>
            </span>
            <span className="ml-2 text-[10px] tracking-widest uppercase font-mono text-cinematic-muted px-2 py-0.5 rounded border border-cinematic-hairline">
              EXPEDITION SETUP
            </span>
          </div>
        </div>
      </header>

      {/* Main Content: Two-Column Detail Layout */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column (7 cols): Eyebrow, Serif Title, Briefing, Mode Cards, Crew, Begin Action */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="tracking-[0.3em] font-sans text-xs text-cinematic-cyan font-bold uppercase mb-1">
              MISSION BRIEFING
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              SET UP EXPEDITION
            </h1>
            <div className="w-16 h-1 bg-cinematic-cyan rounded-full mt-3 mb-4 shadow-glow-cyan" />
            <p className="text-xs sm:text-sm text-cinematic-text leading-relaxed font-sans opacity-90 max-w-xl">
              You are assuming command over Artemis Base Beta. Manage oxygen, water, power, food, radiation shielding,
              and crew health to ensure all four astronauts survive 90 continuous lunar sols.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLaunch} className="space-y-6">
            {/* Outpost Identity & Deterministic Seed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="outpost-label" className="block text-xs font-mono uppercase tracking-wider text-cinematic-muted mb-1.5">
                  Outpost Designation
                </label>
                <input
                  id="outpost-label"
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-cinematic-glass border border-cinematic-hairline text-white font-mono text-xs focus:outline-none focus:border-cinematic-cyan"
                  placeholder="e.g. Artemis Base Beta"
                />
              </div>

              <div>
                <label htmlFor="scenario-seed" className="block text-xs font-mono uppercase tracking-wider text-cinematic-muted mb-1.5">
                  Deterministic Seed (RNG)
                </label>
                <div className="flex gap-2">
                  <input
                    id="scenario-seed"
                    type="text"
                    required
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-cinematic-glass border border-cinematic-hairline text-white font-mono text-xs focus:outline-none focus:border-cinematic-cyan"
                  />
                  <button
                    type="button"
                    onClick={rollSeed}
                    title="Roll new deterministic seed"
                    className="p-2.5 rounded-xl bg-cinematic-glass border border-cinematic-hairline text-cinematic-muted hover:text-white hover:border-cinematic-cyan transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mode Selection Cards: Explorer vs Commander (Side-by-Side) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-cinematic-muted">
                  Command Difficulty Tier
                </span>
                <span className="text-[11px] font-mono text-amber-400">
                  * Mode is permanently locked once mission starts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Explorer Mode */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(1000);
                    setMode('EXPLORER');
                  }}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                    mode === 'EXPLORER'
                      ? 'bg-blue-950/40 border-cinematic-cyan shadow-[0_0_24px_rgba(111,231,238,0.25)] ring-1 ring-cinematic-cyan'
                      : 'bg-cinematic-glass border-cinematic-hairline hover:border-cinematic-hairline-bright'
                  }`}
                >
                  {mode === 'EXPLORER' && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-cinematic-cyan text-cinematic-bg-dark flex items-center justify-center font-bold text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Compass className="w-5 h-5 text-cinematic-cyan" />
                    <span className="font-serif text-lg font-bold text-white">Explorer Mode</span>
                  </div>
                  <p className="text-xs text-cinematic-muted font-sans leading-relaxed">
                    Designed for beginner STEM students. Guided onboarding coachmarks, automatic bottleneck alerts, and contextual science hints.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/30">
                      Guided Hints
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/30">
                      Standard Scarcity
                    </span>
                  </div>
                </button>

                {/* Commander Mode */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(1200);
                    setMode('COMMANDER');
                  }}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                    mode === 'COMMANDER'
                      ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_24px_rgba(255,184,77,0.25)] ring-1 ring-amber-400'
                      : 'bg-cinematic-glass border-cinematic-hairline hover:border-cinematic-hairline-bright'
                  }`}
                >
                  {mode === 'COMMANDER' && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-400 text-cinematic-bg-dark flex items-center justify-center font-bold text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    <span className="font-serif text-lg font-bold text-white">Commander Mode</span>
                  </div>
                  <p className="text-xs text-cinematic-muted font-sans leading-relaxed">
                    Unforgiving systems-thinking challenge. Zero hand-holding, tighter resource reserves, and high-severity environmental emergencies.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-500/30">
                      No Hints
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-500/30">
                      Severe Events
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Crew Specialists Cards (Four original SVG avatars) */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-cinematic-muted">
                Assigned Specialist Astronauts (4/4 Survival Mandate)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {crewRoster.map((crew) => (
                  <GlassPanel key={crew.name} className="p-3.5 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-mono font-bold text-xs ${crew.avatarBg}`}>
                      {crew.initials}
                    </div>
                    <div>
                      <div className="font-serif text-xs font-bold text-white">{crew.name}</div>
                      <div className="text-[10px] font-mono text-cinematic-cyan">{crew.role}</div>
                      <div className="text-[10px] text-cinematic-muted font-sans truncate max-w-[200px]">
                        {crew.specialty}
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </div>

            {/* Actions: Begin Mission Pill + Circular ? Button */}
            <div className="pt-4 flex items-center gap-4">
              <PillButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Initializing Subsystems...' : 'BEGIN MISSION'}
              </PillButton>

              <PillButton
                type="button"
                variant="icon-circle"
                size="lg"
                onClick={() => {
                  sound.playClick();
                  setShowHowToPlay(true);
                }}
                aria-label="How to play guide"
                title="How to Play Quick Start"
              >
                <HelpCircle className="w-5 h-5" />
              </PillButton>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Photorealistic Earth Detail (Rotating Sphere per Reference 2) */}
        <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center sticky top-24 pt-8">
          <Planet
            type="earth"
            size={440}
            variant="detail-sphere"
            className="drop-shadow-2xl"
            aria-hidden="true"
          />
          <div className="text-center mt-6 space-y-1">
            <span className="font-serif text-lg text-white block">Artemis Base Beta</span>
            <span className="text-xs font-mono text-cinematic-muted uppercase tracking-widest block">
              0.67°N, 23.47°E · Mare Tranquillitatis
            </span>
          </div>
        </div>
      </main>

      {/* How to Play Quick Start Modal */}
      {showHowToPlay && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-to-play-title"
        >
          <div className="bg-cinematic-glass border border-cinematic-hairline backdrop-blur-xl rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowHowToPlay(false);
              }}
              className="absolute top-4 right-4 text-cinematic-muted hover:text-white p-1 rounded-full hover:bg-cinematic-glass transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-cinematic-cyan" />
              <h2 id="how-to-play-title" className="font-serif text-xl font-bold text-white">
                How to Play: 3-Step Quick Start
              </h2>
            </div>

            <div className="space-y-4 text-xs text-cinematic-muted leading-relaxed font-sans">
              <div className="p-3 rounded-xl bg-cinematic-bg-dark/80 border border-cinematic-hairline space-y-1">
                <span className="font-mono text-xs text-cinematic-cyan font-bold block">1. Read Telemetry</span>
                <p>Check the 6 systems on Mission Control. Watch for depleting water, oxygen, or low battery storage before night cycles.</p>
              </div>

              <div className="p-3 rounded-xl bg-cinematic-bg-dark/80 border border-cinematic-hairline space-y-1">
                <span className="font-mono text-xs text-cinematic-cyan font-bold block">2. Balance Power & Resources</span>
                <p>Open the Engineering console to allocate solar kilowatts. Remember: life support and water recycling require continuous power to operate.</p>
              </div>

              <div className="p-3 rounded-xl bg-cinematic-bg-dark/80 border border-cinematic-hairline space-y-1">
                <span className="font-mono text-xs text-cinematic-cyan font-bold block">3. Advance Sol & Mitigate Events</span>
                <p>Advance day by day. If a solar storm or micrometeoroid leak strikes, make your decision immediately to keep all 4 crew members alive.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-cinematic-hairline flex justify-end">
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => {
                  sound.playClick();
                  setShowHowToPlay(false);
                }}
              >
                Got It, Commander
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

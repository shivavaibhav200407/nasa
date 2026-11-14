import React, { useEffect, useState } from 'react';
import {
  Rocket,
  Play,
  RefreshCw,
  Wind,
  Droplets,
  Zap,
  Apple,
  ShieldAlert,
  HeartPulse,
  ChevronDown,
  BookOpen,
  Volume2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { api } from '../api/client';
import { PillButton } from '../components/ui/PillButton';
import { GlassPanel } from '../components/ui/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, ErrorStateWithRetry, SkeletonLoader } from '../components/ui';
import { Planet } from '../components/Planet';
import { FlightManualModal } from '../components/FlightManualModal';
import type { MissionSummary } from '../types/mission';
import { sound } from '../utils/soundFx';

interface LandingPageProps {
  onNewMission: () => void;
  onResumeMission: (missionId: string) => void;
  onViewReport: (missionId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNewMission,
  onResumeMission,
  onViewReport,
}) => {
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [ambientAudioPlaying, setAmbientAudioPlaying] = useState(false);

  const fetchMissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMissions();
      setMissions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Mission Control backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api
      .listMissions()
      .then((data) => {
        if (!ignore) {
          setMissions(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to connect to Mission Control backend.');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const activeMission = missions.find((m) => m.status === 'IN_PROGRESS');

  const scrollToSection = (id: string) => {
    sound.playClick(1100);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleAmbientSound = () => {
    sound.playClick(1300);
    setAmbientAudioPlaying(!ambientAudioPlaying);
  };

  return (
    <div className="min-h-screen bg-transparent text-cinematic-text flex flex-col justify-between selection:bg-cinematic-cyan/30 relative overflow-x-hidden font-sans">
      {/* Flight Manual Modal */}
      <FlightManualModal isOpen={showManual} onClose={() => setShowManual(false)} />

      {/* Top Header */}
      <header className="bg-cinematic-bg-dark/90 backdrop-blur-md sticky top-0 z-40 border-b border-cinematic-hairline px-6 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Left: Two-tone wordmark */}
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold text-2xl tracking-tight text-white">
              ast<span className="text-cinematic-cyan">ra</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-mono text-cinematic-muted px-2 py-0.5 rounded border border-cinematic-hairline hidden sm:inline">
              2026 SPACE APPS
            </span>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-cinematic-muted">
            <button
              onClick={() => scrollToSection('daily-cycle-strip')}
              className="hover:text-white transition-colors"
            >
              Daily Cycle
            </button>
            <button
              onClick={() => scrollToSection('systems-section')}
              className="hover:text-white transition-colors"
            >
              The 6 Systems
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setShowManual(true);
              }}
              className="hover:text-cinematic-cyan text-white transition-colors flex items-center gap-1.5"
            >
              <BookOpen size={14} className="text-cinematic-cyan" />
              <span>Flight Manual</span>
            </button>
            <button
              onClick={() => scrollToSection('history-section')}
              className="hover:text-white transition-colors"
            >
              Mission Log
            </button>
          </nav>

          {/* Right Pale Pill CTA */}
          <div className="flex items-center gap-3">
            {activeMission ? (
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => {
                  sound.playClick();
                  onResumeMission(activeMission.id);
                }}
              >
                Resume Mission (Sol {activeMission.current_day})
              </PillButton>
            ) : (
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => {
                  sound.playClick();
                  onNewMission();
                }}
              >
                Start Mission
              </PillButton>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full space-y-24">
        {/* ========================================================================= */}
        {/* SCR-01: OVERVIEW STATE HERO SECTION                                       */}
        {/* ========================================================================= */}
        <section className="relative min-h-[calc(100vh-64px)] flex flex-col justify-between items-center text-center px-4 pt-10 pb-4 overflow-hidden">
          {/* Subtle central radial atmosphere glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cinematic-cyan/5 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Typography & CTA */}
          <div className="relative z-20 max-w-3xl mx-auto space-y-4 pt-4">
            {/* Eyebrow */}
            <div className="tracking-[0.3em] font-sans text-xs text-cinematic-muted font-bold uppercase">
              LUNAR OUTPOST
            </div>

            {/* Classical Serif Title */}
            <h1 className="font-serif text-6xl sm:text-8xl font-bold tracking-tight text-white uppercase drop-shadow-2xl">
              ASTRA
            </h1>

            {/* Cyan Accent Line */}
            <div className="w-16 h-1 bg-cinematic-cyan mx-auto rounded-full shadow-glow-cyan" />

            {/* Two-Line Centered Body Paragraph */}
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-cinematic-text leading-relaxed font-sans opacity-95">
              Keep four astronauts alive across a 90-sol mission by commanding six tightly coupled life-support and engineering systems in closed-loop lunar orbit.
            </p>

            {/* Primary Action Button */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
              <PillButton
                variant="primary"
                size="lg"
                onClick={() => {
                  sound.playClick();
                  if (activeMission) {
                    onResumeMission(activeMission.id);
                  } else {
                    onNewMission();
                  }
                }}
              >
                {activeMission ? 'RESUME MISSION' : 'START MISSION'}
              </PillButton>

              <PillButton
                variant="secondary"
                size="lg"
                onClick={() => {
                  sound.playClick();
                  setShowManual(true);
                }}
              >
                Read Flight Manual
              </PillButton>
            </div>
          </div>

          {/* Flanking Decorative Edge Previews (Venus on left, Mars on right per reference) */}
          <div className="absolute inset-x-0 top-[52%] -translate-y-1/2 flex items-center justify-between px-0 z-20 pointer-events-none select-none">
            {/* Left Edge: Venus */}
            <div aria-hidden="true" className="flex items-center">
              <Planet
                type="venus"
                size={85}
                variant="edge-preview"
                label="VENUS"
                aria-hidden="true"
              />
            </div>

            {/* Right Edge: Mars */}
            <div aria-hidden="true" className="flex items-center">
              <Planet
                type="mars"
                size={85}
                variant="edge-preview"
                label="MARS"
                align="right"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Giant Earth Arc Rising From Bottom Edge */}
          <div className="relative -mb-16 sm:-mb-24 z-10 w-full flex flex-col items-center justify-center pointer-events-none">
            <Planet
              type="earth"
              variant="overview-arc"
              className=""
              aria-hidden="true"
            />
          </div>

          {/* Half-circle scroll down button with down-arrow ↓ */}
          <button
            onClick={() => scrollToSection('daily-cycle-strip')}
            aria-label="Scroll to mission briefing and daily cycle"
            className="pointer-events-auto absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 w-11 h-11 rounded-full bg-cinematic-glass border border-cinematic-hairline backdrop-blur-md flex items-center justify-center text-white hover:text-cinematic-cyan hover:border-cinematic-cyan shadow-glow-pill transition-all transform hover:scale-110 active:scale-95 animate-bounce"
          >
            <ChevronDown size={20} />
          </button>
        </section>

        {/* ========================================================================= */}
        {/* COMPACT STRIP: 5-STEP DAILY GAMEPLAY CYCLE (Section 6)                    */}
        {/* ========================================================================= */}
        <section id="daily-cycle-strip" className="max-w-6xl mx-auto px-6 py-4">
          <GlassPanel className="p-6 md:p-8">
            <div className="text-center max-w-xl mx-auto mb-6">
              <div className="text-xs font-mono uppercase tracking-widest text-cinematic-cyan font-semibold">
                Turn-Based Daily Loop
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase mt-1">
                The 5-Step Operational Cycle
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              {[
                { step: '01', title: 'Check Telemetry', desc: 'Read reserves, rates, and bottleneck alerts.' },
                { step: '02', title: 'Power Bus', desc: 'Allocate solar kW without overloading batteries.' },
                { step: '03', title: 'Life Support', desc: 'Configure water routing, O2 scrubbers, crops.' },
                { step: '04', title: 'Emergencies', desc: 'Resolve random solar storms or system leaks.' },
                { step: '05', title: 'Advance Sol', desc: 'Simulate next 24 hours of closed-loop physics.' },
              ].map((s) => (
                <div
                  key={s.step}
                  className="p-4 rounded-xl bg-cinematic-bg-dark/80 border border-cinematic-hairline flex flex-col justify-between"
                >
                  <div className="font-mono text-sm font-bold text-cinematic-cyan mb-1">{s.step}</div>
                  <div className="font-serif text-sm font-bold text-white mb-1">{s.title}</div>
                  <div className="text-[11px] text-cinematic-muted leading-tight font-sans">{s.desc}</div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: SHOWCASE BRIEFING (Artemis Base Beta)                          */}
        {/* ========================================================================= */}
        <section
          id="showcase-section"
          className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Text Column */}
          <div className="space-y-6">
            <div>
              <div className="text-xs font-mono tracking-[0.25em] text-cinematic-cyan uppercase font-semibold mb-1">
                THE LUNAR OUTPOST // ECLSS
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white uppercase tracking-tight">
                ARTEMIS BASE BETA
              </h2>
              <div className="w-16 h-1 bg-cinematic-cyan rounded-full mt-3 shadow-glow-cyan" />
            </div>

            <p className="text-sm text-cinematic-text leading-relaxed font-sans">
              Located at lunar coordinates 0.67°N, 23.47°E in *Mare Tranquillitatis*. Powered by high-efficiency
              PV solar arrays and a 120 kWh battery microgrid, recycling 90% of moisture through closed-loop catalytic
              oxidation, and sustaining four human astronauts across 90 days without resupply.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <PillButton
                variant="primary"
                size="md"
                onClick={() => {
                  sound.playClick();
                  setShowManual(true);
                }}
              >
                Learn More (Manual)
              </PillButton>

              <PillButton
                variant="icon-circle"
                size="md"
                onClick={toggleAmbientSound}
                aria-label="Play procedural ambient transmission"
              >
                {ambientAudioPlaying ? (
                  <Volume2 size={18} className="text-cinematic-cyan animate-pulse" />
                ) : (
                  <Play size={18} className="fill-current ml-0.5" />
                )}
              </PillButton>
            </div>
          </div>

          {/* Right Celestial Sphere Showcase */}
          <div className="flex items-center justify-center">
            <Planet
              type="earth"
              size={380}
              variant="detail-sphere"
              className="drop-shadow-2xl"
              aria-hidden="true"
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: THE 6 COUPLED SUBSYSTEMS                                       */}
        {/* ========================================================================= */}
        <section id="systems-section" className="max-w-6xl mx-auto px-6 py-4 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-cinematic-cyan font-semibold">
              Coupled Life Support
            </div>
            <h3 className="font-serif text-3xl font-bold text-white uppercase">
              Six Critical Outpost Loops
            </h3>
            <p className="text-xs text-cinematic-muted max-w-lg mx-auto font-sans">
              In a closed loop, no resource operates in isolation. Balancing water, energy, and atmosphere is the primary challenge.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {[
              {
                name: 'Oxygen',
                code: 'SYS.O2',
                desc: 'Atmospheric scrubbers & water electrolysis',
                icon: <Wind className="w-5 h-5 text-cinematic-cyan" />,
                border: 'border-cinematic-cyan/40',
              },
              {
                name: 'Water',
                code: 'SYS.H2O',
                desc: 'Imperfect recovery with 10% brine loss',
                icon: <Droplets className="w-5 h-5 text-sky-400" />,
                border: 'border-sky-400/40',
              },
              {
                name: 'Energy',
                code: 'SYS.PWR',
                desc: 'Solar generation & 120 kWh battery storage',
                icon: <Zap className="w-5 h-5 text-cinematic-caution" />,
                border: 'border-cinematic-caution/40',
              },
              {
                name: 'Food',
                code: 'SYS.BIO',
                desc: '15-day hydroponic greenhouse crop harvest',
                icon: <Apple className="w-5 h-5 text-cinematic-nominal" />,
                border: 'border-cinematic-nominal/40',
              },
              {
                name: 'Radiation',
                code: 'SYS.RAD',
                desc: 'Regolith shielding & storm shelter protocol',
                icon: <ShieldAlert className="w-5 h-5 text-purple-400" />,
                border: 'border-purple-400/40',
              },
              {
                name: 'Crew Vitals',
                code: 'SYS.VIT',
                desc: '4 individual vitals; 1 loss = mission failure',
                icon: <HeartPulse className="w-5 h-5 text-cinematic-critical" />,
                border: 'border-cinematic-critical/40',
              },
            ].map((s) => (
              <GlassPanel
                key={s.name}
                variant="interactive"
                className={`p-4 text-center flex flex-col justify-between ${s.border}`}
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-cinematic-bg-dark border border-cinematic-hairline flex items-center justify-center mx-auto mb-2.5">
                    {s.icon}
                  </div>
                  <div className="font-serif text-xs font-bold text-white">{s.name}</div>
                  <div className="text-[10px] font-mono text-cinematic-cyan mb-1">{s.code}</div>
                </div>
                <div className="text-[11px] text-cinematic-muted leading-snug font-sans">{s.desc}</div>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: MISSION HISTORY VIEW (Saved Missions as Glass Cards)           */}
        {/* ========================================================================= */}
        <section id="history-section" className="max-w-6xl mx-auto px-6 py-4">
          <GlassPanel className="p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-cinematic-hairline">
              <div>
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-cinematic-cyan" />
                  <span>Commander Mission Log & Classroom History</span>
                </h3>
                <p className="text-xs text-cinematic-muted font-sans mt-0.5">
                  Saved locally via anonymous session tokens — your mission records are isolated in SQLite
                </p>
              </div>
              <button
                onClick={fetchMissions}
                disabled={loading}
                className="px-3 py-1.5 rounded-full hover:bg-cinematic-glass text-cinematic-muted hover:text-white text-xs font-mono flex items-center gap-1.5 border border-cinematic-hairline transition-colors"
                title="Refresh mission list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-6 space-y-3">
                <SkeletonLoader height={56} />
                <SkeletonLoader height={56} />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <ErrorStateWithRetry message={error} onRetry={fetchMissions} />
            )}

            {/* Empty */}
            {!loading && !error && missions.length === 0 && (
              <EmptyState
                icon={Rocket}
                title="No missions logged in this browser session"
                description="Initialize an expedition to test your closed-loop life support stewardship!"
                actionLabel="Launch First Expedition"
                onAction={onNewMission}
              />
            )}

            {/* Saved Missions Cards */}
            {!loading && !error && missions.length > 0 && (
              <div className="space-y-3">
                {missions.map((m) => {
                  const dayPct = Math.min((m.current_day / 90) * 100, 100);
                  return (
                    <GlassPanel
                      key={m.id}
                      variant="interactive"
                      className="p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cinematic-bg-dark border border-cinematic-hairline flex flex-col items-center justify-center text-white font-mono">
                          <span className="text-sm font-bold leading-none">{m.current_day}</span>
                          <span className="text-[9px] text-cinematic-muted uppercase">SOL</span>
                        </div>
                        <div>
                          <div className="font-serif text-sm font-bold text-white flex items-center gap-2">
                            <span>{m.label}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold ${
                                m.difficulty_mode === 'EXPLORER'
                                  ? 'bg-blue-950/60 text-blue-300 border-blue-600/40'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                              }`}
                            >
                              {m.difficulty_mode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-cinematic-muted font-mono mt-1">
                            <span>Day {m.current_day} of 90</span>
                            <span>•</span>
                            <div className="w-24 bg-cinematic-bg-dark rounded-full h-1.5 overflow-hidden border border-cinematic-hairline">
                              <div
                                className="h-full bg-gradient-to-r from-cinematic-cyan to-cinematic-nominal rounded-full"
                                style={{ width: `${dayPct}%` }}
                              />
                            </div>
                            <span>•</span>
                            <span>Updated {new Date(m.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={m.status} size="sm" />

                        {m.status === 'IN_PROGRESS' ? (
                          <PillButton
                            variant="primary"
                            size="sm"
                            onClick={() => onResumeMission(m.id)}
                          >
                            Resume Run
                          </PillButton>
                        ) : (
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onViewReport(m.id)}
                          >
                            Review Report
                          </PillButton>
                        )}
                      </div>
                    </GlassPanel>
                  );
                })}
              </div>
            )}
          </GlassPanel>
        </section>

        {/* ========================================================================= */}
        {/* NON-ENDORSEMENT NOTICE                                                    */}
        {/* ========================================================================= */}
        <section className="max-w-6xl mx-auto px-6 py-2">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>NASA NON-ENDORSEMENT NOTICE:</strong> ASTRA is an independent educational simulator developed for the 2026 NASA Space Apps Challenge. It is not affiliated with, endorsed by, or certified by NASA. Gameplay balance values are simplified educational placeholders, not flight-certified NASA aerospace data.
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-cinematic-bg-dark border-t border-cinematic-hairline px-6 py-6 text-xs font-mono text-cinematic-muted mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>ASTRA – Junior Astronaut Mission Trainer • 2026 NASA Space Apps Challenge</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                setShowManual(true);
              }}
              className="text-white hover:text-cinematic-cyan transition-colors font-semibold"
            >
              Flight Manual
            </button>
            <span>•</span>
            <a href="#styleguide" className="text-cinematic-cyan hover:underline">
              Component Styleguide
            </a>
            <span>•</span>
            <span>Independent educational project • Not certified by NASA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

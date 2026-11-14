import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  X,
  Compass,
  Activity,
  AlertTriangle,
  Volume2,
  VolumeX,
  Menu,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { FlightManualModal } from './FlightManualModal';
import { PillButton } from './ui/PillButton';
import type { DifficultyMode, MissionStatus } from '../types/mission';
import { sound } from '../utils/soundFx';
import { getInitialReduceEffects, setReduceEffects } from '../utils/effectsSettings';

interface LayoutHeaderProps {
  currentScreen: 'dashboard' | 'engineering' | 'events' | 'report';
  onNavigate: (screen: 'dashboard' | 'engineering' | 'events') => void;
  missionId?: string;
  missionLabel?: string;
  dayNumber?: number;
  difficultyMode?: DifficultyMode;
  missionStatus?: MissionStatus;
  pendingEventCount?: number;
  onExit?: () => void;
}

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  currentScreen,
  onNavigate,
  missionLabel,
  dayNumber,
  difficultyMode,
  missionStatus,
  pendingEventCount = 0,
  onExit,
}) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFlightManual, setShowFlightManual] = useState(false);
  const [reducedEffects, setReducedEffectsState] = useState(() => getInitialReduceEffects());
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const toggleReducedEffects = () => {
    sound.playClick();
    const next = !reducedEffects;
    setReducedEffectsState(next);
    setReduceEffects(next);
  };

  const handleNavClick = (screen: 'dashboard' | 'engineering' | 'events') => {
    sound.playClick(1100);
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  const dayPercent = dayNumber ? Math.min((dayNumber / 90) * 100, 100) : 0;

  return (
    <>
      <header className="bg-cinematic-bg-dark/90 backdrop-blur-md sticky top-0 z-40 border-b border-cinematic-hairline transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Two-tone wordmark and outpost identity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                onExit?.();
              }}
              className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cinematic-cyan rounded-lg p-1 text-left"
              title="Return to Main Menu"
            >
              <div>
                <div className="flex items-baseline">
                  <span className="font-sans font-bold text-2xl tracking-tight text-white group-hover:text-white/90">
                    ast<span className="text-cinematic-cyan">ra</span>
                  </span>
                  <span className="ml-2 text-[10px] tracking-widest uppercase font-mono text-cinematic-muted px-1.5 py-0.5 rounded border border-cinematic-hairline hidden sm:inline">
                    EXPEDITION
                  </span>
                </div>
                {missionLabel && (
                  <div className="text-[10px] font-mono text-cinematic-muted truncate max-w-[140px] sm:max-w-xs">
                    {missionLabel}
                  </div>
                )}
              </div>
            </button>

            {/* In-Mission Telemetry Chips */}
            {dayNumber !== undefined && (
              <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-cinematic-hairline">
                <div className="bg-cinematic-glass px-3 py-1 rounded-full border border-cinematic-hairline font-mono text-xs flex items-center gap-2">
                  <span className="text-cinematic-muted text-[10px] uppercase tracking-wider">SOL</span>
                  <span className="text-cinematic-cyan font-bold">{dayNumber}</span>
                  <span className="text-cinematic-muted text-[10px]">/ 90</span>
                  <div className="w-12 bg-cinematic-bg-dark rounded-full h-1 overflow-hidden border border-cinematic-hairline">
                    <div
                      className="h-full bg-cinematic-cyan rounded-full transition-all duration-300"
                      style={{ width: `${dayPercent}%` }}
                    />
                  </div>
                </div>

                {difficultyMode && (
                  <span
                    className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      difficultyMode === 'EXPLORER'
                        ? 'bg-blue-950/60 text-blue-300 border-blue-600/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                    }`}
                  >
                    <Compass className="w-3 h-3" />
                    <span>{difficultyMode === 'EXPLORER' ? 'Explorer' : 'Commander'}</span>
                  </span>
                )}

                {missionStatus && <StatusBadge status={missionStatus} size="sm" />}
              </div>
            )}
          </div>

          {/* Center/Right Nav Links with short cyan bar sitting right on the hairline */}
          {dayNumber !== undefined && missionStatus === 'IN_PROGRESS' && (
            <nav className="hidden md:flex items-center gap-8 h-16 relative">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`relative h-16 flex items-center font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
                  currentScreen === 'dashboard'
                    ? 'text-white'
                    : 'text-cinematic-muted hover:text-white'
                }`}
              >
                <span>Dashboard</span>
                {currentScreen === 'dashboard' && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-cinematic-cyan shadow-[0_0_8px_#6FE7EE]" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('engineering')}
                className={`relative h-16 flex items-center font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
                  currentScreen === 'engineering'
                    ? 'text-white'
                    : 'text-cinematic-muted hover:text-white'
                }`}
              >
                <span>Engineering</span>
                {currentScreen === 'engineering' && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-cinematic-cyan shadow-[0_0_8px_#6FE7EE]" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('events')}
                className={`relative h-16 flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
                  currentScreen === 'events'
                    ? 'text-white'
                    : 'text-cinematic-muted hover:text-white'
                }`}
              >
                <span>Decisions</span>
                {pendingEventCount > 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
                {currentScreen === 'events' && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-cinematic-cyan shadow-[0_0_8px_#6FE7EE]" />
                )}
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full border transition-all ${
                isMuted
                  ? 'bg-cinematic-glass border-cinematic-hairline text-cinematic-dim hover:text-cinematic-muted'
                  : 'bg-cinematic-glass border-cinematic-cyan/40 text-cinematic-cyan shadow-[0_0_12px_rgba(111,231,238,0.2)]'
              }`}
              title={isMuted ? 'Unmute audio transmission' : 'Mute audio'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Reduce Effects Toggle */}
            <button
              onClick={toggleReducedEffects}
              className={`p-2 rounded-full border transition-all ${
                reducedEffects
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                  : 'bg-cinematic-glass border-cinematic-hairline text-cinematic-muted hover:text-white'
              }`}
              title={reducedEffects ? 'Enable cinematic effects & star drift' : 'Reduce effects & star drift'}
              aria-label={reducedEffects ? 'Enable cinematic effects' : 'Reduce effects'}
            >
              {reducedEffects ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Flight Manual Pill Button */}
            <PillButton
              variant="primary"
              size="sm"
              onClick={() => {
                sound.playClick();
                setShowFlightManual(true);
              }}
              className="hidden sm:inline-flex"
            >
              Flight Manual
            </PillButton>

            {/* Info / Science Modal */}
            <button
              onClick={() => {
                sound.playClick();
                setShowAboutModal(true);
              }}
              className="p-2 rounded-full bg-cinematic-glass border border-cinematic-hairline text-cinematic-muted hover:text-white transition-colors"
              title="Science & Disclaimers"
              aria-label="Mission science and disclaimers"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            {dayNumber !== undefined && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-cinematic-glass border border-cinematic-hairline text-cinematic-muted hover:text-white"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && dayNumber !== undefined && (
          <div className="md:hidden border-t border-cinematic-hairline bg-cinematic-bg-dark/95 backdrop-blur-xl px-4 py-3 space-y-2">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-between ${
                currentScreen === 'dashboard'
                  ? 'bg-cinematic-cyan/15 text-cinematic-cyan border border-cinematic-cyan/40'
                  : 'text-cinematic-muted hover:text-white'
              }`}
            >
              <span>Mission Control</span>
              <Activity className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleNavClick('engineering')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-between ${
                currentScreen === 'engineering'
                  ? 'bg-cinematic-cyan/15 text-cinematic-cyan border border-cinematic-cyan/40'
                  : 'text-cinematic-muted hover:text-white'
              }`}
            >
              <span>Engineering Console</span>
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleNavClick('events')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-between ${
                currentScreen === 'events'
                  ? 'bg-cinematic-cyan/15 text-cinematic-cyan border border-cinematic-cyan/40'
                  : 'text-cinematic-muted hover:text-white'
              }`}
            >
              <span>Decisions & Emergencies</span>
              <Sparkles className="w-4 h-4" />
            </button>

            <div className="pt-2">
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowFlightManual(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Flight Manual
              </PillButton>
            </div>
          </div>
        )}
      </header>

      {/* Interactive Astronaut Flight Manual Modal */}
      <FlightManualModal
        isOpen={showFlightManual}
        onClose={() => setShowFlightManual(false)}
      />

      {/* About & Scientific Notice Modal */}
      {showAboutModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-cinematic-glass border border-cinematic-hairline backdrop-blur-xl rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowAboutModal(false);
              }}
              className="absolute top-4 right-4 text-cinematic-muted hover:text-white p-1 rounded-full hover:bg-cinematic-glass transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans font-bold text-xl text-white">
                ast<span className="text-cinematic-cyan">ra</span>
              </span>
              <div>
                <h2 id="modal-title" className="text-sm font-semibold font-sans text-cinematic-text uppercase tracking-wider">
                  Educational Simulation & Scientific Integrity Notice
                </h2>
                <div className="text-[11px] text-cinematic-muted font-mono">
                  2026 NASA Space Apps Challenge Submission
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-cinematic-muted leading-relaxed font-sans">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-amber-200 font-mono flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>NASA NON-ENDORSEMENT NOTICE:</strong> ASTRA is an independent educational simulator developed for the 2026 NASA Space Apps Challenge. It is not affiliated with, endorsed by, or certified by NASA. Gameplay balance values are simplified educational placeholders, not flight-certified NASA aerospace data.
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white font-sans text-xs uppercase tracking-wider text-cinematic-cyan mb-1">
                  Closed-Loop Lunar Architecture
                </h3>
                <p>
                  As Mission Commander, you oversee four astronauts for 90 days across six coupled systems: Oxygen, Water, Energy, Food, Radiation Safety, and Crew Health.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white font-sans text-xs uppercase tracking-wider text-cinematic-cyan mb-1">
                  Mandatory Physical Realism Principles
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-[11px] font-mono text-cinematic-text">
                  <li><strong>Non-Regenerative Physics:</strong> Oxygen electrolysis consumes water and power; no resource spontaneously generates.</li>
                  <li><strong>Imperfect Water Recovery:</strong> Wastewater recycling incurs an irreversible loss fraction (10%) on every cycle.</li>
                  <li><strong>Partial Radiation Shielding:</strong> Storm shelter protection attenuates solar particles by 80%, but cosmic radiation exposure is never 0%.</li>
                  <li><strong>Biological Time Lag:</strong> Hydroponic crops require 15 days of continuous lighting and water before yielding edible food.</li>
                  <li><strong>Strict Crew Survival:</strong> Mission succeeds only if all 4 astronauts remain alive on Day 90.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-cinematic-hairline flex justify-end">
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => {
                  sound.playClick();
                  setShowAboutModal(false);
                }}
              >
                Understood & Return to Outpost
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

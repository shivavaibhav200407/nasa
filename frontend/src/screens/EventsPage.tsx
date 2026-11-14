import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Zap,
  Droplets,
  Activity,
  Sparkles,
  Check,
} from 'lucide-react';
import { api } from '../api/client';
import { LayoutHeader } from '../components/LayoutHeader';
import { PillButton } from '../components/ui/PillButton';
import { GlassPanel } from '../components/ui/GlassPanel';
import { StatusBadge } from '../components/ui';
import type { MissionDetail, MissionEvent } from '../types/mission';
import { sound } from '../utils/soundFx';

interface EventsPageProps {
  mission: MissionDetail;
  onNavigate: (screen: 'dashboard' | 'engineering' | 'events') => void;
  onMissionUpdated: (updatedMission: MissionDetail) => void;
  onExit: () => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  mission,
  onNavigate,
  onMissionUpdated,
  onExit,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedOutcome, setResolvedOutcome] = useState<string | null>(null);

  const activeEvent = mission.active_event;
  const isPendingEmergency =
    activeEvent &&
    activeEvent.requires_decision &&
    activeEvent.resolution_status === 'PENDING';

  const isExplorer = mission.difficulty_mode === 'EXPLORER';

  useEffect(() => {
    if (isPendingEmergency) {
      sound.playAlarm();
    }
  }, [isPendingEmergency]);

  const handleConfirmDecision = async () => {
    if (!activeEvent || !selectedOptionId) return;

    sound.playClick(1400);
    setResolving(true);
    setError(null);

    try {
      const res = await api.resolveEvent(mission.id, activeEvent.event_id, selectedOptionId);
      sound.playSuccess();
      setResolvedOutcome(res.outcome_summary);

      const updatedEvent: MissionEvent = {
        ...activeEvent,
        resolution_status: 'RESOLVED',
        chosen_option_id: selectedOptionId,
        outcome_summary: res.outcome_summary,
      };

      const updatedMission: MissionDetail = {
        ...mission,
        active_event: updatedEvent,
        educational_feedback: [...res.educational_feedback, ...mission.educational_feedback],
      };

      onMissionUpdated(updatedMission);
    } catch (err: any) {
      setError(err.message || 'Failed to submit emergency mitigation decision.');
    } finally {
      setResolving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'CRITICAL' || severity === 'HIGH' || severity === 'SEVERE') {
      return {
        icon: <AlertOctagon className="w-5 h-5 text-cinematic-critical" />,
        border: 'border-cinematic-critical/60 shadow-[0_0_25px_rgba(255,92,108,0.3)]',
        label: 'CRITICAL EMERGENCY',
      };
    }
    if (severity === 'MEDIUM' || severity === 'MODERATE' || severity === 'CAUTION') {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-cinematic-caution" />,
        border: 'border-cinematic-caution/60 shadow-[0_0_20px_rgba(255,184,77,0.25)]',
        label: 'CAUTION ANOMALY',
      };
    }
    return {
      icon: <Info className="w-5 h-5 text-cinematic-cyan" />,
      border: 'border-cinematic-cyan/50 shadow-glow-cyan',
      label: 'ADVISORY EVENT',
    };
  };

  return (
    <div className="min-h-screen bg-cinematic-bg-dark text-cinematic-text flex flex-col selection:bg-cinematic-cyan/30 relative overflow-x-hidden font-sans">
      <LayoutHeader
        currentScreen="events"
        onNavigate={onNavigate}
        missionId={mission.id}
        missionLabel={mission.label}
        dayNumber={mission.current_day}
        difficultyMode={mission.difficulty_mode}
        missionStatus={mission.status}
        pendingEventCount={isPendingEmergency ? 1 : 0}
        onExit={onExit}
      />

      {/* Screen Reader ARIA Announcement */}
      <div aria-live="assertive" className="sr-only">
        {isPendingEmergency
          ? `Emergency Hazard Active: ${activeEvent?.title}. Category: ${activeEvent?.category}. Requires immediate commander decision.`
          : 'All outpost systems nominal. No unresolved emergencies.'}
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-cinematic-hairline">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cinematic-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Mission Control</span>
          </button>
          <span className="text-xs font-mono text-cinematic-cyan uppercase tracking-wider">
            SCR-05 EMERGENCY DECISION CONSOLE
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Emergency Card */}
        {isPendingEmergency ? (
          <GlassPanel
            variant="heavy"
            className={`p-6 sm:p-8 space-y-6 relative overflow-hidden ${
              getSeverityBadge(activeEvent.severity).border
            }`}
          >
            {/* Top Bar: Eyebrow label, Icon, Border */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cinematic-hairline pb-4">
              <div className="flex items-center gap-3">
                {getSeverityBadge(activeEvent.severity).icon}
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-white uppercase block">
                    {getSeverityBadge(activeEvent.severity).label}
                  </span>
                  <span className="text-[10px] font-mono text-cinematic-muted">
                    CATEGORY: {activeEvent.category} · SOL {activeEvent.day_number}
                  </span>
                </div>
              </div>
              <StatusBadge status="CRITICAL" label="DECISION REQUIRED" size="sm" />
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                {activeEvent.title}
              </h1>
              <p className="text-xs sm:text-sm text-cinematic-text leading-relaxed font-sans opacity-95">
                {activeEvent.description}
              </p>
            </div>

            {/* Compromised Subsystems */}
            {((activeEvent as any).affected_systems || (activeEvent as any).affected_subsystems) && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-cinematic-muted">Compromised Subsystems:</span>
                {((activeEvent as any).affected_systems || (activeEvent as any).affected_subsystems).map((sub: string) => (
                  <span
                    key={sub}
                    className="px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40 font-semibold uppercase text-[10px]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}

            {/* Structured Response Options (Large Cards) */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cinematic-muted block">
                Commander Mitigation Directives:
              </span>

              <div className="space-y-3">
                {activeEvent.options.map((opt: any) => {
                  const isSelected = selectedOptionId === opt.option_id;
                  const hasHint = isExplorer && (opt.educational_hint || opt.hint_text);
                  return (
                    <div
                      key={opt.option_id}
                      onClick={() => {
                        sound.playClick(1100);
                        setSelectedOptionId(opt.option_id);
                      }}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedOptionId(opt.option_id);
                        }
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'bg-blue-950/40 border-cinematic-cyan shadow-[0_0_24px_rgba(111,231,238,0.25)] ring-1 ring-cinematic-cyan'
                          : 'bg-cinematic-glass border-cinematic-hairline hover:border-cinematic-hairline-bright'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-cinematic-cyan border-cinematic-cyan text-cinematic-bg-dark'
                                : 'border-cinematic-hairline bg-cinematic-bg-dark'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="font-serif text-base font-bold text-white">
                              {opt.title}
                            </div>
                            <div className="text-xs text-cinematic-muted font-sans mt-1 leading-relaxed">
                              {opt.description}
                            </div>
                            {/* Explorer Mode Hint (Commander Mode shows none per PRD Section 6) */}
                            {hasHint && (
                              <div className="mt-2.5 p-2.5 rounded-xl bg-cinematic-cyan/10 border border-cinematic-cyan/30 text-[11px] font-mono text-cinematic-cyan flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 shrink-0 text-cinematic-cyan" />
                                <span>
                                  <strong>EXPLORER HINT:</strong> {opt.educational_hint || opt.hint_text}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Trade-off Badges */}
                        <div className="flex flex-col items-end gap-1 font-mono text-[10px] shrink-0">
                          {(opt.energy_cost > 0 || opt.resource_cost?.power > 0) && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950/50 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>-{opt.energy_cost || opt.resource_cost?.power} kW battery</span>
                            </span>
                          )}
                          {(opt.water_cost > 0 || opt.resource_cost?.water > 0) && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-950/50 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                              <Droplets className="w-3 h-3" />
                              <span>-{opt.water_cost || opt.resource_cost?.water} L water</span>
                            </span>
                          )}
                          {(opt.stress_impact > 0 || opt.stress_cost > 0) && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950/50 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>+{opt.stress_impact || opt.stress_cost}% stress</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-cinematic-hairline flex justify-end">
              <PillButton
                variant="primary"
                size="lg"
                disabled={!selectedOptionId || resolving}
                onClick={handleConfirmDecision}
              >
                {resolving ? 'Executing Protocol...' : 'AUTHORIZE DIRECTIVE'}
              </PillButton>
            </div>
          </GlassPanel>
        ) : (
          /* Nominal State or Just Resolved */
          <GlassPanel className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center mx-auto text-cinematic-nominal">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">
              {resolvedOutcome ? 'Directive Successfully Executed' : 'All Outpost Systems Nominal'}
            </h2>
            <p className="text-xs text-cinematic-muted max-w-md mx-auto font-sans leading-relaxed">
              {resolvedOutcome ||
                'No unmitigated environmental events or equipment anomalies currently threaten outpost life support.'}
            </p>
            <div className="pt-2">
              <PillButton
                variant="primary"
                size="md"
                onClick={() => onNavigate('dashboard')}
              >
                Return to Mission Control
              </PillButton>
            </div>
          </GlassPanel>
        )}
      </main>
    </div>
  );
};

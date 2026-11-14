import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertOctagon,
  Compass,
  RotateCcw,
  BookOpen,
  Calendar,
  Home,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { CrewStatusPanel } from '../components/CrewStatusPanel';
import { ResourceTrendsChart } from '../components/ResourceTrendsChart';
import { StatusBadge, Button, SkeletonLoader, ErrorStateWithRetry } from '../components/ui';
import type { MissionReport } from '../types/mission';
import { sound } from '../utils/soundFx';

interface MissionReportProps {
  missionId: string;
  onPlayAgain: (mode?: 'EXPLORER' | 'COMMANDER') => void;
  onReturnHome: () => void;
}

export const MissionReportScreen: React.FC<MissionReportProps> = ({
  missionId,
  onPlayAgain,
  onReturnHome,
}) => {
  const [report, setReport] = useState<MissionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getMissionReport(missionId);
        setReport(data);
        if (data.outcome_status === 'COMPLETED') {
          sound.playSuccess();
        } else {
          sound.playAlarm();
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve mission report.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [missionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-astra-bg text-astra-text flex items-center justify-center font-mono text-xs">
        <div className="text-center space-y-3 p-8 hud-panel max-w-sm">
          <SkeletonLoader variant="circle" width={48} height={48} className="mx-auto" />
          <p className="text-astra-muted">Compiling 90-day orbital telemetry records and final debrief...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-astra-bg text-astra-text flex items-center justify-center p-4">
        <ErrorStateWithRetry
          title="Unable to Load Telemetry Report"
          message={error || 'Mission record not found.'}
          onRetry={onReturnHome}
        />
      </div>
    );
  }

  const isSuccess = report.outcome_status === 'COMPLETED';
  const score = report.score_breakdown;

  return (
    <div className="min-h-screen bg-astra-bg text-astra-text flex flex-col selection:bg-astra-accent/25">
      {/* Top Header */}
      <header className="bg-astra-bg/90 backdrop-blur-md border-b border-astra-border px-4 py-3 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-astra-accent/20 border border-astra-accent/40 flex items-center justify-center text-astra-accent font-bold font-mono text-xs shadow-inner">
              A
            </div>
            <span className="font-display text-sm font-bold text-white">{report.label}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-astra-raised border border-astra-border text-astra-accent">
              {report.difficulty_mode}
            </span>
          </div>
          <button
            onClick={onReturnHome}
            className="text-xs font-mono text-astra-muted hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Mission Selection</span>
          </button>
        </div>
      </header>

      {/* Main Report Body */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Outcome Hero Banner */}
        <div
          className={`p-8 rounded-2xl border text-center shadow-2xl relative overflow-hidden hud-corner-bracket ${
            isSuccess
              ? 'bg-gradient-to-b from-astra-nominal/15 via-astra-surface to-astra-bg border-astra-nominal/50 shadow-glow-nominal'
              : 'bg-gradient-to-b from-astra-critical/15 via-astra-surface to-astra-bg border-astra-critical/50 shadow-glow-critical'
          }`}
        >
          <div className="inline-flex items-center justify-center p-3.5 rounded-full mb-3 bg-astra-surface border border-astra-border shadow-inner">
            {isSuccess ? (
              <CheckCircle2 className="w-12 h-12 text-astra-nominal animate-pulse" />
            ) : (
              <AlertOctagon className="w-12 h-12 text-astra-critical" />
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white mb-2 tracking-tight">
            {isSuccess ? 'MISSION ACCOMPLISHED: DAY 90 COMPLETED' : `EXPEDITION TERMINATED ON DAY ${report.days_survived}`}
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-astra-text font-sans leading-relaxed mb-5">
            {isSuccess
              ? 'All four astronauts survived 90 continuous days at the Lunar Outpost. Closed-loop life support and ECLSS resource stewardship were executed with distinguished honors!'
              : report.failure_reason || 'A critical life-support deficit breached human physiological limits.'}
          </p>

          {/* Final Score Banner */}
          {score && (
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-astra-raised border border-astra-accent/50 shadow-2xl">
              <Award className="w-8 h-8 text-astra-caution" />
              <div className="text-left font-mono">
                <div className="text-[10px] text-astra-muted uppercase tracking-wider">
                  Final Mission Performance Score
                </div>
                <div className="text-3xl font-extrabold text-astra-accent tracking-tight">
                  {score.total_score}{' '}
                  <span className="text-xs text-astra-muted font-normal">
                    pts {report.difficulty_mode === 'COMMANDER' ? '(1.25x Commander Multiplier Applied)' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transparent Score Breakdown Grid */}
        {score && (
          <div className="hud-panel p-5 space-y-4">
            <h2 className="font-display text-xs uppercase tracking-wider text-astra-text font-bold flex items-center gap-2 border-b border-astra-border pb-2">
              <Award className="w-4 h-4 text-astra-accent" />
              <span>Factor-Based Performance Score Breakdown</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'Crew Survival', val: score.crew_survival_score, max: 400, desc: 'Health stability', color: 'from-rose-500 to-red-400' },
                { label: 'Mission Duration', val: score.duration_score, max: 200, desc: `${report.days_survived}/90 days`, color: 'from-blue-500 to-cyan-400' },
                { label: 'Resource Stewardship', val: score.resource_stewardship_score, max: 150, desc: 'Ending reserves', color: 'from-emerald-500 to-teal-400' },
                { label: 'Radiation Safety', val: score.radiation_safety_score, max: 100, desc: 'Shielding efficacy', color: 'from-purple-500 to-indigo-400' },
                { label: 'Decision Quality', val: score.decision_quality_score, max: 150, desc: 'Emergency choices', color: 'from-amber-500 to-yellow-400' },
              ].map((f) => {
                const pct = Math.min((f.val / f.max) * 100, 100);
                return (
                  <div key={f.label} className="p-3.5 rounded-xl bg-astra-raised border border-astra-border flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-astra-muted uppercase tracking-wider">{f.label}</div>
                      <div className="text-xl font-bold font-mono text-white my-1">
                        {f.val} <span className="text-[10px] text-astra-muted font-normal">/ {f.max}</span>
                      </div>
                    </div>
                    <div>
                      {/* Mini fill bar */}
                      <div className="w-full bg-astra-surface rounded-full h-1.5 overflow-hidden border border-astra-border mb-1.5">
                        <div
                          className={`h-full bg-gradient-to-r ${f.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-astra-accent">{f.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Crew Status */}
        <CrewStatusPanel crew={report.crew} />

        {/* 90-Day Full Telemetry Trends */}
        <ResourceTrendsChart history={report.telemetry_history} />

        {/* Key Turning Points Timeline */}
        {report.key_turning_points && report.key_turning_points.length > 0 && (
          <div className="hud-panel p-5 space-y-3">
            <h2 className="font-display text-xs uppercase tracking-wider text-astra-text font-bold flex items-center gap-2 border-b border-astra-border pb-2">
              <Calendar className="w-4 h-4 text-astra-accent" />
              <span>Key Mission Turning Points & Incident Resolutions</span>
            </h2>

            <div className="space-y-2.5">
              {report.key_turning_points.map((tp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-astra-raised border border-astra-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono hover:border-astra-border-light transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-astra-surface text-astra-accent font-bold border border-astra-border">
                      SOL {tp.day}
                    </span>
                    <span className="font-bold text-white">{tp.event_title}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-astra-muted font-sans text-xs">
                    <span>{tp.resolution}</span>
                    <StatusBadge status={tp.severity} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curated STEM Educational Takeaways */}
        {report.educational_takeaways && report.educational_takeaways.length > 0 && (
          <div className="hud-panel p-5 space-y-3">
            <h2 className="font-display text-xs uppercase tracking-wider text-astra-text font-bold flex items-center gap-2 border-b border-astra-border pb-2">
              <BookOpen className="w-4 h-4 text-astra-accent" />
              <span>Core STEM Closed-Loop Systems Takeaways</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.educational_takeaways.map((fb) => (
                <div
                  key={fb.feedback_id}
                  className="p-3.5 rounded-lg bg-astra-raised border border-astra-border space-y-1.5"
                >
                  <div className="font-bold font-mono text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-astra-accent" />
                    <span>{fb.title}</span>
                  </div>
                  <p className="text-astra-muted font-sans leading-relaxed text-xs">
                    {fb.fact_summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-astra-border">
          <Button
            variant="secondary"
            size="md"
            icon={<Home className="w-4 h-4" />}
            onClick={onReturnHome}
          >
            Return to Mission Select
          </Button>

          <div className="flex items-center gap-3">
            {report.difficulty_mode === 'EXPLORER' && (
              <Button
                variant="secondary"
                size="md"
                icon={<Compass className="w-4 h-4" />}
                onClick={() => onPlayAgain('COMMANDER')}
              >
                Try Commander Mode
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => onPlayAgain(report.difficulty_mode)}
            >
              Play Again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

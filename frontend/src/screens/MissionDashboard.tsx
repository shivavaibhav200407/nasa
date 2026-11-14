import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Lightbulb,
  Play,
  RotateCw,
  Sliders,
  Radio,
  Layers,
  Users,
  LineChart,
} from 'lucide-react';
import { api } from '../api/client';
import { CinematicCycleTransition } from '../components/CinematicCycleTransition';
import { EducationalCard } from '../components/EducationalCard';
import { LayoutHeader } from '../components/LayoutHeader';
import { MasterAnnunciatorPanel } from '../components/MasterAnnunciatorPanel';
import { OutpostIsometricView } from '../components/OutpostIsometricView';
import { ResourceTrendsChart } from '../components/ResourceTrendsChart';
import { StatTile, CrewCard, Button } from '../components/ui';
import type {
  AdvanceDayPayload,
  AdvanceDayResponse,
  DailySnapshot,
  MissionDetail,
} from '../types/mission';
import { sound } from '../utils/soundFx';

interface MissionDashboardProps {
  mission: MissionDetail;
  currentAllocations: AdvanceDayPayload;
  onNavigate: (screen: 'dashboard' | 'engineering' | 'events') => void;
  onMissionUpdated: (updatedMission: MissionDetail) => void;
  onMissionFinished: (missionId: string) => void;
  onExit: () => void;
}

export const MissionDashboard: React.FC<MissionDashboardProps> = ({
  mission,
  currentAllocations,
  onNavigate,
  onMissionUpdated,
  onMissionFinished,
  onExit,
}) => {
  const [advancing, setAdvancing] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    res: AdvanceDayResponse;
    newSnapshot: DailySnapshot;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [latestDeltas, setLatestDeltas] = useState<AdvanceDayResponse['deltas'] | undefined>(undefined);
  const [mobileTab, setMobileTab] = useState<'outpost' | 'systems' | 'crew' | 'telemetry'>('outpost');

  const isExplorer = mission.difficulty_mode === 'EXPLORER';
  const hasPendingEmergency =
    mission.active_event &&
    mission.active_event.requires_decision &&
    mission.active_event.resolution_status === 'PENDING';

  // Compute average crew health
  const avgCrewHealth =
    mission.crew.reduce((sum, c) => sum + c.health, 0) / Math.max(mission.crew.length, 1);

  // Generate contextual Explorer hints
  const getExplorerHint = () => {
    if (hasPendingEmergency) {
      return 'URGENT HAZARD: An active anomaly requires your intervention on the Events screen before advancing to the next day!';
    }
    if (mission.systems.oxygen_level <= 25.0) {
      return 'OXYGEN ALERT: Atmospheric reserves are falling near the critical 15.0 floor. Open Engineering to prioritize Life Support power and electrolysis feed.';
    }
    if (mission.systems.water_level <= 35.0) {
      return 'WATER CONSERVATION: Closed-loop recycling incurs irreversible loss. Consider pausing non-essential water consumption or boosting recycler power.';
    }
    if (mission.systems.battery_level <= 25.0) {
      return 'POWER SHORTFALL: Battery storage is depleting rapidly. Check that non-critical subsystem loads are not exceeding solar generation.';
    }
    if (avgCrewHealth < 60.0) {
      return 'CREW FATIGUE: Crew vitals are declining. Assign Rest Posture in Engineering to allow astronauts to recover physiological health and reduce stress.';
    }
    return 'SYSTEMS NOMINAL: Closed-loop life support is operating within safe margins. Review multi-day telemetry trends and advance day when ready.';
  };

  const handleAdvanceDay = async () => {
    if (hasPendingEmergency) {
      sound.playAlarm();
      onNavigate('events');
      return;
    }

    sound.playClick(1500);
    setAdvancing(true);
    setError(null);

    try {
      const payload: AdvanceDayPayload = {
        ...currentAllocations,
        expected_day: mission.current_day,
      };

      const res = await api.advanceDay(mission.id, payload);

      const newSnapshot: DailySnapshot = {
        day_number: res.day_number,
        oxygen_level: res.system_levels.oxygen_level,
        water_level: res.system_levels.water_level,
        energy_generated: res.system_levels.solar_generation,
        battery_level: res.system_levels.battery_level,
        food_level: res.system_levels.food_level,
        greenhouse_progress: res.system_levels.greenhouse_progress,
        radiation_daily_dose: res.system_levels.radiation_daily_dose,
        state_checksum: res.state_checksum,
      };

      setPendingUpdate({ res, newSnapshot });
      setShowTransition(true);
    } catch (err: any) {
      setError(err.message || 'Error stepping mission day.');
      setAdvancing(false);
    }
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setAdvancing(false);

    if (!pendingUpdate) return;
    const { res, newSnapshot } = pendingUpdate;

    setLatestDeltas(res.deltas);

    const updatedMission: MissionDetail = {
      ...mission,
      current_day: res.day_number,
      status: res.mission_status,
      failure_reason: res.failure_reason,
      systems: res.system_levels,
      crew: res.crew,
      history: [...mission.history, newSnapshot],
      active_event: res.active_event,
      educational_feedback: [...res.educational_feedback, ...mission.educational_feedback],
    };

    onMissionUpdated(updatedMission);

    if (res.mission_status === 'COMPLETED' || res.mission_status === 'FAILED') {
      if (res.mission_status === 'COMPLETED') sound.playSuccess();
      else sound.playAlarm();
      onMissionFinished(mission.id);
    } else if (res.active_event && res.active_event.requires_decision) {
      sound.playAlarm();
      onNavigate('events');
    }
  };

  // Helper to extract historical arrays for sparklines
  const getHistory = (field: keyof DailySnapshot): number[] => {
    const list = mission.history.map((s) => s[field] as number);
    return list.length > 0 ? list : [0, 0];
  };

  // System status helpers
  const getO2Status = () => (mission.systems.oxygen_level <= 20 ? 'CRITICAL' : mission.systems.oxygen_level <= 45 ? 'CAUTION' : 'NOMINAL');
  const getWaterStatus = () => (mission.systems.water_level <= 25 ? 'CRITICAL' : mission.systems.water_level <= 50 ? 'CAUTION' : 'NOMINAL');
  const getPowerStatus = () => (mission.systems.battery_level <= 20 ? 'CRITICAL' : mission.systems.battery_level <= 45 ? 'CAUTION' : 'NOMINAL');
  const getFoodStatus = () => (mission.systems.food_level <= 25 ? 'CRITICAL' : mission.systems.food_level <= 60 ? 'CAUTION' : 'NOMINAL');
  const getGhStatus = () => (!currentAllocations.greenhouse_active ? 'CAUTION' : mission.systems.greenhouse_progress >= 14 ? 'NOMINAL' : 'NOMINAL');
  const getRadStatus = () => (mission.systems.radiation_daily_dose >= 1.5 ? 'CRITICAL' : mission.systems.radiation_daily_dose >= 0.6 ? 'CAUTION' : 'NOMINAL');

  return (
    <div className="min-h-screen bg-astra-bg text-astra-text flex flex-col selection:bg-astra-accent/25">
      {/* Sol Cycle Transition Overlay */}
      {showTransition && (
        <CinematicCycleTransition
          currentDay={mission.current_day}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Top Application Bar */}
      <LayoutHeader
        currentScreen="dashboard"
        onNavigate={onNavigate}
        missionId={mission.id}
        missionLabel={mission.label}
        dayNumber={mission.current_day}
        difficultyMode={mission.difficulty_mode}
        missionStatus={mission.status}
        pendingEventCount={hasPendingEmergency ? 1 : 0}
        onExit={onExit}
      />

      <main className="max-w-[1600px] mx-auto px-4 py-4 space-y-4 flex-1 w-full">
        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-astra-critical/15 border border-astra-critical/50 text-astra-critical text-xs font-mono flex items-center justify-between shadow-glow-critical">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-astra-text hover:underline ml-3 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Blocking Emergency Anomaly Banner */}
        {hasPendingEmergency && (
          <div className="p-4 rounded-xl bg-astra-critical/20 border-2 border-astra-critical text-white flex flex-wrap items-center justify-between gap-3 shadow-glow-critical animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-astra-critical/30 border border-astra-critical flex items-center justify-center text-white">
                <AlertOctagon className="w-6 h-6 text-white animate-spin" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-astra-critical">
                  Critical Anomaly Active — Advancing Sol Blocked
                </div>
                <div className="text-sm font-display font-bold text-white">
                  {mission.active_event?.title}
                </div>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              onClick={() => {
                sound.playAlarm();
                onNavigate('events');
              }}
            >
              Resolve Anomaly on Events Deck
            </Button>
          </div>
        )}

        {/* Master Caution & Warning Annunciator Panel */}
        <MasterAnnunciatorPanel
          systems={mission.systems}
          crew={mission.crew}
          onInspectSubsystem={(id) => {
            sound.playClick(1000);
            if (id === 'bus_a' || id === 'bus_b') {
              onNavigate('engineering');
            }
          }}
        />

        {/* Explorer Mode Hint Banner */}
        {isExplorer && (
          <div className="p-3 rounded-xl bg-astra-accent/10 border border-astra-accent/30 text-astra-text text-xs font-mono flex items-center gap-2.5 shadow-sm">
            <Lightbulb className="w-4 h-4 text-astra-accent shrink-0 animate-pulse" />
            <div className="flex-1">
              <span className="font-bold text-astra-accent uppercase tracking-wider">
                EXPLORER HINT:
              </span>{' '}
              {getExplorerHint()}
            </div>
          </div>
        )}

        {/* Mobile Tab Navigation (< 1024px) */}
        <div className="lg:hidden flex items-center gap-1 p-1 bg-astra-surface rounded-xl border border-astra-border font-mono text-xs">
          <button
            onClick={() => setMobileTab('outpost')}
            className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'outpost'
                ? 'bg-astra-accent text-astra-bg font-bold'
                : 'text-astra-muted hover:text-astra-text'
            }`}
          >
            <Layers size={14} />
            <span>Outpost</span>
          </button>
          <button
            onClick={() => setMobileTab('systems')}
            className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'systems'
                ? 'bg-astra-accent text-astra-bg font-bold'
                : 'text-astra-muted hover:text-astra-text'
            }`}
          >
            <Radio size={14} />
            <span>Systems</span>
          </button>
          <button
            onClick={() => setMobileTab('crew')}
            className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'crew'
                ? 'bg-astra-accent text-astra-bg font-bold'
                : 'text-astra-muted hover:text-astra-text'
            }`}
          >
            <Users size={14} />
            <span>Crew</span>
          </button>
          <button
            onClick={() => setMobileTab('telemetry')}
            className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'telemetry'
                ? 'bg-astra-accent text-astra-bg font-bold'
                : 'text-astra-muted hover:text-astra-text'
            }`}
          >
            <LineChart size={14} />
            <span>Telemetry</span>
          </button>
        </div>

        {/* Main 3-Column Mission Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT RAIL: 6 Subsystem StatTiles (3 Cols on Desktop) */}
          <div
            className={`lg:col-span-3 space-y-2.5 ${
              mobileTab !== 'systems' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="font-display font-semibold text-xs tracking-wider uppercase text-astra-muted flex items-center gap-1.5">
                <Radio size={13} className="text-astra-accent" />
                Subsystem Closed-Loop
              </span>
              <span className="text-[10px] font-mono text-astra-dim">6 ACTIVE</span>
            </div>

            <StatTile
              id="sys-o2"
              title="Atmospheric O2"
              value={mission.systems.oxygen_level}
              unit="%"
              status={getO2Status()}
              history={getHistory('oxygen_level')}
              delta={latestDeltas?.oxygen_delta}
              onClick={() => onNavigate('engineering')}
            />

            <StatTile
              id="sys-h2o"
              title="Potable Water"
              value={mission.systems.water_level}
              unit="L"
              max={300}
              status={getWaterStatus()}
              history={getHistory('water_level')}
              delta={latestDeltas?.water_delta}
              onClick={() => onNavigate('engineering')}
            />

            <StatTile
              id="sys-pwr"
              title="Battery Storage"
              value={mission.systems.battery_level}
              unit="kWh"
              max={120}
              status={getPowerStatus()}
              history={getHistory('battery_level')}
              delta={latestDeltas?.battery_delta}
              onClick={() => onNavigate('engineering')}
            />

            <StatTile
              id="sys-bio"
              title="Food Rations"
              value={mission.systems.food_level}
              unit="meals"
              max={200}
              status={getFoodStatus()}
              history={getHistory('food_level')}
              delta={latestDeltas?.food_delta}
              onClick={() => onNavigate('engineering')}
            />

            <StatTile
              id="sys-gh"
              title="Hydroponics Cycle"
              value={(mission.systems.greenhouse_progress / 15) * 100}
              unit="%"
              status={getGhStatus()}
              history={getHistory('greenhouse_progress').map((p) => (p / 15) * 100)}
              onClick={() => onNavigate('engineering')}
            />

            <StatTile
              id="sys-rad"
              title="Radiation Daily Dose"
              value={mission.systems.radiation_daily_dose}
              unit="mSv"
              max={5}
              status={getRadStatus()}
              history={getHistory('radiation_daily_dose')}
              onClick={() => onNavigate('engineering')}
            />
          </div>

          {/* CENTER STAGE: 2.5D Outpost & Telemetry Trajectory (6 Cols on Desktop) */}
          <div
            className={`lg:col-span-6 space-y-4 ${
              mobileTab !== 'outpost' && mobileTab !== 'telemetry' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* 2.5D Outpost Isometric View */}
            <div className={mobileTab === 'telemetry' ? 'hidden lg:block' : 'block'}>
              <OutpostIsometricView
                systems={mission.systems}
                stormShelterActive={currentAllocations.storm_shelter_posture}
                greenhouseActive={currentAllocations.greenhouse_active}
                onNavigateEngineering={() => onNavigate('engineering')}
              />
            </div>

            {/* Multi-Day Telemetry Trend Graph */}
            <div className={mobileTab === 'outpost' ? 'hidden lg:block' : 'block'}>
              <ResourceTrendsChart history={mission.history} />
            </div>

            {/* Educational Feedback Card */}
            <EducationalCard
              feedback={mission.educational_feedback}
              mode={mission.difficulty_mode}
            />
          </div>

          {/* RIGHT PANEL: Flight Crew Biometrics & Alerts (3 Cols on Desktop) */}
          <div
            className={`lg:col-span-3 space-y-3 ${
              mobileTab !== 'crew' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="font-display font-semibold text-xs tracking-wider uppercase text-astra-muted flex items-center gap-1.5">
                <Users size={13} className="text-astra-accent" />
                Crew Biotelemetry
              </span>
              <span className="text-[10px] font-mono text-astra-dim">STRICT 4/4 ALIVE</span>
            </div>

            <div className="space-y-2">
              {mission.crew.map((member) => (
                <CrewCard key={member.astronaut_id} member={member} />
              ))}
            </div>

            {/* Quick Status Advisory Deck */}
            <div className="p-3 rounded-xl bg-astra-surface/90 border border-astra-border text-xs font-mono space-y-2">
              <div className="text-[11px] text-astra-muted uppercase tracking-wider font-semibold">
                Operational Status Deck
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-astra-border/50">
                <span className="text-astra-muted">Total Subsystem Load:</span>
                <span className="font-bold text-astra-accent">
                  {mission.systems.total_energy_load} kW
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-astra-muted">Solar Generation:</span>
                <span className="font-bold text-astra-nominal">
                  {mission.systems.solar_generation} kW
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-astra-muted">Average Crew Health:</span>
                <span
                  className={`font-bold ${
                    avgCrewHealth < 60 ? 'text-astra-caution' : 'text-astra-nominal'
                  }`}
                >
                  {avgCrewHealth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Primary Action Bar */}
        <div className="hud-panel p-4 flex flex-wrap items-center justify-between gap-4 sticky bottom-4 shadow-2xl z-20 bg-astra-surface/95 backdrop-blur-md border border-astra-border">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={<Sliders size={15} />}
              onClick={() => {
                sound.playClick();
                onNavigate('engineering');
              }}
            >
              Configure Engineering
            </Button>

            <div className="text-xs font-mono text-astra-muted hidden md:flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-astra-raised border border-astra-border">
                Power Bus:{' '}
                <strong className="text-astra-accent">
                  {mission.systems.total_energy_load} kW
                </strong>
              </span>
              <span className="px-2 py-1 rounded bg-astra-raised border border-astra-border">
                O2 Mode:{' '}
                <strong className="text-astra-nominal">
                  {currentAllocations.oxygen_mode}
                </strong>
              </span>
              <span className="px-2 py-1 rounded bg-astra-raised border border-astra-border">
                Hydroponics:{' '}
                <strong
                  className={
                    currentAllocations.greenhouse_active
                      ? 'text-astra-nominal'
                      : 'text-astra-muted'
                  }
                >
                  {currentAllocations.greenhouse_active ? 'Active' : 'Standby'}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={hasPendingEmergency ? 'danger' : 'primary'}
              size="lg"
              disabled={advancing || mission.status !== 'IN_PROGRESS'}
              loading={advancing}
              icon={
                advancing ? (
                  <RotateCw size={16} className="animate-spin" />
                ) : hasPendingEmergency ? (
                  <AlertOctagon size={16} />
                ) : (
                  <Play size={16} className="fill-current" />
                )
              }
              onClick={handleAdvanceDay}
            >
              {hasPendingEmergency
                ? 'Resolve Hazard Before Advancing'
                : `Advance to Day ${mission.current_day + 1}`}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

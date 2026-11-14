import React, { useState, useEffect } from 'react';
import { api } from './api/client';
import { Starfield } from './components/Starfield';
import { EngineeringPage } from './screens/EngineeringPage';
import { EventsPage } from './screens/EventsPage';
import { LandingPage } from './screens/LandingPage';
import { MissionDashboard } from './screens/MissionDashboard';
import { MissionReportScreen } from './screens/MissionReport';
import { MissionSetup } from './screens/MissionSetup';
import { StyleguideScreen } from './screens/StyleguideScreen';
import type { AdvanceDayPayload, MissionDetail } from './types/mission';
import { sound } from './utils/soundFx';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    'landing' | 'setup' | 'dashboard' | 'engineering' | 'events' | 'report' | 'styleguide'
  >('landing');
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);

  // Staged engineering decisions
  const [allocations, setAllocations] = useState<AdvanceDayPayload>({
    expected_day: 1,
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

  const loadMissionData = async (id: string, targetScreen?: 'dashboard' | 'events' | 'report') => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMission(id);
      setActiveMissionId(id);
      setActiveMission(data);

      setAllocations((prev) => ({
        ...prev,
        expected_day: data.current_day,
      }));

      if (targetScreen) {
        setCurrentScreen(targetScreen);
      } else if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        setCurrentScreen('report');
      } else if (
        data.active_event &&
        data.active_event.requires_decision &&
        data.active_event.resolution_status === 'PENDING'
      ) {
        setCurrentScreen('events');
      } else {
        setCurrentScreen('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load mission.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeMission = (missionId: string) => {
    sound.playClick();
    loadMissionData(missionId);
  };

  const handleViewReport = (missionId: string) => {
    sound.playClick();
    setActiveMissionId(missionId);
    setCurrentScreen('report');
  };

  const handleReturnHome = () => {
    sound.playClick();
    setCurrentScreen('landing');
  };

  // Check URL hash for #styleguide, #mission, and #report
  useEffect(() => {
    const checkHash = () => {
      const isDev = import.meta.env.DEV;
      const isStyleguideTarget =
        window.location.hash === '#styleguide' ||
        window.location.search.includes('styleguide=true') ||
        window.location.pathname === '/styleguide';

      if (isDev && isStyleguideTarget) {
        setCurrentScreen('styleguide');
      } else if (window.location.hash.startsWith('#mission=')) {
        const mId = window.location.hash.replace('#mission=', '');
        if (mId && mId !== activeMissionId) {
          loadMissionData(mId);
        }
      } else if (window.location.hash.startsWith('#report=')) {
        const repId = window.location.hash.replace('#report=', '');
        if (repId) {
          setActiveMissionId(repId);
          setCurrentScreen('report');
        }
      } else if (currentScreen === 'styleguide') {
        setCurrentScreen('landing');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [activeMissionId, currentScreen]);

  const renderActiveScreen = () => {
    // Styleguide dev-only route
    if (currentScreen === 'styleguide') {
      return <StyleguideScreen />;
    }

    // 1. Loading Splash
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center font-mono text-xs">
          <div className="text-center space-y-3 hud-card p-8 border-lunar-cyan/40">
            <div className="w-10 h-10 border-2 border-lunar-cyan border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-300">Synchronizing Outpost Telemetry...</p>
          </div>
        </div>
      );
    }

    // 2. Landing Screen
    if (currentScreen === 'landing') {
      return (
        <LandingPage
          onNewMission={() => {
            sound.playClick();
            setCurrentScreen('setup');
          }}
          onResumeMission={handleResumeMission}
          onViewReport={handleViewReport}
        />
      );
    }

    // 3. Mission Setup Screen
    if (currentScreen === 'setup') {
      return (
        <MissionSetup
          onBack={handleReturnHome}
          onMissionLaunched={(newMissionId) => {
            sound.playSuccess();
            loadMissionData(newMissionId, 'dashboard');
          }}
        />
      );
    }

    // 4. Mission Report Screen
    if (currentScreen === 'report' && activeMissionId) {
      return (
        <MissionReportScreen
          missionId={activeMissionId}
          onPlayAgain={(_mode) => {
            sound.playClick();
            setCurrentScreen('setup');
          }}
          onReturnHome={handleReturnHome}
        />
      );
    }

    // If active mission is not yet loaded for in-game screens, redirect to landing
    if (!activeMission) {
      return (
        <LandingPage
          onNewMission={() => {
            sound.playClick();
            setCurrentScreen('setup');
          }}
          onResumeMission={handleResumeMission}
          onViewReport={handleViewReport}
        />
      );
    }

    // 5. Engineering Management Screen
    if (currentScreen === 'engineering') {
      return (
        <EngineeringPage
          mission={activeMission}
          allocations={allocations}
          onSaveAllocations={(updated) => setAllocations(updated)}
          onNavigate={(screen) => {
            sound.playClick();
            setCurrentScreen(screen);
          }}
          onExit={handleReturnHome}
        />
      );
    }

    // 6. Events & Emergency Decisions Screen
    if (currentScreen === 'events') {
      return (
        <EventsPage
          mission={activeMission}
          onNavigate={(screen) => {
            sound.playClick();
            setCurrentScreen(screen);
          }}
          onMissionUpdated={(updated) => setActiveMission(updated)}
          onExit={handleReturnHome}
        />
      );
    }

    // 7. Mission Control Dashboard (Default active mission screen)
    return (
      <MissionDashboard
        mission={activeMission}
        currentAllocations={allocations}
        onNavigate={(screen) => {
          sound.playClick();
          setCurrentScreen(screen);
        }}
        onMissionUpdated={(updated) => setActiveMission(updated)}
        onMissionFinished={(id) => {
          setActiveMissionId(id);
          setCurrentScreen('report');
        }}
        onExit={handleReturnHome}
      />
    );
  };

  return (
    <div className="relative min-h-screen bg-cinematic-bg-dark text-cinematic-text overflow-x-hidden selection:bg-cinematic-cyan/30">
      <Starfield />
      <div className="relative z-10">{renderActiveScreen()}</div>
    </div>
  );
};

export default App;

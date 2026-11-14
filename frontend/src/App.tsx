import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api/client';
import SpaceScene from './three/SpaceScene';
import Header from './components/Header';
import PlanetLanding from './components/PlanetLanding';
import PlanetInformation from './components/PlanetInformation';
import PlanetZoomOverlay from './components/PlanetZoomOverlay';
import LoadingScreen from './components/LoadingScreen';
import AboutModal from './components/AboutModal';
import { FlightManualModal } from './components/FlightManualModal';
import { Starfield } from './components/Starfield';

import { MissionSetup } from './screens/MissionSetup';
import { MissionDashboard } from './screens/MissionDashboard';
import { EngineeringPage } from './screens/EngineeringPage';
import { EventsPage } from './screens/EventsPage';
import { MissionReportScreen } from './screens/MissionReport';
import { StyleguideScreen } from './screens/StyleguideScreen';

import { useAudio } from './hooks/useAudio';
import { sound } from './utils/soundFx';
import { PLANETS } from './data/planets';
import type { AdvanceDayPayload, MissionDetail } from './types/mission';

export default function App() {
  // Global View Navigation: 'cosmos' (3D Three.js Explorer) vs ASTRA ECLSS Simulation Screens
  const [currentView, setCurrentView] = useState<
    'cosmos' | 'setup' | 'dashboard' | 'engineering' | 'events' | 'report' | 'styleguide'
  >('cosmos');

  // Cosmos 3D View States
  const [screenState, setScreenState] = useState<'landing' | 'split' | 'zoom'>('landing');
  const [currentIndex, setCurrentIndex] = useState(2); // Earth by default
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFlightManual, setShowFlightManual] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const wheelLockRef = useRef(false);

  // ASTRA ECLSS Simulation States
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<MissionDetail | null>(null);
  const [missionLoading, setMissionLoading] = useState(false);
  const [missionError, setMissionError] = useState<string | null>(null);

  // Staged Engineering Allocations
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

  const { isMuted, toggleMute, playTransitionSound, playClickSound } = useAudio();
  const currentPlanet = PLANETS[currentIndex];

  // Mobile viewport detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial Preloader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Sync mute state to ASTRA sound engine
  const handleToggleAudio = useCallback(() => {
    toggleMute();
    sound.toggleMute();
  }, [toggleMute]);

  // Load mission from backend API
  const loadMissionData = useCallback(
    async (id: string, targetScreen?: 'dashboard' | 'events' | 'report') => {
      setMissionLoading(true);
      setMissionError(null);
      try {
        const data = await api.getMission(id);
        setActiveMissionId(id);
        setActiveMission(data);

        setAllocations((prev) => ({
          ...prev,
          expected_day: data.current_day,
        }));

        if (targetScreen) {
          setCurrentView(targetScreen);
        } else if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setCurrentView('report');
        } else if (
          data.active_event &&
          data.active_event.requires_decision &&
          data.active_event.resolution_status === 'PENDING'
        ) {
          setCurrentView('events');
        } else {
          setCurrentView('dashboard');
        }
      } catch (err: any) {
        console.error('Failed to load mission data:', err);
        setMissionError(err.message || 'Failed to connect to ASTRA life-support backend.');
      } finally {
        setMissionLoading(false);
      }
    },
    []
  );

  // Check URL hash for direct links and auto-discover active missions on backend
  useEffect(() => {
    const checkHashAndDiscover = async () => {
      const isDev = import.meta.env.DEV;
      const isStyleguideTarget =
        window.location.hash === '#styleguide' ||
        window.location.search.includes('styleguide=true') ||
        window.location.pathname === '/styleguide';

      if (isDev && isStyleguideTarget) {
        setCurrentView('styleguide');
        return;
      }

      if (window.location.hash.startsWith('#mission=')) {
        const mId = window.location.hash.replace('#mission=', '');
        if (mId && mId !== activeMissionId) {
          loadMissionData(mId);
          return;
        }
      } else if (window.location.hash.startsWith('#report=')) {
        const repId = window.location.hash.replace('#report=', '');
        if (repId) {
          setActiveMissionId(repId);
          setCurrentView('report');
          return;
        }
      }

      // Proactively check if there are any active missions stored in the backend
      try {
        const missions = await api.listMissions();
        if (missions && missions.length > 0) {
          const inProgress = missions.find((m) => m.status === 'IN_PROGRESS');
          if (inProgress) {
            const fullMission = await api.getMission(inProgress.id);
            setActiveMissionId(inProgress.id);
            setActiveMission(fullMission);
          }
        }
      } catch (e) {
        // Backend offline or empty list
      }
    };

    checkHashAndDiscover();
    window.addEventListener('hashchange', checkHashAndDiscover);
    return () => window.removeEventListener('hashchange', checkHashAndDiscover);
  }, [activeMissionId, loadMissionData]);

  // Planet navigation methods in 3D Cosmos
  const selectPlanet = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      playClickSound();
      playTransitionSound();
      setCurrentIndex(index);
    },
    [currentIndex, playClickSound, playTransitionSound]
  );

  const nextPlanet = useCallback(() => {
    playClickSound();
    playTransitionSound();
    setCurrentIndex((prev) => (prev + 1) % PLANETS.length);
  }, [playClickSound, playTransitionSound]);

  const prevPlanet = useCallback(() => {
    playClickSound();
    playTransitionSound();
    setCurrentIndex((prev) => (prev - 1 + PLANETS.length) % PLANETS.length);
  }, [playClickSound, playTransitionSound]);

  // Keyboard navigation when in Cosmos view
  useEffect(() => {
    if (currentView !== 'cosmos') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextPlanet();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPlanet();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (screenState === 'landing') {
          playClickSound();
          setScreenState('split');
        } else if (screenState === 'split') {
          playClickSound();
          setScreenState('zoom');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (screenState === 'zoom') {
          playClickSound();
          setScreenState('split');
        } else if (screenState === 'split') {
          playClickSound();
          setScreenState('landing');
        }
      } else if (e.key === 'Escape') {
        if (screenState !== 'landing') {
          playClickSound();
          setScreenState('landing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, screenState, nextPlanet, prevPlanet, playClickSound]);

  // Mouse wheel navigation in Cosmos view
  useEffect(() => {
    if (currentView !== 'cosmos') return;

    const handleWheel = (e: WheelEvent) => {
      if (wheelLockRef.current) return;
      if (Math.abs(e.deltaY) > 30) {
        wheelLockRef.current = true;
        if (e.deltaY > 0) {
          if (screenState === 'landing') {
            playClickSound();
            setScreenState('split');
          } else if (screenState === 'split') {
            playClickSound();
            setScreenState('zoom');
          }
        } else {
          if (screenState === 'zoom') {
            playClickSound();
            setScreenState('split');
          } else if (screenState === 'split') {
            playClickSound();
            setScreenState('landing');
          }
        }
        setTimeout(() => {
          wheelLockRef.current = false;
        }, 750);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentView, screenState, playClickSound]);

  // Launcher handler: switches between 3D Cosmos and ASTRA simulation
  const handleLaunchMission = () => {
    sound.playClick();
    if (activeMission && activeMission.status === 'IN_PROGRESS') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('setup');
    }
  };

  const handleReturnHome = () => {
    sound.playClick();
    setCurrentView('cosmos');
  };

  // Render content according to currentView
  const renderViewContent = () => {
    // 1. Dev Styleguide
    if (currentView === 'styleguide') {
      return <StyleguideScreen />;
    }

    // 2. Loading State
    if (missionLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center font-mono text-xs bg-[#030712] text-slate-100">
          <div className="text-center space-y-3.5 hud-card p-8 border-cyan-400/40 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-glow-cyan">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-200 uppercase tracking-widest text-[11px]">Synchronizing ECLSS Telemetry...</p>
          </div>
        </div>
      );
    }

    // 3. Mission Setup Screen
    if (currentView === 'setup') {
      return (
        <div className="relative min-h-screen bg-cinematic-bg-dark text-cinematic-text overflow-x-hidden">
          <Starfield />
          <div className="relative z-10">
            <MissionSetup
              onBack={handleReturnHome}
              onMissionLaunched={(newMissionId) => {
                sound.playSuccess();
                loadMissionData(newMissionId, 'dashboard');
              }}
            />
          </div>
        </div>
      );
    }

    // 4. Mission Report Screen
    if (currentView === 'report' && activeMissionId) {
      return (
        <div className="relative min-h-screen bg-cinematic-bg-dark text-cinematic-text overflow-x-hidden">
          <Starfield />
          <div className="relative z-10">
            <MissionReportScreen
              missionId={activeMissionId}
              onPlayAgain={() => {
                sound.playClick();
                setCurrentView('setup');
              }}
              onReturnHome={handleReturnHome}
            />
          </div>
        </div>
      );
    }

    // 5. Engineering Console Screen
    if (currentView === 'engineering' && activeMission) {
      return (
        <div className="relative min-h-screen bg-cinematic-bg-dark text-cinematic-text overflow-x-hidden">
          <Starfield />
          <div className="relative z-10">
            <EngineeringPage
              mission={activeMission}
              allocations={allocations}
              onSaveAllocations={(updated) => setAllocations(updated)}
              onNavigate={(screen) => {
                sound.playClick();
                setCurrentView(screen);
              }}
              onExit={handleReturnHome}
            />
          </div>
        </div>
      );
    }

    // 6. Emergency Decision & Events Screen
    if (currentView === 'events' && activeMission) {
      return (
        <div className="relative min-h-screen bg-cinematic-bg-dark text-cinematic-text overflow-x-hidden">
          <Starfield />
          <div className="relative z-10">
            <EventsPage
              mission={activeMission}
              onNavigate={(screen) => {
                sound.playClick();
                setCurrentView(screen);
              }}
              onMissionUpdated={(updated) => setActiveMission(updated)}
              onExit={handleReturnHome}
            />
          </div>
        </div>
      );
    }

    // 7. Mission Control Dashboard (Active mission telemetry)
    if (currentView === 'dashboard' && activeMission) {
      return (
        <div className="relative min-h-screen bg-cinematic-bg-dark text-cinematic-text overflow-x-hidden">
          <Starfield />
          <div className="relative z-10">
            <MissionDashboard
              mission={activeMission}
              currentAllocations={allocations}
              onNavigate={(screen) => {
                sound.playClick();
                setCurrentView(screen);
              }}
              onMissionUpdated={(updated) => setActiveMission(updated)}
              onMissionFinished={(id) => {
                setActiveMissionId(id);
                setCurrentView('report');
              }}
              onExit={handleReturnHome}
            />
          </div>
        </div>
      );
    }

    // 8. Default: 3D Cosmos Three.js Planet & Starfield Explorer View
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#030712] text-slate-100 font-sans select-none">
        {/* Preloader */}
        <LoadingScreen isLoading={isLoading} />

        {/* Global Top Navbar */}
        <Header
          activeTab={currentView === 'cosmos' ? 'cosmos' : 'simulation'}
          onTabChange={(tab) => {
            if (tab === 'cosmos') {
              setCurrentView('cosmos');
            } else {
              handleLaunchMission();
            }
          }}
          onLaunchMission={handleLaunchMission}
          onOpenFlightManual={() => setShowFlightManual(true)}
          onOpenScienceModal={() => setShowAboutModal(true)}
          activeMission={activeMission}
          isAudioMuted={isMuted}
          onToggleAudio={handleToggleAudio}
        />

        {/* Primary 3D Space Scene (Three.js with realistic planets and shaders) */}
        <SpaceScene
          screenState={screenState}
          currentIndex={currentIndex}
          onSelectPlanet={selectPlanet}
          isMobile={isMobile}
        />

        {/* Screen 1: Planet Landing View with Launch Mission Action */}
        <PlanetLanding
          currentIndex={currentIndex}
          onSelectPlanet={selectPlanet}
          onGetStarted={() => {
            playClickSound();
            setScreenState('split');
          }}
          onLaunchMission={handleLaunchMission}
          activeMission={activeMission}
          visible={screenState === 'landing'}
        />

        {/* Screen 2: Planet Information View */}
        <PlanetInformation
          planet={currentPlanet}
          visible={screenState === 'split'}
          onLearnMore={() => {
            playClickSound();
            setScreenState('zoom');
          }}
          onBackToLanding={() => {
            playClickSound();
            setScreenState('landing');
          }}
          onLaunchMission={handleLaunchMission}
          activeMission={activeMission}
        />

        {/* Screen 3: Cinematic Planet Zoom View */}
        <PlanetZoomOverlay
          planet={currentPlanet}
          visible={screenState === 'zoom'}
          onZoomOut={() => {
            playClickSound();
            setScreenState('split');
          }}
        />

        {/* Technical NASA Flight Manual Modal */}
        <FlightManualModal
          isOpen={showFlightManual}
          onClose={() => setShowFlightManual(false)}
        />

        {/* Scientific Integrity & About Modal */}
        <AboutModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
      </div>
    );
  };

  return <>{renderViewContent()}</>;
}

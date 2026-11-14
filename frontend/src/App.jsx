import React, { useState, useEffect, useRef } from 'react';
import SpaceScene from './three/SpaceScene';
import PlanetLanding from './components/PlanetLanding';
import PlanetInformation from './components/PlanetInformation';
import PlanetZoomOverlay from './components/PlanetZoomOverlay';
import LoadingScreen from './components/LoadingScreen';
import { useAudio } from './hooks/useAudio';
import { PLANETS } from './data/planets';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [screenState, setScreenState] = useState('landing'); // 'landing' | 'split' | 'zoom'
  const [currentIndex, setCurrentIndex] = useState(2); // Earth by default
  const [isMobile, setIsMobile] = useState(false);
  const wheelLockRef = useRef(false);

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

  // Preloader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Planet navigation methods
  const selectPlanet = (index) => {
    if (index === currentIndex) return;
    playClickSound();
    playTransitionSound();
    setCurrentIndex(index);
  };

  const nextPlanet = () => {
    playClickSound();
    playTransitionSound();
    setCurrentIndex((prev) => (prev + 1) % PLANETS.length);
  };

  const prevPlanet = () => {
    playClickSound();
    playTransitionSound();
    setCurrentIndex((prev) => (prev - 1 + PLANETS.length) % PLANETS.length);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

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
  }, [screenState, currentIndex]);

  // Mouse Wheel navigation
  useEffect(() => {
    const handleWheel = (e) => {
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
  }, [screenState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] text-slate-100 font-sans select-none">
      {/* Preloader */}
      <LoadingScreen isLoading={isLoading} />

      {/* Primary 3D Space Scene (Three.js & React Three Fiber) */}
      <SpaceScene
        screenState={screenState}
        currentIndex={currentIndex}
        onSelectPlanet={selectPlanet}
        isMobile={isMobile}
      />

      {/* Screen 1: Planet Landing View */}
      <PlanetLanding
        currentIndex={currentIndex}
        onSelectPlanet={selectPlanet}
        onGetStarted={() => {
          playClickSound();
          setScreenState('split');
        }}
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
    </div>
  );
}

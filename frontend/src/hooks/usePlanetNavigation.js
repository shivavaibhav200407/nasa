import { useState, useCallback, useEffect } from 'react';
import { PLANETS } from '../data/planets';

export function usePlanetNavigation({ onSelectSound, onTransitionSound } = {}) {
  const [currentIndex, setCurrentIndex] = useState(2); // Earth by default
  const [isExploring, setIsExploring] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [isOrbitEnabled, setIsOrbitEnabled] = useState(false);

  const currentPlanet = PLANETS[currentIndex];

  const handleTransitionStart = useCallback(() => {
    setIsTransitioning(true);
    setIsAnimationDone(false);
    if (onTransitionSound) onTransitionSound();
  }, [onTransitionSound]);

  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    setIsAnimationDone(true);
  }, []);

  const selectPlanet = useCallback((index) => {
    if (index === currentIndex && isExploring) return;
    if (index < 0 || index >= PLANETS.length) return;

    if (onSelectSound) onSelectSound();
    setCurrentIndex(index);
    if (!isExploring) {
      setIsExploring(true);
    }
    handleTransitionStart();
  }, [currentIndex, isExploring, onSelectSound, handleTransitionStart]);

  const nextPlanet = useCallback(() => {
    const nextIdx = (currentIndex + 1) % PLANETS.length;
    selectPlanet(nextIdx);
  }, [currentIndex, selectPlanet]);

  const prevPlanet = useCallback(() => {
    const prevIdx = (currentIndex - 1 + PLANETS.length) % PLANETS.length;
    selectPlanet(prevIdx);
  }, [currentIndex, selectPlanet]);

  const startExploring = useCallback((initialIndex = 2) => {
    if (onSelectSound) onSelectSound();
    setCurrentIndex(initialIndex);
    setIsExploring(true);
    handleTransitionStart();
  }, [onSelectSound, handleTransitionStart]);

  const returnToLanding = useCallback(() => {
    if (onSelectSound) onSelectSound();
    setIsExploring(false);
    setIsTransitioning(true);
    setIsAnimationDone(false);
    setIsOrbitEnabled(false);
  }, [onSelectSound]);

  const toggleOrbitMode = useCallback(() => {
    if (onSelectSound) onSelectSound();
    setIsOrbitEnabled(prev => !prev);
  }, [onSelectSound]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isExploring) {
          startExploring(0);
        } else {
          nextPlanet();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isExploring) {
          startExploring(7);
        } else {
          prevPlanet();
        }
      } else if (e.key === 'Escape') {
        if (isExploring) {
          returnToLanding();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExploring, nextPlanet, prevPlanet, startExploring, returnToLanding]);

  return {
    currentIndex,
    currentPlanet,
    isExploring,
    isTransitioning,
    isAnimationDone,
    isOrbitEnabled,
    selectPlanet,
    nextPlanet,
    prevPlanet,
    startExploring,
    returnToLanding,
    toggleOrbitMode,
    handleTransitionStart,
    handleTransitionComplete,
    totalPlanets: PLANETS.length
  };
}


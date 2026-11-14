import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Web Audio API synthesizer for ambient celestial sound and sleek sci-fi micro-interactions.
 * Zero external asset dependencies - runs 100% reliably in all modern browsers.
 */
export function useAudio() {
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef(null);
  const droneNodesRef = useRef(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      return ctx;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
      return null;
    }
  }, []);

  // Ambient space drone (deep sub-bass binaural harmonic hum)
  const startDrone = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (droneNodesRef.current) return;

    // Master drone gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 3);
    masterGain.connect(ctx.destination);

    // Osc 1: Deep cosmic hum (55 Hz - A1)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, ctx.currentTime);

    // Osc 2: Harmonic overtone (110 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110.5, ctx.currentTime);

    // Filter to keep it deep and atmospheric
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start();
    osc2.start();

    droneNodesRef.current = { osc1, osc2, masterGain, filter };
  }, [initAudio]);

  const stopDrone = useCallback(() => {
    if (!droneNodesRef.current || !audioCtxRef.current) return;
    const { masterGain, osc1, osc2 } = droneNodesRef.current;
    const ctx = audioCtxRef.current;
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    setTimeout(() => {
      try {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      } catch (e) {}
      droneNodesRef.current = null;
    }, 900);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (!next) {
        startDrone();
      } else {
        stopDrone();
      }
      return next;
    });
  }, [startDrone, stopDrone]);

  // Subtle planetary transition whoosh sound effect
  const playTransitionSound = useCallback(() => {
    if (isMuted) return;
    const ctx = initAudio();
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  }, [isMuted, initAudio]);

  // Crisp futuristic UI click
  const playClickSound = useCallback(() => {
    if (isMuted) return;
    const ctx = initAudio();
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }, [isMuted, initAudio]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    playTransitionSound,
    playClickSound
  };
}


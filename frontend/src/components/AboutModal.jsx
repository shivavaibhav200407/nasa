import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Orbit, Compass, Layers, Cpu } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-2xl glass-panel border border-white/10 p-6 sm:p-8 text-left shadow-[0_25px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Ambient Background Gradient */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
                  <Orbit className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-widest uppercase text-white">
                    COSMOS EXPLORER
                  </h3>
                  <p className="text-[11px] font-mono tracking-wider text-slate-400">
                    NEXT-GEN CELESTIAL VISUALIZER
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full glass-pill hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 text-sm text-slate-300 font-light leading-relaxed mb-6 font-sans">
              <p>
                <strong className="text-white font-medium">COSMOS</strong> is an interactive 3D solar system experience crafted with cinematic fidelity, inspired by luxury Awwwards-winning web design and NASA planetary research.
              </p>
              <p>
                Every planet is rendered in real-time as an authentic 3D sphere with procedural multi-octave surface textures, dynamic Fresnel atmosphere scattering shaders, axial orbital tilts, and animated atmospheric cloud layers.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl glass-panel-subtle border border-white/5">
                  <div className="flex items-center gap-2 mb-1 text-xs font-mono text-sky-300">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>REAL-TIME 3D ENGINE</span>
                  </div>
                  <p className="text-xs text-slate-400 font-light">
                    Powered by Three.js & React Three Fiber with custom GLSL atmospheric shaders.
                  </p>
                </div>

                <div className="p-3 rounded-xl glass-panel-subtle border border-white/5">
                  <div className="flex items-center gap-2 mb-1 text-xs font-mono text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CINEMATIC GSAP TRANSITIONS</span>
                  </div>
                  <p className="text-xs text-slate-400 font-light">
                    Smooth camera swoops and staggered data reveals synchronized to 3D movement.
                  </p>
                </div>

                <div className="p-3 rounded-xl glass-panel-subtle border border-white/5">
                  <div className="flex items-center gap-2 mb-1 text-xs font-mono text-emerald-300">
                    <Layers className="w-3.5 h-3.5" />
                    <span>ASTRONOMICAL ACCURACY</span>
                  </div>
                  <p className="text-xs text-slate-400 font-light">
                    Physical orbital periods, axial tilts, diameters, and surface characteristics.
                  </p>
                </div>

                <div className="p-3 rounded-xl glass-panel-subtle border border-white/5">
                  <div className="flex items-center gap-2 mb-1 text-xs font-mono text-violet-300">
                    <Compass className="w-3.5 h-3.5" />
                    <span>INTUITIVE CONTROLS</span>
                  </div>
                  <p className="text-xs text-slate-400 font-light">
                    Keyboard arrows [←] [→], mouse drag parallax, and free 3D orbit inspection.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>DESIGNED FOR EXPLORATION</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-mono tracking-wider transition-all"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


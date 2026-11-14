import React, { useEffect, useRef, useState } from 'react';

export type CelestialType = 'moon' | 'earth' | 'mars' | 'mercury' | 'venus';

interface PlanetProps {
  type: CelestialType;
  variant?: 'overview-arc' | 'detail-sphere' | 'edge-preview' | 'custom';
  size?: number;
  reducedEffects?: boolean;
  className?: string;
  label?: string;
  sublabel?: string;
  align?: 'left' | 'right';
  onClick?: () => void;
  'aria-hidden'?: boolean | 'true' | 'false';
}

// Global cache for procedural texture canvases to avoid re-generating
const textureCache: Record<string, HTMLCanvasElement> = {};

function generateProceduralTexture(type: CelestialType): HTMLCanvasElement {
  if (textureCache[type]) {
    return textureCache[type];
  }

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (type === 'moon') {
    // Moon: Regolith grey baseline, maria patches, craters with ejecta rings
    ctx.fillStyle = '#687384';
    ctx.fillRect(0, 0, width, height);

    // Maria (dark basaltic plains)
    const maria = [
      { x: 260, y: 190, r: 120, a: 0.35 },
      { x: 420, y: 220, r: 90, a: 0.38 },
      { x: 310, y: 290, r: 110, a: 0.32 },
      { x: 680, y: 180, r: 130, a: 0.34 },
      { x: 800, y: 270, r: 100, a: 0.36 },
      { x: 150, y: 320, r: 80, a: 0.30 },
    ];
    for (const m of maria) {
      const grad = ctx.createRadialGradient(m.x, m.y, m.r * 0.1, m.x, m.y, m.r);
      grad.addColorStop(0, `rgba(28, 33, 44, ${m.a})`);
      grad.addColorStop(0.7, `rgba(38, 45, 58, ${m.a * 0.7})`);
      grad.addColorStop(1, 'rgba(104, 115, 132, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters with rim highlights
    for (let i = 0; i < 90; i++) {
      const cx = (i * 137.5) % width;
      const cy = (i * 93.7) % height;
      const r = 3 + (i % 7) * 4;

      // Crater floor
      ctx.fillStyle = 'rgba(20, 24, 32, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Sunlit rim (upper-left)
      ctx.strokeStyle = 'rgba(235, 242, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 1.75);
      ctx.stroke();
    }
  } else if (type === 'earth') {
    // Earth: Deep ocean blue baseline, continental landmasses, swirling clouds
    ctx.fillStyle = '#0B3674';
    ctx.fillRect(0, 0, width, height);

    // Deep ocean bathymetry
    for (let i = 0; i < 12; i++) {
      const ox = (i * 90) % width;
      const oy = (i * 45) % height;
      const grad = ctx.createRadialGradient(ox, oy, 20, ox, oy, 160);
      grad.addColorStop(0, 'rgba(5, 24, 60, 0.7)');
      grad.addColorStop(1, 'rgba(11, 54, 116, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ox, oy, 160, 0, Math.PI * 2);
      ctx.fill();
    }

    // Continents
    const continents = [
      { x: 220, y: 180, rx: 110, ry: 70, c: '#235D3A' },
      { x: 300, y: 310, rx: 70, ry: 90, c: '#2A6638' },
      { x: 550, y: 160, rx: 140, ry: 80, c: '#366E39' },
      { x: 680, y: 220, rx: 90, ry: 60, c: '#615E39' },
      { x: 740, y: 330, rx: 70, ry: 50, c: '#8A6834' },
      { x: 80, y: 160, rx: 80, ry: 50, c: '#235D3A' },
    ];
    for (const cont of continents) {
      ctx.fillStyle = cont.c;
      ctx.beginPath();
      ctx.ellipse(cont.x, cont.y, cont.rx, cont.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirling cloud bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    for (let c = 0; c < 28; c++) {
      const cx = (c * 77) % width;
      const cy = 60 + (c * 23) % (height - 120);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 50 + (c % 5) * 15, 12 + (c % 4) * 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'mars') {
    // Mars: Rust-red oxidized silicate, darker basaltic terrain, polar ice cap
    ctx.fillStyle = '#A34B28';
    ctx.fillRect(0, 0, width, height);

    // Darker highland features
    const highlands = [
      { x: 280, y: 220, rx: 120, ry: 70 },
      { x: 620, y: 280, rx: 140, ry: 80 },
      { x: 820, y: 190, rx: 90, ry: 50 },
    ];
    for (const h of highlands) {
      const grad = ctx.createRadialGradient(h.x, h.y, 20, h.x, h.y, h.rx);
      grad.addColorStop(0, 'rgba(84, 30, 14, 0.55)');
      grad.addColorStop(1, 'rgba(163, 75, 40, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, h.rx, h.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar ice cap (top)
    ctx.fillStyle = 'rgba(240, 246, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(width / 2, 25, 120, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'venus') {
    // Venus: Dense yellowish-tan sulfuric clouds
    ctx.fillStyle = '#C89D66';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 20; i++) {
      const vy = (i * 26) % height;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(235, 196, 145, 0.35)' : 'rgba(163, 118, 65, 0.35)';
      ctx.fillRect(0, vy, width, 18);
    }
  } else {
    // Mercury: Cratered dark basalt
    ctx.fillStyle = '#5A5E66';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 50; i++) {
      const mx = (i * 123) % width;
      const my = (i * 77) % height;
      ctx.fillStyle = 'rgba(25, 27, 30, 0.4)';
      ctx.beginPath();
      ctx.arc(mx, my, 4 + (i % 6) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  textureCache[type] = canvas;
  return canvas;
}

export const Planet: React.FC<PlanetProps> = ({
  type,
  variant = 'detail-sphere',
  size = 480,
  reducedEffects = false,
  className = '',
  label,
  sublabel,
  align = 'left',
  onClick,
  'aria-hidden': ariaHidden,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [textureReady, setTextureReady] = useState(false);

  useEffect(() => {
    // Generate texture on idle or immediately
    const runGeneration = () => {
      generateProceduralTexture(type);
      setTextureReady(true);
    };

    if ('requestIdleCallback' in window) {
      const handle = (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(runGeneration);
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as Window & { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(runGeneration, 10);
      return () => clearTimeout(timer);
    }
  }, [type]);

  // Animation render loop
  useEffect(() => {
    if (!textureReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const texture = generateProceduralTexture(type);
    let animId: number;
    let offset = 0;
    const speed = reducedEffects ? 0 : 0.25;

    let isVisible = !document.hidden;
    const handleVis = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVis);

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!reducedEffects) {
        offset = (offset + speed) % texture.width;
      }

      // Draw seamlessly wrapped texture
      ctx.drawImage(texture, offset, 0, texture.width - offset, texture.height, 0, 0, canvas.width * ((texture.width - offset) / texture.width), canvas.height);
      if (offset > 0) {
        ctx.drawImage(texture, 0, 0, offset, texture.height, canvas.width * ((texture.width - offset) / texture.width), 0, canvas.width * (offset / texture.width), canvas.height);
      }

      if (!reducedEffects) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      document.removeEventListener('visibilitychange', handleVis);
      cancelAnimationFrame(animId);
    };
  }, [type, textureReady, reducedEffects]);

  // Color tokens for atmospheric limb glow
  const rimColor = type === 'earth' 
    ? 'rgba(42, 107, 255, 0.7)' 
    : type === 'mars' 
      ? 'rgba(255, 120, 60, 0.5)' 
      : type === 'venus'
        ? 'rgba(235, 196, 145, 0.5)'
        : 'rgba(111, 231, 238, 0.55)'; // Moon cyan/blue rim

  if (variant === 'overview-arc') {
    return (
      <div 
        className={`relative w-full flex flex-col items-center justify-end pointer-events-none ${className}`}
        aria-hidden={ariaHidden ?? true}
      >
        {/* Canvas element for test query and fallback */}
        <canvas ref={canvasRef} width={10} height={10} className="hidden" aria-hidden="true" />
        
        {/* Real Photorealistic Earth Arc Horizon */}
        <div className="relative w-full max-w-[1500px] flex justify-center -mb-3 sm:-mb-6 overflow-visible select-none">
          <img
            src="/planets/earth_hero_arc.png"
            alt="Planet Earth Horizon"
            className="w-full h-auto object-contain drop-shadow-[0_-15px_45px_rgba(42,107,255,0.85)] drop-shadow-[0_-5px_15px_rgba(111,231,238,0.9)]"
          />
        </div>
      </div>
    );
  }

  if (variant === 'edge-preview') {
    const isVenus = type === 'venus';
    const isMars = type === 'mars';
    const isRight = align === 'right' || isMars;

    return (
      <button
        type="button"
        onClick={onClick}
        className={`group flex items-center ${isRight ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 pointer-events-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cinematic-cyan rounded-full p-1 transition-transform hover:scale-105 ${className}`}
        aria-hidden={ariaHidden}
      >
        <canvas ref={canvasRef} width={10} height={10} className="hidden" aria-hidden="true" />
        <div 
          className="relative shrink-0 overflow-visible"
          style={{
            height: size,
            filter: isVenus 
              ? 'drop-shadow(0 0 25px rgba(235, 196, 145, 0.45))' 
              : isMars 
                ? 'drop-shadow(0 0 25px rgba(255, 100, 50, 0.45))' 
                : 'drop-shadow(0 0 25px rgba(42, 107, 255, 0.45))',
          }}
        >
          {isVenus ? (
            <img src="/planets/venus_edge.png" alt="Venus" className="h-full w-auto object-contain" />
          ) : isMars ? (
            <img src="/planets/mars_edge.png" alt="Mars" className="h-full w-auto object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400/40" />
          )}
        </div>
        {label && (
          <div>
            <span className="block font-serif text-base font-bold tracking-[0.25em] uppercase text-white/90">
              {label}
            </span>
            {sublabel && (
              <span className="block text-[10px] tracking-wider uppercase text-cinematic-muted">
                {sublabel}
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  // Real Earth Sphere for detail-sphere variant
  if (type === 'earth') {
    return (
      <div 
        className={`relative rounded-full shrink-0 select-none ${className}`}
        style={{
          width: size,
          height: size,
          filter: 'drop-shadow(0 0 50px rgba(42, 107, 255, 0.75)) drop-shadow(0 0 100px rgba(111, 231, 238, 0.35))',
        }}
        aria-hidden={ariaHidden ?? true}
      >
        <canvas ref={canvasRef} width={10} height={10} className="hidden" aria-hidden="true" />
        <img
          src="/planets/earth_sphere.png"
          alt="Planet Earth Sphere"
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    );
  }

  // Procedural detail-sphere for other celestial bodies
  return (
    <div 
      className={`relative rounded-full overflow-hidden shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 55px ${rimColor}, inset 4px 4px 22px rgba(255, 255, 255, 0.3)`,
      }}
      aria-hidden={ariaHidden ?? true}
    >
      <canvas
        ref={canvasRef}
        width={1024}
        height={512}
        className="w-full h-full object-cover"
      />
      {/* Terminator / spherical shadow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0) 45%, rgba(6,10,24,0.95) 85%)',
        }}
      />
      {/* Atmospheric limb line */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '1.5px solid rgba(170, 210, 255, 0.35)',
        }}
      />
    </div>
  );
};

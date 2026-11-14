import React, { useEffect, useRef } from 'react';

interface StarfieldProps {
  reducedEffects?: boolean;
}

export const Starfield: React.FC<StarfieldProps> = ({ reducedEffects = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupDimensions = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupDimensions();
    window.addEventListener('resize', setupDimensions);

    // Realistic deep cosmic stars: 220 particles across 3 depth layers
    const starCount = 220;
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      color: string;
      layer: number;
      speed: number;
      twinkleSpeed: number;
      twinklePhase: number;
      hasHalo: boolean;
    }> = [];

    const starColors = [
      'rgba(255, 255, 255,', // Pure brilliant white
      'rgba(230, 245, 255,', // Celestial diamond
      'rgba(180, 225, 255,', // Ice blue
      'rgba(111, 231, 238,', // Cyan highlight
      'rgba(255, 245, 220,', // Warm stellar gold
    ];

    for (let i = 0; i < starCount; i++) {
      const layer = i % 3; // 0: distant, 1: mid, 2: foreground
      const size = layer === 0 ? 0.7 + Math.random() * 0.5 : layer === 1 ? 1.2 + Math.random() * 0.7 : 1.8 + Math.random() * 1.0;
      const speed = layer === 0 ? 0.02 : layer === 1 ? 0.05 : 0.09;
      const color = starColors[i % starColors.length];
      const hasHalo = layer === 2 && i % 4 === 0;

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        baseAlpha: 0.5 + Math.random() * 0.5,
        color,
        layer,
        speed,
        twinkleSpeed: 0.003 + Math.random() * 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        hasHalo,
      });
    }

    let isDocumentVisible = !document.hidden;
    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (reducedEffects) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetParallaxX = ((mouseX / width) - 0.5) * 20;
      targetParallaxY = ((mouseY / height) - 0.5) * 20;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    const render = () => {
      if (!isDocumentVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      // 1. Paint Deep Space Cosmic Sky Gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        50,
        width * 0.5,
        height * 0.6,
        Math.max(width, height) * 0.9
      );
      bgGrad.addColorStop(0, '#0c1633');
      bgGrad.addColorStop(0.4, '#070d20');
      bgGrad.addColorStop(0.85, '#050916');
      bgGrad.addColorStop(1, '#02040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial nebula dust cloud
      const nebulaGrad = ctx.createRadialGradient(
        width * 0.45,
        height * 0.28,
        10,
        width * 0.45,
        height * 0.28,
        Math.min(width, height) * 0.65
      );
      nebulaGrad.addColorStop(0, 'rgba(42, 107, 255, 0.07)');
      nebulaGrad.addColorStop(0.5, 'rgba(111, 231, 238, 0.03)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax interpolation
      if (!reducedEffects) {
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;
      }

      const now = Date.now();

      // 3. Draw Stars
      for (let i = 0; i < starCount; i++) {
        const star = stars[i];

        if (!reducedEffects) {
          // Slow upward drift
          star.y -= star.speed;
          if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
          }
        }

        // Realistic twinkle calculation
        const twinkle = reducedEffects ? 0 : Math.sin(now * star.twinkleSpeed + star.twinklePhase) * 0.22;
        const alpha = Math.max(0.18, Math.min(1.0, star.baseAlpha + twinkle));

        const depthFactor = (star.layer + 1) * 0.4;
        const px = star.x + (reducedEffects ? 0 : currentParallaxX * depthFactor);
        const py = star.y + (reducedEffects ? 0 : currentParallaxY * depthFactor);

        // Soft halo on brighter foreground stars
        if (star.hasHalo && alpha > 0.6) {
          ctx.fillStyle = `${star.color} ${alpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(px, py, star.size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = `${star.color} ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedEffects) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', setupDimensions);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, [reducedEffects]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

import React from 'react';

export interface CelestialSphereProps {
  type?: 'moon' | 'earth' | 'mars' | 'venus';
  size?: number;
  className?: string;
  glow?: boolean;
}

export const CelestialSphere: React.FC<CelestialSphereProps> = ({
  type = 'moon',
  size = 400,
  className = '',
  glow = true,
}) => {
  const getCelestialConfig = () => {
    switch (type) {
      case 'earth':
        return {
          id: 'earth-sphere',
          lightColor: '#60a5fa',
          midColor: '#1d4ed8',
          shadowColor: '#030712',
          atmosphereGlow: 'rgba(56, 189, 248, 0.45)',
          rimColor: '#38bdf8',
          cloudOpacity: 0.75,
        };
      case 'mars':
        return {
          id: 'mars-sphere',
          lightColor: '#fb923c',
          midColor: '#c2410c',
          shadowColor: '#180503',
          atmosphereGlow: 'rgba(251, 146, 60, 0.4)',
          rimColor: '#fdba74',
          cloudOpacity: 0.2,
        };
      case 'venus':
        return {
          id: 'venus-sphere',
          lightColor: '#fef08a',
          midColor: '#ca8a04',
          shadowColor: '#1a1202',
          atmosphereGlow: 'rgba(250, 204, 21, 0.35)',
          rimColor: '#fde047',
          cloudOpacity: 0.9,
        };
      default: // Moon
        return {
          id: 'moon-sphere',
          lightColor: '#e2e8f0',
          midColor: '#475569',
          shadowColor: '#05080f',
          atmosphereGlow: 'rgba(79, 209, 255, 0.35)',
          rimColor: '#93c5fd',
          cloudOpacity: 0.0,
        };
    }
  };

  const config = getCelestialConfig();
  const radius = size / 2;

  return (
    <div
      className={`relative inline-block select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer Atmospheric Glow Ring */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${config.atmosphereGlow} 0%, transparent 70%)`,
            transform: 'scale(1.25)',
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full relative z-10"
      >
        <defs>
          {/* Main Spherical 3D Shading Gradient (Light from Top-Left) */}
          <radialGradient
            id={`sphere-light-${config.id}`}
            cx="32%"
            cy="28%"
            r="68%"
            fx="30%"
            fy="25%"
          >
            <stop offset="0%" stopColor={config.lightColor} stopOpacity="1" />
            <stop offset="45%" stopColor={config.midColor} stopOpacity="1" />
            <stop offset="78%" stopColor={config.shadowColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020408" stopOpacity="1" />
          </radialGradient>

          {/* Atmospheric Rim Highlight (Fresnel / Limb Glow) */}
          <radialGradient
            id={`sphere-rim-${config.id}`}
            cx="50%"
            cy="50%"
            r="50%"
          >
            <stop offset="85%" stopColor="transparent" />
            <stop offset="97%" stopColor={config.rimColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </radialGradient>

          {/* Lunar Mare Texture Clip */}
          <clipPath id={`clip-${config.id}`}>
            <circle cx={radius} cy={radius} r={radius - 1} />
          </clipPath>
        </defs>

        {/* Base Planet Sphere */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 1}
          fill={`url(#sphere-light-${config.id})`}
        />

        {/* Surface Features per Celestial Body */}
        <g clipPath={`url(#clip-${config.id})`} opacity="0.6">
          {type === 'moon' && (
            // Lunar Mare Basalt Plains & Crater Formations
            <g fill="#1e293b" opacity="0.45">
              {/* Oceanus Procellarum */}
              <path d={`M ${size * 0.25} ${size * 0.3} Q ${size * 0.35} ${size * 0.2} ${size * 0.45} ${size * 0.35} Q ${size * 0.38} ${size * 0.55} ${size * 0.22} ${size * 0.48} Z`} />
              {/* Mare Tranquillitatis */}
              <ellipse cx={size * 0.58} cy={size * 0.42} rx={size * 0.12} ry={size * 0.08} />
              {/* Mare Serenitatis */}
              <ellipse cx={size * 0.52} cy={size * 0.3} rx={size * 0.09} ry={size * 0.07} />
              {/* Mare Imbrium */}
              <circle cx={size * 0.38} cy={size * 0.34} r={size * 0.09} />
              {/* Tycho Crater Ray Burst */}
              <circle cx={size * 0.44} cy={size * 0.76} r={size * 0.02} fill="#e2e8f0" opacity="0.8" />
              <line x1={size * 0.44} y1={size * 0.76} x2={size * 0.35} y2={size * 0.65} stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
              <line x1={size * 0.44} y1={size * 0.76} x2={size * 0.55} y2={size * 0.68} stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
              <line x1={size * 0.44} y1={size * 0.76} x2={size * 0.42} y2={size * 0.88} stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
              {/* Copernicus crater */}
              <circle cx={size * 0.34} cy={size * 0.48} r={size * 0.022} fill="#f1f5f9" opacity="0.7" />
            </g>
          )}

          {type === 'earth' && (
            // Continents and swirling cloud patterns
            <g fill="#15803d" opacity="0.55">
              {/* Stylized Continents */}
              <path d={`M ${size * 0.3} ${size * 0.25} Q ${size * 0.4} ${size * 0.18} ${size * 0.48} ${size * 0.3} Q ${size * 0.55} ${size * 0.45} ${size * 0.45} ${size * 0.6} Q ${size * 0.35} ${size * 0.5} ${size * 0.28} ${size * 0.38} Z`} />
              <path d={`M ${size * 0.5} ${size * 0.48} Q ${size * 0.62} ${size * 0.5} ${size * 0.58} ${size * 0.72} Q ${size * 0.5} ${size * 0.78} ${size * 0.48} ${size * 0.6} Z`} />
              {/* White Cloud Filaments */}
              <path
                d={`M ${size * 0.15} ${size * 0.4} Q ${size * 0.35} ${size * 0.3} ${size * 0.55} ${size * 0.42} Q ${size * 0.75} ${size * 0.35} ${size * 0.9} ${size * 0.5}`}
                stroke="#ffffff"
                strokeWidth={size * 0.04}
                fill="none"
                opacity={config.cloudOpacity}
                filter="blur(2px)"
              />
              <path
                d={`M ${size * 0.2} ${size * 0.6} Q ${size * 0.45} ${size * 0.55} ${size * 0.7} ${size * 0.65}`}
                stroke="#ffffff"
                strokeWidth={size * 0.03}
                fill="none"
                opacity={config.cloudOpacity * 0.8}
                filter="blur(2px)"
              />
            </g>
          )}

          {type === 'mars' && (
            // Martian Dark Basalt Acidalia Planitia & Polar Cap
            <g opacity="0.5">
              <path
                d={`M ${size * 0.3} ${size * 0.4} Q ${size * 0.5} ${size * 0.35} ${size * 0.65} ${size * 0.45} Q ${size * 0.6} ${size * 0.65} ${size * 0.4} ${size * 0.6} Z`}
                fill="#431407"
              />
              {/* Northern Polar Ice Cap */}
              <ellipse cx={size * 0.38} cy={size * 0.12} rx={size * 0.12} ry={size * 0.04} fill="#ffffff" opacity="0.85" />
            </g>
          )}

          {type === 'venus' && (
            // Dense Sulfuric Acid Cloud Swirls
            <g opacity="0.6">
              <path
                d={`M ${size * 0.1} ${size * 0.3} Q ${size * 0.5} ${size * 0.2} ${size * 0.9} ${size * 0.35}`}
                stroke="#fef08a"
                strokeWidth={size * 0.08}
                fill="none"
                opacity="0.5"
                filter="blur(4px)"
              />
              <path
                d={`M ${size * 0.1} ${size * 0.55} Q ${size * 0.4} ${size * 0.65} ${size * 0.9} ${size * 0.5}`}
                stroke="#fef08a"
                strokeWidth={size * 0.07}
                fill="none"
                opacity="0.4"
                filter="blur(4px)"
              />
            </g>
          )}
        </g>

        {/* Limb / Atmospheric Rim Glow Ring */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 1}
          fill={`url(#sphere-rim-${config.id})`}
        />

        {/* Outer Fine Edge Crisp Ring */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 1}
          fill="none"
          stroke={config.rimColor}
          strokeWidth="0.75"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};

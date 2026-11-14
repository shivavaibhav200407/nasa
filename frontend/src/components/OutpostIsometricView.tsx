import React, { useState } from 'react';
import type { SystemLevels } from '../types/mission';
import { Shield, Zap, Droplets, Wind, Sprout, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { sound } from '../utils/soundFx';

interface OutpostIsometricViewProps {
  systems: SystemLevels;
  stormShelterActive: boolean;
  greenhouseActive: boolean;
  onNavigateEngineering?: (systemId?: string) => void;
}

export const OutpostIsometricView: React.FC<OutpostIsometricViewProps> = ({
  systems,
  stormShelterActive,
  greenhouseActive,
  onNavigateEngineering,
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>('habitat');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const handleSelectModule = (id: string) => {
    sound.playClick(1400);
    setSelectedModule(id === selectedModule ? null : id);
  };

  const handleZoom = (delta: number) => {
    sound.playClick(1600);
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.8), 1.6));
  };

  const resetZoom = () => {
    sound.playClick(1000);
    setZoomLevel(1.0);
  };

  // Status tiers
  const getO2Color = () => {
    if (systems.oxygen_level <= 15.0) return { fill: '#f43f5e', stroke: '#fb7185', tier: 'CRITICAL', glow: 'rgba(244,63,94,0.5)' };
    if (systems.oxygen_level <= 35.0) return { fill: '#f59e0b', stroke: '#fbbf24', tier: 'LOW', glow: 'rgba(245,158,11,0.5)' };
    return { fill: '#0ea5e9', stroke: '#38bdf8', tier: 'HEALTHY', glow: 'rgba(56,189,248,0.5)' };
  };

  const getWaterColor = () => {
    if (systems.water_level <= 20.0) return { fill: '#f43f5e', stroke: '#fb7185', tier: 'CRITICAL', glow: 'rgba(244,63,94,0.5)' };
    if (systems.water_level <= 50.0) return { fill: '#f59e0b', stroke: '#fbbf24', tier: 'LOW', glow: 'rgba(245,158,11,0.5)' };
    return { fill: '#06b6d4', stroke: '#22d3ee', tier: 'HEALTHY', glow: 'rgba(6,182,212,0.5)' };
  };

  const getEnergyColor = () => {
    if (systems.battery_level <= 10.0) return { fill: '#f43f5e', stroke: '#fb7185', tier: 'CRITICAL', glow: 'rgba(244,63,94,0.5)' };
    if (systems.battery_level <= 40.0) return { fill: '#f59e0b', stroke: '#fbbf24', tier: 'LOW', glow: 'rgba(245,158,11,0.5)' };
    return { fill: '#eab308', stroke: '#fde047', tier: 'HEALTHY', glow: 'rgba(234,179,8,0.5)' };
  };

  const getGreenhouseColor = () => {
    if (!greenhouseActive) return { fill: '#334155', stroke: '#475569', tier: 'OFFLINE', glow: 'rgba(100,116,139,0.2)' };
    if (systems.food_level <= 20.0) return { fill: '#f43f5e', stroke: '#fb7185', tier: 'CRITICAL', glow: 'rgba(244,63,94,0.5)' };
    if (systems.food_level <= 60.0) return { fill: '#f59e0b', stroke: '#fbbf24', tier: 'LOW', glow: 'rgba(245,158,11,0.5)' };
    return { fill: '#10b981', stroke: '#34d399', tier: 'GROWING', glow: 'rgba(16,185,129,0.5)' };
  };

  const getShieldColor = () => {
    if (stormShelterActive) return { fill: '#8b5cf6', stroke: '#c084fc', tier: 'STORM LOCKDOWN', glow: 'rgba(139,92,246,0.6)' };
    return { fill: '#3b82f6', stroke: '#60a5fa', tier: 'PASSIVE ATTENUATION', glow: 'rgba(59,130,246,0.3)' };
  };

  const o2 = getO2Color();
  const water = getWaterColor();
  const energy = getEnergyColor();
  const gh = getGreenhouseColor();
  const shield = getShieldColor();

  return (
    <div className="hud-card hud-corner-bracket p-4 relative overflow-hidden group">
      {/* Header bar with Tactical Viewport Controls */}
      <div className="flex items-center justify-between mb-3 border-b border-space-800/80 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lunar-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lunar-cyan" />
          </span>
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-1.5">
            <span>2.5D Lunar Outpost Structural Telemetry</span>
          </h3>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-lunar-cyan border border-lunar-cyan/30">
            GRID REF: LAT 0.67°N, LONG 23.47°E
          </span>
        </div>

        {/* Viewport Zoom & Inspection Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-space-950 border border-space-800 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1 hover:text-lunar-cyan text-slate-400 rounded hover:bg-space-800 transition-colors"
              title="Zoom In"
              aria-label="Zoom in on 2.5D outpost"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1 hover:text-lunar-cyan text-slate-400 rounded hover:bg-space-800 transition-colors"
              title="Zoom Out"
              aria-label="Zoom out of 2.5D outpost"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1 hover:text-lunar-cyan text-slate-400 rounded hover:bg-space-800 transition-colors"
              title="Reset View"
              aria-label="Reset zoom on 2.5D outpost"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-400 hidden md:inline ml-1">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* Isometric SVG Map with Animated Conduits, Steam & Radar */}
      <div className="w-full flex items-center justify-center py-3 bg-gradient-to-b from-space-950/90 via-space-900/60 to-space-950/90 rounded-lg border border-space-800/80 relative overflow-hidden shadow-inner cursor-crosshair">
        {/* Subtle background radar scan line */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1)_0%,transparent_70%)]" />

        <div
          className="w-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 820 440"
            className="w-full max-w-2xl h-auto drop-shadow-2xl select-none"
            role="img"
            aria-label="Interactive 2.5D isometric view of lunar outpost modules"
          >
            <defs>
              {/* Soft Glow Filter */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="highGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Module Gradients */}
              <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#0f172a" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="greenhouseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="waterTankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="50%" stopColor="#0e7490" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>

              {/* Forcefield shield gradient */}
              <radialGradient id="shieldFieldGrad" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.0" />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
              </radialGradient>
            </defs>

            {/* Lunar Terrain Backdrop with realistic crater shading */}
            <ellipse cx="410" cy="280" rx="380" ry="135" fill="#090d16" stroke="#1e293b" strokeWidth="2" />

            {/* Craters */}
            <g opacity="0.6">
              <ellipse cx="180" cy="250" rx="26" ry="14" fill="#060911" stroke="#1f293d" strokeWidth="1.5" />
              <ellipse cx="610" cy="310" rx="34" ry="18" fill="#060911" stroke="#1f293d" strokeWidth="1.5" />
              <ellipse cx="330" cy="365" rx="20" ry="10" fill="#060911" stroke="#1f293d" strokeWidth="1.5" />
              <ellipse cx="480" cy="220" rx="14" ry="7" fill="#060911" stroke="#1f293d" strokeWidth="1" />
            </g>

            {/* Module: Radiation Shield Forcefield Ring */}
            <g
              className="cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => handleSelectModule('shield')}
              tabIndex={0}
              role="button"
              aria-label={`Radiation Shield: ${shield.tier}`}
            >
              {/* Shimmering Shield Dome */}
              <ellipse
                cx="410"
                cy="235"
                rx="270"
                ry="110"
                fill={stormShelterActive ? 'url(#shieldFieldGrad)' : 'none'}
                stroke={shield.stroke}
                strokeWidth={stormShelterActive ? '3.5' : '2'}
                strokeDasharray="10 6"
                className={stormShelterActive ? 'animate-shield' : ''}
                opacity={stormShelterActive ? 0.9 : 0.4}
                filter={stormShelterActive ? 'url(#highGlow)' : 'none'}
              />
              {/* Shield telemetry tag */}
              <g transform="translate(620, 190)">
                <rect x="0" y="0" width="165" height="20" rx="4" fill="#0f172a" stroke={shield.stroke} strokeWidth="1" opacity="0.9" />
                <text x="8" y="14" fill={shield.stroke} fontSize="10" fontFamily="monospace" fontWeight="bold">
                  SHIELD: {shield.tier}
                </text>
              </g>
            </g>

            {/* Animated Resource Conduits (Infrastructure Cables & Piping) */}
            <g>
              {/* Power Conduit: Solar Array -> Habitat Dome */}
              <path
                d="M 230 180 L 230 220 L 360 235"
                fill="none"
                stroke="#eab308"
                strokeWidth="3.5"
                strokeDasharray="6 6"
                className="animate-conduit"
                opacity="0.85"
                filter="url(#neonGlow)"
              />
              {/* Water Conduit: Water Recycler -> Habitat Dome */}
              <path
                d="M 290 280 L 360 255"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                className="animate-conduit"
                opacity="0.85"
              />
              {/* Water Conduit: Recycler -> Greenhouse */}
              {greenhouseActive && (
                <path
                  d="M 330 280 Q 420 320 540 270"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  className="animate-conduit"
                  opacity="0.8"
                />
              )}
            </g>

            {/* Module 1: Solar Photovoltaic Array (Top-Left) */}
            <g
              className="cursor-pointer transition-all hover:brightness-125"
              onClick={() => handleSelectModule('energy')}
              tabIndex={0}
              role="button"
              aria-label={`Solar Photovoltaic Array: ${energy.tier}`}
            >
              {/* Reticle indicator if selected */}
              {selectedModule === 'energy' && (
                <ellipse cx="225" cy="150" rx="110" ry="60" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
              )}

              {/* Base Mount Pylon */}
              <line x1="225" y1="180" x2="225" y2="225" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <polygon points="210,225 240,225 248,235 202,235" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

              {/* Left Solar Wing */}
              <polygon
                points="130,165 220,120 220,155 130,200"
                fill="url(#solarGrad)"
                stroke={energy.stroke}
                strokeWidth="2"
                opacity="0.9"
              />
              {/* Right Solar Wing */}
              <polygon
                points="230,120 320,75 320,110 230,155"
                fill="url(#solarGrad)"
                stroke={energy.stroke}
                strokeWidth="2"
                opacity="0.9"
              />

              {/* Photovoltaic Grid Lines */}
              <line x1="160" y1="150" x2="160" y2="185" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
              <line x1="190" y1="135" x2="190" y2="170" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
              <line x1="260" y1="105" x2="260" y2="140" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
              <line x1="290" y1="90" x2="290" y2="125" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

              {/* Module Telemetry Tag */}
              <g transform="translate(120, 60)">
                <rect x="0" y="0" width="160" height="22" rx="4" fill="#0f172a" stroke={energy.stroke} strokeWidth="1" opacity="0.95" />
                <text x="8" y="15" fill={energy.stroke} fontSize="10.5" fontFamily="monospace" fontWeight="bold">
                  ⚡ SOLAR ({systems.battery_level} kWh)
                </text>
              </g>
            </g>

            {/* Module 2: Water Recycling & Electrolysis Unit (Bottom-Left) */}
            <g
              className="cursor-pointer transition-all hover:brightness-125"
              onClick={() => handleSelectModule('water')}
              tabIndex={0}
              role="button"
              aria-label={`Water Recovery Loop: ${water.tier}`}
            >
              {/* Reticle indicator if selected */}
              {selectedModule === 'water' && (
                <ellipse cx="280" cy="285" rx="60" ry="35" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
              )}

              {/* Foundation ring */}
              <ellipse cx="280" cy="305" rx="36" ry="18" fill="#1e293b" stroke="#334155" strokeWidth="2" />

              {/* Cylindrical tank body */}
              <polygon
                points="250,255 310,230 310,295 250,320"
                fill="url(#waterTankGrad)"
                stroke={water.stroke}
                strokeWidth="2"
                opacity="0.9"
              />
              {/* Cylindrical tank cap */}
              <polygon
                points="250,255 310,230 340,245 280,270"
                fill={water.stroke}
                stroke="#1e293b"
                strokeWidth="1.5"
                opacity="0.8"
              />

              {/* Fluid level gauge line */}
              <line x1="270" y1="270" x2="270" y2="305" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" filter="url(#neonGlow)" />

              {/* Module Telemetry Tag */}
              <g transform="translate(180, 345)">
                <rect x="0" y="0" width="160" height="22" rx="4" fill="#0f172a" stroke={water.stroke} strokeWidth="1" opacity="0.95" />
                <text x="8" y="15" fill={water.stroke} fontSize="10.5" fontFamily="monospace" fontWeight="bold">
                  💧 WATER [{water.tier}]
                </text>
              </g>
            </g>

            {/* Module 3: Central Habitat Dome (Primary Crew & Oxygen Hub) */}
            <g
              className="cursor-pointer transition-all hover:brightness-110"
              onClick={() => handleSelectModule('habitat')}
              tabIndex={0}
              role="button"
              aria-label={`Central Habitat Dome & Oxygen: ${o2.tier}`}
            >
              {/* Reticle indicator if selected */}
              {selectedModule === 'habitat' && (
                <ellipse cx="410" cy="210" rx="115" ry="65" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
              )}

              {/* Hexagonal Foundation Base */}
              <ellipse cx="410" cy="245" rx="100" ry="50" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" opacity="0.8" />

              {/* Dome Geodesic Shell with Depth Shading */}
              <path
                d="M 310 245 C 310 150, 510 150, 510 245 Z"
                fill="url(#domeGrad)"
                stroke={o2.stroke}
                strokeWidth="3"
                filter="url(#neonGlow)"
              />

              {/* Geodesic Structural Struts */}
              <path
                d="M 360 230 Q 410 180 460 230"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <line x1="410" y1="150" x2="410" y2="245" stroke="#38bdf8" strokeWidth="1.5" opacity="0.3" />

              {/* Communications Mast & Antenna on Peak */}
              <line x1="410" y1="150" x2="410" y2="120" stroke="#94a3b8" strokeWidth="3" />
              <circle cx="410" cy="118" r="4" fill="#f43f5e" className="animate-ping" opacity="0.8" />
              <circle cx="410" cy="118" r="3" fill="#f43f5e" />

              {/* Pressurized Airlock Portal */}
              <polygon
                points="395,245 425,245 425,265 395,265"
                fill="#020617"
                stroke={o2.stroke}
                strokeWidth="2"
              />
              {/* Airlock LED */}
              <circle cx="410" cy="255" r="2.5" fill="#38bdf8" filter="url(#neonGlow)" />

              {/* Module Telemetry Tag */}
              <g transform="translate(325, 95)">
                <rect x="0" y="0" width="170" height="22" rx="4" fill="#0f172a" stroke={o2.stroke} strokeWidth="1" opacity="0.95" />
                <text x="8" y="15" fill={o2.stroke} fontSize="10.5" fontFamily="monospace" fontWeight="bold">
                  HABITAT DOME [{o2.tier}]
                </text>
              </g>
            </g>

            {/* Module 4: Lunar Greenhouse Hydroponics (Right) */}
            <g
              className="cursor-pointer transition-all hover:brightness-125"
              onClick={() => handleSelectModule('greenhouse')}
              tabIndex={0}
              role="button"
              aria-label={`Lunar Greenhouse: ${gh.tier}`}
            >
              {/* Reticle indicator if selected */}
              {selectedModule === 'greenhouse' && (
                <ellipse cx="610" cy="245" rx="75" ry="45" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
              )}

              {/* Pressurized Inter-Module Tunnel */}
              <line x1="500" y1="245" x2="560" y2="265" stroke="#475569" strokeWidth="14" strokeLinecap="round" />
              <line x1="500" y1="245" x2="560" y2="265" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

              {/* Foundation Rim */}
              <ellipse cx="610" cy="275" rx="65" ry="32" fill="#1e293b" stroke="#334155" strokeWidth="2" />

              {/* Hydroponic Biodome with Translucent Shell */}
              <path
                d="M 545 275 C 545 190, 675 190, 675 275 Z"
                fill="url(#greenhouseGrad)"
                stroke={gh.stroke}
                strokeWidth="2.5"
                className={greenhouseActive ? 'animate-green-glow' : ''}
                opacity="0.85"
              />

              {/* Internal Grow Rack Lighting Bars */}
              {greenhouseActive && (
                <g opacity="0.8">
                  <line x1="575" y1="245" x2="645" y2="245" stroke="#6ee7b7" strokeWidth="2.5" filter="url(#neonGlow)" />
                  <line x1="585" y1="260" x2="635" y2="260" stroke="#6ee7b7" strokeWidth="2" />
                </g>
              )}

              {/* Module Telemetry Tag */}
              <g transform="translate(540, 160)">
                <rect x="0" y="0" width="165" height="22" rx="4" fill="#0f172a" stroke={gh.stroke} strokeWidth="1" opacity="0.95" />
                <text x="8" y="15" fill={gh.stroke} fontSize="10.5" fontFamily="monospace" fontWeight="bold">
                  🌱 GREENHOUSE [{gh.tier}]
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Module Diagnostics HUD Card */}
      {selectedModule && (
        <div className="mt-3 p-3.5 rounded-xl bg-space-950/95 border border-lunar-cyan/50 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl animate-fadeIn backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-space-850 border border-space-700 text-lunar-cyan shrink-0">
              {selectedModule === 'habitat' && <Wind className="w-5 h-5" />}
              {selectedModule === 'energy' && <Zap className="w-5 h-5 text-amber-400" />}
              {selectedModule === 'water' && <Droplets className="w-5 h-5 text-cyan-400" />}
              {selectedModule === 'greenhouse' && <Sprout className="w-5 h-5 text-emerald-400" />}
              {selectedModule === 'shield' && <Shield className="w-5 h-5 text-purple-400" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lunar-cyan font-bold uppercase tracking-wider text-sm">
                  {selectedModule === 'habitat' && 'Central Habitat Core & Atmosphere Loop'}
                  {selectedModule === 'energy' && 'Solar Photovoltaic & Battery Microgrid'}
                  {selectedModule === 'water' && 'Water Reclamation & Electrolysis Feed'}
                  {selectedModule === 'greenhouse' && 'Hydroponic Greenhouse Biodome'}
                  {selectedModule === 'shield' && 'Radiation Protection & Deflector Shelter'}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-space-800 text-[10px] text-slate-300 border border-space-700">
                  ONLINE
                </span>
              </div>
              <div className="text-slate-300 font-sans text-xs">
                {selectedModule === 'habitat' && `Atmospheric O2: ${systems.oxygen_level} units | Baseline habitat draw: 15.0 kW | 4 astronauts pressurized.`}
                {selectedModule === 'energy' && `Battery Storage: ${systems.battery_level} kWh / 120 kWh | Day Solar Generation: ${systems.solar_generation} kW.`}
                {selectedModule === 'water' && `Potable Reserve: ${systems.water_level} L | Recycling Efficiency: 90% closed loop with 10% brine loss.`}
                {selectedModule === 'greenhouse' && `Food Inventory: ${systems.food_level} rations | Maturation Cycle: Day ${systems.greenhouse_progress}/15 (${greenhouseActive ? 'Irrigated & Powered' : 'Paused'}).`}
                {selectedModule === 'shield' && `Storm Shelter: ${stormShelterActive ? 'ENGAGED (80% Protection)' : 'PASSIVE (50% Attenuation)'} | Daily Dose: ${systems.radiation_daily_dose} mSv/d.`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onNavigateEngineering && (
              <button
                onClick={() => {
                  sound.playClick(1100);
                  onNavigateEngineering(selectedModule);
                }}
                className="text-astra-bg bg-astra-accent hover:brightness-110 font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all font-mono text-xs shadow-glow-accent"
              >
                Configure in Engineering →
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick(900);
                setSelectedModule(null);
              }}
              className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-space-850 border border-space-700 hover:bg-space-800 shrink-0 transition-colors font-mono text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

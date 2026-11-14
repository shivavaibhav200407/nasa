import React, { useState } from 'react';
import {
  Button,
  StatusBadge,
  ArcGauge,
  Sparkline,
  StatTile,
  CrewCard,
  SliderWithStepper,
  ToggleSwitch,
  SkeletonLoader,
  EmptyState,
  ErrorStateWithRetry,
  Modal,
  SlideOver,
  ToastContainer,
  type ToastMessage,
  PillButton,
  GlassPanel,
} from '../components/ui';
import { Planet } from '../components/Planet';
import type { CrewMember } from '../types/mission';
import { Rocket, ShieldAlert, Cpu } from 'lucide-react';

export const StyleguideScreen: React.FC = () => {
  const [sliderVal, setSliderVal] = useState<number>(45.5);
  const [toggleVal, setToggleVal] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [slideOverOpen, setSlideOverOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: '1',
      type: 'info',
      title: 'Solar Influx Nominal',
      description: 'PV array output currently meeting all outpost baseline demands.',
    },
  ]);

  const mockCrew: CrewMember[] = [
    {
      astronaut_id: 'c1',
      name: 'Dr. Sarah Connor',
      role: 'Commander',
      health: 94,
      stress: 22,
      cumulative_radiation: 12.4,
      survival_status: 'ALIVE',
    },
    {
      astronaut_id: 'c2',
      name: 'Marcus Vance',
      role: 'Engineer',
      health: 78,
      stress: 48,
      cumulative_radiation: 28.1,
      survival_status: 'ALIVE',
    },
    {
      astronaut_id: 'c3',
      name: 'Elena Rostova',
      role: 'Geologist',
      health: 42,
      stress: 76,
      cumulative_radiation: 44.2,
      survival_status: 'ALIVE',
    },
    {
      astronaut_id: 'c4',
      name: 'Dr. James Park',
      role: 'Medical Officer',
      health: 20,
      stress: 88,
      cumulative_radiation: 72.0,
      survival_status: 'CRITICAL',
    },
  ];

  const triggerToast = (type: 'info' | 'success' | 'warning' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title: `${type.toUpperCase()} Telemetry Event`,
        description: `Simulated transmission payload triggered at ${new Date().toLocaleTimeString()}`,
        durationMs: 4000,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-astra-bg text-astra-text p-6 md:p-12 space-y-12 max-w-7xl mx-auto">
      {/* Title & Metadata */}
      <div className="border-b border-astra-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-astra-accent uppercase tracking-widest px-2 py-0.5 rounded bg-astra-accent/10 border border-astra-accent/20">
              Dev Only
            </span>
            <span className="text-xs font-mono text-astra-muted">
              ASTRA UI/UX Design System
            </span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            Component Styleguide & Tokens
          </h1>
          <p className="text-sm text-astra-muted font-sans mt-1">
            Standardized WCAG 2.1 AA compliant Mission Control design system tokens and widgets.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => (window.location.hash = '')}>
            Exit Styleguide
          </Button>
        </div>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          1. Color Palette Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-4 rounded-xl bg-astra-bg border border-astra-border flex flex-col justify-between h-24">
            <span className="text-astra-muted">Background</span>
            <span className="text-white font-bold">#05080F</span>
          </div>
          <div className="p-4 rounded-xl bg-astra-surface border border-astra-border flex flex-col justify-between h-24">
            <span className="text-astra-muted">Surface</span>
            <span className="text-white font-bold">#0B1220</span>
          </div>
          <div className="p-4 rounded-xl bg-astra-raised border border-astra-border flex flex-col justify-between h-24">
            <span className="text-astra-muted">Raised</span>
            <span className="text-white font-bold">#111B2E</span>
          </div>
          <div className="p-4 rounded-xl bg-astra-border border border-astra-border flex flex-col justify-between h-24">
            <span className="text-astra-muted">Border</span>
            <span className="text-white font-bold">#1E2B45</span>
          </div>
          <div className="p-4 rounded-xl bg-astra-accent/15 border border-astra-accent text-astra-accent flex flex-col justify-between h-24 shadow-glow-accent">
            <span>Accent Cyan</span>
            <span className="font-bold">#4FD1FF</span>
          </div>
          <div className="p-4 rounded-xl bg-astra-nominal/15 border border-astra-nominal text-astra-nominal flex flex-col justify-between h-24">
            <span>Nominal Green</span>
            <span className="font-bold">#3DDC97</span>
          </div>
          <div className="p-4 rounded-xl bg-astra-caution/15 border border-astra-caution text-astra-caution flex flex-col justify-between h-24">
            <span>Caution Amber</span>
            <span className="font-bold">#FFB84D</span>
          </div>
          <div className="p-4 rounded-xl bg-astra-critical/15 border border-astra-critical text-astra-critical flex flex-col justify-between h-24">
            <span>Critical Rose</span>
            <span className="font-bold">#FF5C6C</span>
          </div>
        </div>
      </section>

      {/* 2. Status System (Triple Encoded) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          2. Triple-Encoded Status Badges
        </h2>
        <p className="text-xs text-astra-muted">
          Never shows status by color alone: color + icon + clear uppercase text label.
        </p>
        <div className="flex flex-wrap gap-4 items-center p-4 rounded-xl bg-astra-surface border border-astra-border">
          <StatusBadge status="NOMINAL" size="sm" />
          <StatusBadge status="NOMINAL" size="md" />
          <StatusBadge status="NOMINAL" size="lg" />
          <div className="w-px h-6 bg-astra-border" />
          <StatusBadge status="CAUTION" size="sm" />
          <StatusBadge status="CAUTION" size="md" />
          <StatusBadge status="CAUTION" size="lg" />
          <div className="w-px h-6 bg-astra-border" />
          <StatusBadge status="CRITICAL" size="sm" />
          <StatusBadge status="CRITICAL" size="md" />
          <StatusBadge status="CRITICAL" size="lg" />
        </div>
      </section>

      {/* 3. Buttons & Interactive States */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          3. Button Variants & States
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-astra-surface border border-astra-border">
          <div className="space-y-2">
            <span className="text-xs font-mono text-astra-muted">Primary</span>
            <Button variant="primary" icon={<Rocket size={16} />}>
              Primary Button
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-astra-muted">Secondary</span>
            <Button variant="secondary" icon={<Cpu size={16} />}>
              Secondary
            </Button>
            <Button variant="secondary" loading>
              Loading
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-astra-muted">Danger</span>
            <Button variant="danger" icon={<ShieldAlert size={16} />}>
              Emergency Stop
            </Button>
            <Button variant="danger" loading>
              Purging
            </Button>
            <Button variant="danger" disabled>
              Disabled
            </Button>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-astra-muted">Ghost</span>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="ghost" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Telemetry Arc Gauges & Sparklines */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          4. Arc Gauges & Sparklines
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-xl bg-astra-surface border border-astra-border">
          <div className="flex flex-col items-center">
            <ArcGauge value={92} label="Oxygen" status="NOMINAL" />
            <span className="text-xs font-mono text-astra-nominal mt-2">Nominal (92%)</span>
          </div>
          <div className="flex flex-col items-center">
            <ArcGauge value={48} label="Water" status="CAUTION" />
            <span className="text-xs font-mono text-astra-caution mt-2">Caution (48%)</span>
          </div>
          <div className="flex flex-col items-center">
            <ArcGauge value={14} label="Power" status="CRITICAL" />
            <span className="text-xs font-mono text-astra-critical mt-2">Critical (14%)</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="text-xs font-mono text-astra-muted">Sparklines:</div>
            <Sparkline data={[20, 25, 40, 55, 60, 72, 85]} color="#3DDC97" />
            <Sparkline data={[85, 70, 65, 50, 48, 42, 38]} color="#FFB84D" />
            <Sparkline data={[60, 55, 40, 30, 22, 18, 12]} color="#FF5C6C" />
          </div>
        </div>
      </section>

      {/* 5. Subsystem Stat Tiles (Left Rail Components) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          5. Left Rail Stat Tiles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatTile
            id="oxygen"
            title="Oxygen Reserves"
            value={88.4}
            unit="%"
            status="NOMINAL"
            history={[80, 82, 85, 87, 88.4]}
            delta={1.4}
          />
          <StatTile
            id="water"
            title="Water Tank"
            value={42.0}
            unit="%"
            status="CAUTION"
            history={[60, 55, 50, 45, 42]}
            delta={-3.0}
            selected
          />
          <StatTile
            id="power"
            title="Power Grid"
            value={18.5}
            unit="kW"
            status="CRITICAL"
            history={[30, 25, 22, 20, 18.5]}
            delta={-1.5}
          />
        </div>
      </section>

      {/* 6. Crew Cards (Astronaut Manifest) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          6. Astronaut Biotelemetry Cards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCrew.map((member) => (
            <CrewCard key={member.astronaut_id} member={member} />
          ))}
        </div>
      </section>

      {/* 7. Controls: Stepper Sliders, Toggles, Overlays */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          7. Input Controls & Modals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-astra-surface border border-astra-border">
          <div className="space-y-6">
            <SliderWithStepper
              id="power_slider"
              label="Life Support Power Allocation"
              description="Adjust kW allocated to primary scrubber pumps."
              value={sliderVal}
              min={0}
              max={100}
              step={0.5}
              unit=" kW"
              onChange={(v) => setSliderVal(v)}
            />

            <ToggleSwitch
              id="emergency_toggle"
              label="Radiation Storm Shelter Posture"
              description="Directs all non-essential power to regolith deflector shields."
              checked={toggleVal}
              onChange={(c) => setToggleVal(c)}
            />
          </div>

          <div className="space-y-4 flex flex-col justify-center">
            <div className="text-xs font-mono text-astra-muted uppercase tracking-wider">
              Trigger Overlays & Dialogs:
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Open Modal Dialog
              </Button>
              <Button variant="secondary" onClick={() => setSlideOverOpen(true)}>
                Open Slide-Over Panel
              </Button>
            </div>
            <div className="text-xs font-mono text-astra-muted uppercase tracking-wider pt-2">
              Trigger Live Toasts:
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => triggerToast('info')}>
                Info Toast
              </Button>
              <Button variant="ghost" size="sm" onClick={() => triggerToast('success')}>
                Success
              </Button>
              <Button variant="ghost" size="sm" onClick={() => triggerToast('warning')}>
                Warning
              </Button>
              <Button variant="ghost" size="sm" onClick={() => triggerToast('error')}>
                Error
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Skeletons, Empty & Error States */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-astra-accent">
          8. States: Skeleton, Empty, Error
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Skeleton Card */}
          <div className="p-4 rounded-xl bg-astra-surface border border-astra-border space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonLoader variant="circle" width={36} height={36} />
              <div className="space-y-1.5 flex-1">
                <SkeletonLoader variant="text" width="60%" />
                <SkeletonLoader variant="text" width="40%" />
              </div>
            </div>
            <SkeletonLoader variant="rect" height={60} />
          </div>

          {/* Empty State */}
          <EmptyState
            title="No Active Alerts"
            description="All sensor telemetry streams currently reading within expected mission parameters."
          />

          {/* Error State */}
          <ErrorStateWithRetry
            title="Telemetry Link Dropped"
            message="Error 504: Ground transceiver ping timed out after 3000ms."
            onRetry={() => alert('Retrying telemetry handshake...')}
          />
        </div>
      </section>

      {/* Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Emergency Subsystem Diagnostic"
        subtitle="Telemetry Sector 4-B Calibration"
      >
        <div className="space-y-4 text-xs font-sans text-astra-muted">
          <p>
            Manual overrides will directly alter the life support scrubber duty cycle. Ensure water
            allocation is preserved above 3.5 L/day.
          </p>
          <div className="p-3 bg-astra-raised rounded-lg border border-astra-border font-mono text-[11px] text-astra-text">
            SYSTEM_STATUS: OVERRIDE_READY
            <br />
            RESERVE_FACTOR: 1.15x
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Confirm Override
            </Button>
          </div>
        </div>
      </Modal>

      {/* 9. Cinematic Style Signature Components (Reference Frames) */}
      <section className="space-y-6 pt-6 border-t border-cinematic-hairline">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cinematic-cyan uppercase tracking-widest px-2 py-0.5 rounded bg-cinematic-cyan/10 border border-cinematic-cyan/20">
              Signature
            </span>
            <span className="text-xs font-mono text-cinematic-muted">
              Reference Style Tokens & Faux Spheres
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            9. Cinematic Design System & Procedural Planets
          </h2>
          <p className="text-sm text-cinematic-muted font-sans mt-1">
            Recreated with pure 2D/2.5D CSS, SVG, and procedural Canvas textures. Zero 3D engine, zero photographs.
          </p>
        </div>

        {/* Cinematic Tokens Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-4 rounded-xl bg-cinematic-bg-dark border border-cinematic-hairline flex flex-col justify-between h-24">
            <span className="text-cinematic-muted">Space Dark</span>
            <span className="text-white font-bold">#060A18</span>
          </div>
          <div className="p-4 rounded-xl bg-cinematic-bg-light border border-cinematic-hairline flex flex-col justify-between h-24">
            <span className="text-cinematic-muted">Space Light</span>
            <span className="text-white font-bold">#0A1128</span>
          </div>
          <div className="p-4 rounded-xl bg-cinematic-glass border border-cinematic-hairline flex flex-col justify-between h-24">
            <span className="text-cinematic-muted">Glass Panel</span>
            <span className="text-white font-bold">72% Blur</span>
          </div>
          <div className="p-4 rounded-xl bg-cinematic-cyan/15 border border-cinematic-cyan text-cinematic-cyan flex flex-col justify-between h-24 shadow-glow-cyan">
            <span>Accent Cyan</span>
            <span className="font-bold">#6FE7EE</span>
          </div>
          <div className="p-4 rounded-xl bg-cinematic-pill text-cinematic-pill-text flex flex-col justify-between h-24 shadow-glow-pill">
            <span className="font-semibold text-xs">Pale Pill</span>
            <span className="font-bold">#DCEBFF</span>
          </div>
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 flex flex-col justify-between h-24 shadow-glow-atmosphere">
            <span>Atmosphere</span>
            <span className="font-bold">#2A6BFF</span>
          </div>
        </div>

        {/* GlassPanel Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassPanel variant="default" className="p-5">
            <h4 className="text-xs uppercase font-mono text-cinematic-cyan mb-1">GlassPanel: Default</h4>
            <p className="text-xs text-cinematic-muted">Standard 72% opacity backdrop-blur glass with hairline border.</p>
          </GlassPanel>
          <GlassPanel variant="heavy" className="p-5">
            <h4 className="text-xs uppercase font-mono text-cinematic-cyan mb-1">GlassPanel: Heavy</h4>
            <p className="text-xs text-cinematic-muted">88% opacity high-contrast frosted glass for modals and slide-overs.</p>
          </GlassPanel>
          <GlassPanel variant="interactive" className="p-5">
            <h4 className="text-xs uppercase font-mono text-cinematic-cyan mb-1">GlassPanel: Interactive</h4>
            <p className="text-xs text-cinematic-muted">Hover lift, brightened border, and elevation glow for active cards.</p>
          </GlassPanel>
        </div>

        {/* PillButtons Showcase */}
        <div className="p-6 rounded-2xl bg-cinematic-glass border border-cinematic-hairline space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-mono text-cinematic-muted">
            Pill Buttons & Circular Controls
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <PillButton variant="primary" size="lg">
              Primary Large
            </PillButton>
            <PillButton variant="primary" size="md">
              Primary Medium
            </PillButton>
            <PillButton variant="primary" size="sm">
              Primary Small
            </PillButton>
            <PillButton variant="secondary" size="md">
              Secondary Glass
            </PillButton>
            <PillButton variant="glass" size="md">
              Translucent Glass
            </PillButton>
            <PillButton variant="primary" size="md" disabled>
              Disabled State
            </PillButton>
            <PillButton variant="icon-circle" size="md" aria-label="Quick Start Icon">
              ?
            </PillButton>
            <PillButton variant="icon-circle" size="sm" aria-label="Small Icon">
              &gt;
            </PillButton>
          </div>
        </div>

        {/* Procedural Faux Spheres */}
        <div className="p-6 rounded-2xl bg-cinematic-glass border border-cinematic-hairline space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest font-mono text-cinematic-muted">
              Procedural Faux Spheres (Canvas Noise + CSS Terminator + Rim Light)
            </h3>
            <span className="text-[11px] font-mono text-cinematic-cyan">
              Tileable Texture · DPR &le; 2 · 2D/2.5D
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center justify-items-center">
            {/* Moon */}
            <div className="text-center space-y-3">
              <Planet type="moon" size={160} variant="detail-sphere" />
              <div>
                <span className="font-serif text-lg text-white block">The Moon</span>
                <span className="text-[10px] font-mono text-cinematic-muted uppercase tracking-wider">
                  Outpost Location
                </span>
              </div>
            </div>

            {/* Earth */}
            <div className="text-center space-y-3">
              <Planet type="earth" size={160} variant="detail-sphere" />
              <div>
                <span className="font-serif text-lg text-white block">Planet Earth</span>
                <span className="text-[10px] font-mono text-cinematic-muted uppercase tracking-wider">
                  Origin Base (1.0G)
                </span>
              </div>
            </div>

            {/* Mars */}
            <div className="text-center space-y-3">
              <Planet type="mars" size={160} variant="detail-sphere" />
              <div>
                <span className="font-serif text-lg text-white block">Mars</span>
                <span className="text-[10px] font-mono text-cinematic-muted uppercase tracking-wider">
                  Future Mission
                </span>
              </div>
            </div>

            {/* Venus */}
            <div className="text-center space-y-3">
              <Planet type="venus" size={160} variant="detail-sphere" />
              <div>
                <span className="font-serif text-lg text-white block">Venus</span>
                <span className="text-[10px] font-mono text-cinematic-muted uppercase tracking-wider">
                  Sister Planet
                </span>
              </div>
            </div>
          </div>

          {/* Edge Previews */}
          <div className="pt-4 border-t border-cinematic-hairline/60 flex flex-wrap justify-around items-center gap-4">
            <Planet
              type="earth"
              size={64}
              variant="edge-preview"
              label="Earth"
              sublabel="Home World"
            />
            <Planet
              type="mars"
              size={64}
              variant="edge-preview"
              label="Mars"
              sublabel="Future Mission"
            />
            <Planet
              type="venus"
              size={64}
              variant="edge-preview"
              label="Venus"
              sublabel="Deep Orbit"
            />
          </div>
        </div>
      </section>

      {/* SlideOver Demo */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        title="Subsystem Engineering Console"
        subtitle="Power Bus & Environmental Allocation"
      >
        <div className="space-y-6">
          <p className="text-xs text-astra-muted">
            Configure discrete engineering setpoints across all 6 outpost modules.
          </p>
          <SliderWithStepper
            id="so_slider1"
            label="Water Recycling Bus"
            value={8.0}
            min={0}
            max={20}
            step={0.5}
            unit=" kW"
            onChange={() => {}}
          />
          <SliderWithStepper
            id="so_slider2"
            label="Greenhouse Hydroponics"
            value={10.0}
            min={0}
            max={25}
            step={0.5}
            unit=" kW"
            onChange={() => {}}
          />
        </div>
      </SlideOver>

      {/* Toast container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
};

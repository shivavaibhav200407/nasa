import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import StarField from './StarField';
import Planet from './Planet';
import SunHero from './SunHero';
import CameraController from './CameraController';
import { PLANETS } from '../data/planets';

export default function SolarSystemScene({
  viewMode, // 'carousel' | 'detail' | 'overview'
  currentIndex,
  onSelectPlanet,
  isMobile = false,
  isOrbitEnabled = false,
  onTransitionComplete
}) {
  const currentPlanet = PLANETS[currentIndex];
  const prevIndex = (currentIndex - 1 + PLANETS.length) % PLANETS.length;
  const nextIndex = (currentIndex + 1) % PLANETS.length;
  const prevPlanet = PLANETS[prevIndex];
  const nextPlanet = PLANETS[nextIndex];

  // Animated positions for carousel vs detail
  const centerPosRef = useRef([0, -3.2, 0]);
  const centerScaleRef = useRef(1.45);

  // Determine active planet target position based on viewMode
  const activePosition = viewMode === 'detail'
    ? (isMobile ? [0, 1.4, 0] : [2.5, 0, 0])
    : [0, -3.4, 0];

  const activeScale = viewMode === 'detail'
    ? (isMobile ? 1.0 : 1.25)
    : 1.45;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        camera={{ position: [0, 1.2, 10.5], fov: 45, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Deep Space Background Starfield */}
          <StarField count={isMobile ? 2000 : 3600} dustCount={isMobile ? 180 : 350} />

          {/* Cinematic Directional Lighting */}
          <ambientLight intensity={0.2} color="#CBD5E1" />
          <directionalLight
            position={[-12, 10, 10]}
            intensity={3.4}
            color="#FFFDF5"
          />
          {/* Blue celestial rim light from space */}
          <directionalLight
            position={[10, -4, -6]}
            intensity={0.4}
            color="#1E3A8A"
          />

          {/* Overview Mode: Sol (Sun) & Planetary Orbits */}
          <SunHero visible={viewMode === 'overview'} />

          {/* Carousel Mode: 3-Planet Horizon Carousel */}
          {viewMode !== 'overview' && (
            <group>
              {/* Left Neighbor Planet (Previous) */}
              {viewMode === 'carousel' && (
                <Planet
                  key={`prev-${prevPlanet.id}`}
                  planet={prevPlanet}
                  position={[-7.8, -0.6, 2]}
                  scale={0.62}
                  opacity={0.85}
                  onClick={() => onSelectPlanet(prevIndex)}
                />
              )}

              {/* Center Active Planet */}
              <Planet
                key={`active-${currentPlanet.id}`}
                planet={currentPlanet}
                position={activePosition}
                scale={activeScale}
                opacity={1.0}
              />

              {/* Right Neighbor Planet (Next) */}
              {viewMode === 'carousel' && (
                <Planet
                  key={`next-${nextPlanet.id}`}
                  planet={nextPlanet}
                  position={[7.8, -0.6, 2]}
                  scale={0.62}
                  opacity={0.85}
                  onClick={() => onSelectPlanet(nextIndex)}
                />
              )}
            </group>
          )}

          {/* Camera Orchestrator */}
          <CameraController
            viewMode={viewMode}
            currentPlanet={currentPlanet}
            isMobile={isMobile}
            onTransitionComplete={onTransitionComplete}
          />

          {/* Free Orbit Controls in Detail Mode when toggled */}
          {isOrbitEnabled && viewMode === 'detail' && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3.5}
              maxDistance={20}
              target={activePosition}
              rotateSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

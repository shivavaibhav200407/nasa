import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import StarField from './StarField';
import Planet from './Planet';
import CameraController from './CameraController';
import { PLANETS } from '../data/planets';

export default function SpaceScene({
  screenState, // 'landing' | 'split' | 'zoom'
  currentIndex,
  onSelectPlanet,
  isMobile = false,
  onTransitionComplete
}) {
  const currentPlanet = PLANETS[currentIndex];
  const prevIndex = (currentIndex - 1 + PLANETS.length) % PLANETS.length;
  const nextIndex = (currentIndex + 1) % PLANETS.length;
  const prevPlanet = PLANETS[prevIndex];
  const nextPlanet = PLANETS[nextIndex];

  // Active planet positioning matching video reference
  const activePosition = screenState === 'landing'
    ? [0, -4.1, 0]
    : (isMobile ? [0, 1.4, 0] : [2.5, 0, 0]);

  const activeScale = screenState === 'landing'
    ? 1.54
    : (isMobile ? 1.05 : 1.28);

  // Subtle clean opacity in zoom mode
  const activeOpacity = screenState === 'zoom' ? 0.85 : 1.0;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0.5, 9.8], fov: 45, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Deep Space Background Starfield */}
          <StarField count={isMobile ? 1800 : 2800} dustCount={isMobile ? 100 : 200} />

          {/* Cinematic Sunlight from Top-Left */}
          <ambientLight intensity={0.16} color="#E2E8F0" />
          <directionalLight
            position={[-14, 12, 10]}
            intensity={3.8}
            color="#FFFDF2"
          />
          <directionalLight
            position={[12, -4, -6]}
            intensity={0.3}
            color="#1E3A8A"
          />

          {/* Planetary Composition */}
          <group>
            {/* Left Neighbor Planet (Visible in Landing Mode) */}
            {screenState === 'landing' && (
              <Planet
                key={`prev-${prevPlanet.id}`}
                planet={prevPlanet}
                position={[-8.6, -0.2, 0.8]}
                scale={0.72}
                opacity={0.88}
                onClick={() => onSelectPlanet(prevIndex)}
              />
            )}

            {/* Central / Active Planet with Real NASA Textures */}
            <Planet
              key={`active-${currentPlanet.id}`}
              planet={currentPlanet}
              position={activePosition}
              scale={activeScale}
              opacity={activeOpacity}
            />

            {/* Right Neighbor Planet (Visible in Landing Mode) */}
            {screenState === 'landing' && (
              <Planet
                key={`next-${nextPlanet.id}`}
                planet={nextPlanet}
                position={[8.6, -0.2, 0.8]}
                scale={0.72}
                opacity={0.88}
                onClick={() => onSelectPlanet(nextIndex)}
              />
            )}
          </group>

          {/* Camera Orchestrator */}
          <CameraController
            screenState={screenState}
            currentPlanet={currentPlanet}
            isMobile={isMobile}
            onTransitionComplete={onTransitionComplete}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

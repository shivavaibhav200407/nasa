import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPlanetTexture } from './textureGenerator';
import { PLANETS } from '../data/planets';

// Mini orbiting planets in hero mode
const MINI_ORBITS = PLANETS.map((p, idx) => ({
  id: p.id,
  name: p.name,
  radius: 6.5 + idx * 2.1,
  speed: 0.15 / (idx * 0.4 + 1),
  size: 0.28 + (idx === 4 || idx === 5 ? 0.35 : 0.15),
  color: p.visual.accentColor,
  initialAngle: (idx * Math.PI) / 4
}));

export default function SunHero({ visible = true }) {
  const sunRef = useRef();
  const coronaRef = useRef();
  const orbitsRef = useRef();

  const sunTexture = useMemo(() => getPlanetTexture('sun'), []);

  // Orbit line geometries
  const orbitLines = useMemo(() => {
    return MINI_ORBITS.map(orbit => {
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * orbit.radius, 0, Math.sin(theta) * orbit.radius));
      }
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  useFrame((state, delta) => {
    if (!visible) return;
    const t = state.clock.getElapsedTime();

    if (sunRef.current) {
      sunRef.current.rotation.y += 0.0025;
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.z -= 0.0015;
      const pulse = 1.0 + Math.sin(t * 1.5) * 0.04;
      coronaRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, -0.5, 0]}>
      {/* Central Blazing Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[3.2, 48, 48]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>

      {/* Sun Coronal Glow */}
      <mesh ref={coronaRef} scale={1.22}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent={true}
          opacity={0.32}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Halo */}
      <mesh scale={1.45}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial
          color="#EF4444"
          transparent={true}
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Radiant Sun Light */}
      <pointLight color="#FFF8E7" intensity={3.5} distance={100} decay={1.5} />

      {/* Concentric Orbit Paths and Mini Planetesimals */}
      <group ref={orbitsRef} rotation={[0.4, 0.2, -0.1]}>
        {MINI_ORBITS.map((orbit, i) => (
          <group key={orbit.id}>
            {/* Subtle Orbit Ring */}
            <line geometry={orbitLines[i]}>
              <lineBasicMaterial color={orbit.color} transparent={true} opacity={0.22} />
            </line>

            {/* Orbiting Planet marker */}
            <MiniPlanet orbit={orbit} />
          </group>
        ))}
      </group>
    </group>
  );
}

function MiniPlanet({ orbit }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const angle = orbit.initialAngle + t * orbit.speed;
    const x = Math.cos(angle) * orbit.radius;
    const z = Math.sin(angle) * orbit.radius;
    meshRef.current.position.set(x, 0, z);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[orbit.size, 16, 16]} />
      <meshBasicMaterial color={orbit.color} />
    </mesh>
  );
}


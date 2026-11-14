import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadTexture, PLANET_TEXTURES } from './planetTextures';
import SaturnRings from './SaturnRings';

export default function Planet({
  planet,
  position = [0, 0, 0],
  scale = 1.0,
  rotationSpeedMultiplier = 1.0,
  opacity = 1.0,
  onClick
}) {
  const planetRef = useRef();
  const cloudsRef = useRef();
  const groupRef = useRef();
  const planetMatRef = useRef();
  const cloudsMatRef = useRef();
  const currentOpacityRef = useRef(opacity);

  const {
    id,
    visual: {
      radius = 2.0,
      roughness = 0.5,
      metalness = 0.1,
      hasClouds = false,
      cloudSpeed = 0.003,
      hasRings = false,
      ringInnerRadius = 3.2,
      ringOuterRadius = 6.0,
      ringOpacity = 0.9,
      rotationSpeed = 0.004,
      tilt = 0.0
    }
  } = planet;

  // Load real NASA textures
  const textureConfig = PLANET_TEXTURES[id] || { map: '/textures/earth_day.jpg' };
  const mapTexture = useMemo(() => loadTexture(textureConfig.map), [textureConfig.map]);
  const normalTexture = useMemo(() => textureConfig.normal ? loadTexture(textureConfig.normal) : null, [textureConfig.normal]);
  const lightsTexture = useMemo(() => textureConfig.lights ? loadTexture(textureConfig.lights) : null, [textureConfig.lights]);
  const cloudsTexture = useMemo(() => textureConfig.clouds ? loadTexture(textureConfig.clouds) : null, [textureConfig.clouds]);

  // Frame animation
  useFrame((state, delta) => {
    // Smoothly damp opacity
    currentOpacityRef.current = THREE.MathUtils.damp(
      currentOpacityRef.current,
      opacity,
      3.5,
      delta
    );

    if (planetMatRef.current) {
      planetMatRef.current.opacity = currentOpacityRef.current;
      planetMatRef.current.transparent = currentOpacityRef.current < 0.99;
      planetMatRef.current.depthWrite = currentOpacityRef.current > 0.8;
    }

    if (cloudsMatRef.current && hasClouds) {
      cloudsMatRef.current.opacity = 0.85 * currentOpacityRef.current;
      cloudsMatRef.current.transparent = true;
    }

    // Continuous slow planetary rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed * 0.5 * rotationSpeedMultiplier;
    }
    if (cloudsRef.current && hasClouds) {
      cloudsRef.current.rotation.y += (rotationSpeed + cloudSpeed) * 0.5 * rotationSpeedMultiplier;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onClick={onClick}
      onPointerOver={(e) => {
        if (onClick) {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        if (onClick) {
          document.body.style.cursor = 'default';
        }
      }}
    >
      <group rotation={[tilt, 0, 0]}>
        {/* Planet Sphere */}
        <mesh ref={planetRef}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            ref={planetMatRef}
            map={mapTexture}
            normalMap={normalTexture}
            normalScale={new THREE.Vector2(0.85, 0.85)}
            emissiveMap={lightsTexture}
            emissive={lightsTexture ? new THREE.Color('#FFCC77') : new THREE.Color('#000000')}
            emissiveIntensity={lightsTexture ? 1.4 : 0.0}
            roughness={roughness}
            metalness={metalness}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>

        {/* Atmospheric Clouds (Earth & weather decks) */}
        {hasClouds && cloudsTexture && (
          <mesh ref={cloudsRef} scale={1.018}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial
              ref={cloudsMatRef}
              map={cloudsTexture}
              transparent={true}
              opacity={0.82 * opacity}
              blending={THREE.NormalBlending}
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
        )}

        {/* 3D Rings for Saturn / Uranus */}
        {hasRings && (
          <SaturnRings
            innerRadius={ringInnerRadius}
            outerRadius={ringOuterRadius}
            tilt={tilt}
            opacity={ringOpacity * opacity}
          />
        )}
      </group>
    </group>
  );
}

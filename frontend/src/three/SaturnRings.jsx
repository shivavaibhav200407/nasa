import React, { useMemo } from 'react';
import * as THREE from 'three';
import { loadTexture } from './planetTextures';

export default function SaturnRings({
  innerRadius = 3.5,
  outerRadius = 6.6,
  tilt = 0.47,
  opacity = 0.95
}) {
  const texture = useMemo(() => loadTexture('/textures/saturn_ring.jpg'), []);

  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128, 8);
    // Remap UVs so texture wraps radially
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.hypot(x, y);
      const u = (dist - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, THREE.MathUtils.clamp(u, 0, 1), 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <group rotation={[Math.PI / 2 + 0.1, tilt, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={texture}
          transparent={true}
          opacity={opacity}
          side={THREE.DoubleSide}
          roughness={0.7}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

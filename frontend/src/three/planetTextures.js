import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const cache = new Map();

export function loadTexture(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }
  const tex = textureLoader.load(path);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(path, tex);
  return tex;
}

export const PLANET_TEXTURES = {
  mercury: {
    map: '/textures/mercury.jpg'
  },
  venus: {
    map: '/textures/venus.jpg'
  },
  earth: {
    map: '/textures/earth_day.jpg',
    normal: '/textures/earth_normal.jpg',
    specular: '/textures/earth_specular.jpg',
    lights: '/textures/earth_lights.png',
    clouds: '/textures/earth_clouds.png'
  },
  mars: {
    map: '/textures/mars.jpg'
  },
  jupiter: {
    map: '/textures/jupiter.jpg'
  },
  saturn: {
    map: '/textures/saturn.jpg',
    ring: '/textures/saturn_ring.jpg'
  },
  uranus: {
    map: '/textures/uranus.jpg'
  },
  neptune: {
    map: '/textures/neptune.jpg'
  },
  sun: {
    map: '/textures/sun.jpg'
  }
};


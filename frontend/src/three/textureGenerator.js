import * as THREE from 'three';

class SimpleNoise {
  constructor(seed = 12345) {
    this.p = new Uint8Array(512);
    const permutation = new Uint8Array(256);
    for (let i = 0; i < 256; i++) permutation[i] = i;
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      const tmp = permutation[i];
      permutation[i] = permutation[j];
      permutation[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.p[i] = permutation[i & 255];
    }
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t, a, b) { return a + t * (b - a); }
  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const A = this.p[X] + Y, B = this.p[X + 1] + Y;
    return this.lerp(v,
      this.lerp(u, this.grad(this.p[A], x, y, 0), this.grad(this.p[B], x - 1, y, 0)),
      this.lerp(u, this.grad(this.p[A + 1], x, y - 1, 0), this.grad(this.p[B + 1], x - 1, y - 1, 0))
    );
  }

  fbm(x, y, octaves = 5, lacunarity = 2.0, gain = 0.5) {
    let sum = 0;
    let amp = 1.0;
    let freq = 1.0;
    let max = 0;
    for (let i = 0; i < octaves; i++) {
      sum += this.noise2D(x * freq, y * freq) * amp;
      max += amp;
      freq *= lacunarity;
      amp *= gain;
    }
    return sum / max;
  }
}

const noise = new SimpleNoise(8888);
const textureCache = new Map();

export function getPlanetTexture(planetId) {
  if (textureCache.has(planetId)) {
    return textureCache.get(planetId);
  }

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  switch (planetId) {
    case 'mercury':
      renderMercury(ctx, width, height);
      break;
    case 'venus':
      renderVenus(ctx, width, height);
      break;
    case 'earth':
      renderEarth(ctx, width, height);
      break;
    case 'mars':
      renderMars(ctx, width, height);
      break;
    case 'jupiter':
      renderJupiter(ctx, width, height);
      break;
    case 'saturn':
      renderSaturn(ctx, width, height);
      break;
    case 'uranus':
      renderUranus(ctx, width, height);
      break;
    case 'neptune':
      renderNeptune(ctx, width, height);
      break;
    case 'sun':
      renderSun(ctx, width, height);
      break;
    default:
      renderGeneric(ctx, width, height, '#38BDF8');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(planetId, texture);
  return texture;
}

export function getEarthCloudsTexture() {
  if (textureCache.has('earth-clouds')) {
    return textureCache.get('earth-clouds');
  }

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;
    const latFactor = Math.cos(lat);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const n = (noise.fbm(x / 55, y / 55, 6, 2.1, 0.52) + 1) * 0.5;
      const swirl = Math.sin(x / 35 + n * 4.5);
      const cloudDensity = Math.pow(n, 1.7) * latFactor * 1.35 + swirl * 0.12;

      if (cloudDensity > 0.36) {
        const alpha = Math.min(255, Math.floor((cloudDensity - 0.36) * 380));
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = alpha;
      } else {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth-clouds', texture);
  return texture;
}

export function getSaturnRingsTexture() {
  if (textureCache.has('saturn-rings')) {
    return textureCache.get('saturn-rings');
  }

  const width = 512;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0.0, 'rgba(140, 115, 85, 0.0)');
  gradient.addColorStop(0.12, 'rgba(160, 130, 95, 0.25)');
  gradient.addColorStop(0.25, 'rgba(180, 145, 105, 0.45)');
  gradient.addColorStop(0.28, 'rgba(235, 215, 175, 0.95)');
  gradient.addColorStop(0.45, 'rgba(225, 200, 155, 0.88)');
  gradient.addColorStop(0.55, 'rgba(240, 225, 185, 0.98)');
  gradient.addColorStop(0.62, 'rgba(210, 185, 140, 0.85)');
  gradient.addColorStop(0.64, 'rgba(40, 30, 20, 0.05)');
  gradient.addColorStop(0.68, 'rgba(50, 35, 25, 0.08)');
  gradient.addColorStop(0.70, 'rgba(210, 190, 150, 0.82)');
  gradient.addColorStop(0.82, 'rgba(195, 170, 130, 0.75)');
  gradient.addColorStop(0.85, 'rgba(60, 45, 30, 0.15)');
  gradient.addColorStop(0.87, 'rgba(190, 165, 125, 0.7)');
  gradient.addColorStop(0.96, 'rgba(170, 140, 105, 0.5)');
  gradient.addColorStop(1.0, 'rgba(120, 95, 70, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let x = 0; x < width; x++) {
    const microVar = Math.sin(x * 1.5) * 0.15;
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 10) {
        data[idx + 3] = Math.max(0, Math.min(255, alpha * (1 + microVar)));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set('saturn-rings', texture);
  return texture;
}

// ----------------------------------------------------
// Surface Renderers
// ----------------------------------------------------

function renderEarth(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    const lat = (y / h - 0.5) * Math.PI;
    const isPolar = Math.abs(lat) > 1.25;

    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const nx = x / 65;
      const ny = y / 65;
      const elevation = (noise.fbm(nx, ny, 6, 2.1, 0.52) + 1) * 0.5;

      if (isPolar && elevation > 0.35) {
        // Polar ice caps
        data[idx] = 245;
        data[idx + 1] = 250;
        data[idx + 2] = 255;
      } else if (elevation > 0.52) {
        // Continent landmasses
        const landType = elevation - 0.52;
        if (landType > 0.22) {
          // Mountains
          data[idx] = 165;
          data[idx + 1] = 145;
          data[idx + 2] = 120;
        } else if (landType > 0.08) {
          // Green forests and hills
          data[idx] = 40 + Math.floor(landType * 90);
          data[idx + 1] = 95 + Math.floor(landType * 80);
          data[idx + 2] = 45;
        } else {
          // Coasts / plains
          data[idx] = 140 + Math.floor(landType * 80);
          data[idx + 1] = 130 + Math.floor(landType * 50);
          data[idx + 2] = 85;
        }

        // Add sparkling golden city night lights on land!
        const citySeed = noise.noise2D(x * 1.8, y * 1.8);
        if (citySeed > 0.72) {
          const brightness = Math.floor((citySeed - 0.72) * 800);
          data[idx] = Math.min(255, data[idx] + brightness);
          data[idx + 1] = Math.min(255, data[idx + 1] + Math.floor(brightness * 0.8));
          data[idx + 2] = Math.min(255, data[idx + 2] + Math.floor(brightness * 0.3));
        }
      } else {
        // Deep blue ocean
        const depth = elevation / 0.52;
        data[idx] = Math.floor(12 + depth * 20);
        data[idx + 1] = Math.floor(45 + depth * 55);
        data[idx + 2] = Math.floor(135 + depth * 85);
      }
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderMercury(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const n = (noise.fbm(x / 35, y / 35, 5, 2.2, 0.5) + 1) * 0.5;
      const fine = (noise.noise2D(x / 8, y / 8) + 1) * 0.5;
      let val = Math.floor(100 + n * 65 + fine * 25);
      val = Math.max(30, Math.min(205, val));

      // Crater rings
      const cx = (x % 85) - 42;
      const cy = (y % 75) - 37;
      const dist = Math.hypot(cx, cy);
      if (dist < 16) {
        const rim = Math.sin((dist / 16) * Math.PI);
        if (dist > 11) val += Math.floor(rim * 35);
        else val -= Math.floor((1 - dist / 11) * 25);
      }

      data[idx] = val;
      data[idx + 1] = Math.floor(val * 0.95);
      data[idx + 2] = Math.floor(val * 0.90);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderVenus(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y++) {
    const lat = y / h;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const wave = Math.sin(lat * 18 + x / 30);
      const n = (noise.fbm(x / 60 + wave * 0.35, y / 30, 4, 2.0, 0.5) + 1) * 0.5;
      data[idx] = Math.min(255, Math.floor(215 + n * 35));
      data[idx + 1] = Math.min(255, Math.floor(180 + n * 40));
      data[idx + 2] = Math.min(255, Math.floor(120 + n * 35));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderMars(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y++) {
    const lat = (y / h - 0.5) * Math.PI;
    const isPolar = Math.abs(lat) > 1.32;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const n = (noise.fbm(x / 45, y / 45, 5, 2.0, 0.5) + 1) * 0.5;
      const darkPatch = (noise.noise2D(x / 100, y / 100) + 1) * 0.5;

      if (isPolar) {
        data[idx] = 245;
        data[idx + 1] = 235;
        data[idx + 2] = 230;
      } else {
        let r = 185 + Math.floor(n * 55);
        let g = 70 + Math.floor(n * 45);
        let b = 35 + Math.floor(n * 25);
        if (darkPatch > 0.64) {
          const blend = (darkPatch - 0.64) * 2;
          r = Math.floor(r * (1 - blend * 0.55));
          g = Math.floor(g * (1 - blend * 0.55));
          b = Math.floor(b * (1 - blend * 0.55));
        }
        data[idx] = Math.min(255, r);
        data[idx + 1] = Math.min(255, g);
        data[idx + 2] = Math.min(255, b);
      }
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderJupiter(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const grsX = w * 0.62;
  const grsY = h * 0.68;
  const grsRx = 55;
  const grsRy = 32;

  for (let y = 0; y < h; y++) {
    const lat = y / h;
    const bandFreq = Math.sin(lat * 32);
    const bandColor = Math.sin(lat * 16) * 0.5 + 0.5;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const turbulence = noise.fbm(x / 30, y / 15 + bandFreq * 0.1, 4, 2.0, 0.45);
      const tVal = (turbulence + 1) * 0.5;

      let r = 210 + Math.floor(bandColor * 35 - tVal * 30);
      let g = 145 + Math.floor(bandColor * 45 - tVal * 45);
      let b = 85 + Math.floor(bandColor * 40 - tVal * 40);

      const dx = (x - grsX) / grsRx;
      const dy = (y - grsY) / grsRy;
      const distSq = dx * dx + dy * dy;
      if (distSq < 1.0) {
        const spotWeight = 1.0 - Math.sqrt(distSq);
        r = Math.floor(215 + spotWeight * 35);
        g = Math.floor(70 + spotWeight * 25);
        b = Math.floor(45 + spotWeight * 20);
      }

      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderSaturn(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y++) {
    const lat = y / h;
    const band = Math.sin(lat * 24) * 0.5 + 0.5;
    const fineBand = Math.sin(lat * 64) * 0.2;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const n = (noise.noise2D(x / 80, y / 18) + 1) * 0.5;
      data[idx] = Math.min(255, 225 + Math.floor(band * 20 + fineBand * 15 - n * 15));
      data[idx + 1] = Math.min(255, 195 + Math.floor(band * 25 + fineBand * 12 - n * 18));
      data[idx + 2] = Math.min(255, 150 + Math.floor(band * 30 + fineBand * 10 - n * 20));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderUranus(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y++) {
    const lat = y / h;
    const subtleBand = Math.sin(lat * 12) * 10;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const n = (noise.noise2D(x / 100, y / 30) + 1) * 0.5;
      data[idx] = Math.min(255, 105 + Math.floor(subtleBand + n * 15));
      data[idx + 1] = Math.min(255, 220 + Math.floor(subtleBand * 0.8 + n * 20));
      data[idx + 2] = Math.min(255, 238 + Math.floor(subtleBand * 0.5 + n * 12));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderNeptune(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const dsX = w * 0.35;
  const dsY = h * 0.45;

  for (let y = 0; y < h; y++) {
    const lat = y / h;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const n = (noise.fbm(x / 45, y / 20, 5, 2.1, 0.45) + 1) * 0.5;
      const cirrus = Math.pow(n, 2.5);

      let r = 30 + Math.floor(cirrus * 150);
      let g = 80 + Math.floor(n * 35 + cirrus * 130);
      let b = 220 + Math.floor(n * 35);

      const dx = (x - dsX) / 45;
      const dy = (y - dsY) / 25;
      if (dx * dx + dy * dy < 1.0) {
        r = Math.floor(r * 0.55);
        g = Math.floor(g * 0.55);
        b = Math.floor(b * 0.65);
      }

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderSun(ctx, w, h) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const n = (noise.fbm(x / 30, y / 30, 5, 2.2, 0.5) + 1) * 0.5;
      data[idx] = 255;
      data[idx + 1] = Math.min(255, Math.floor(160 + n * 60));
      data[idx + 2] = Math.min(255, Math.floor(25 + n * 45));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderGeneric(ctx, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

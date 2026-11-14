# COSMOS — Interactive 3D Solar System Explorer

A cinematic, interactive 3D solar system web application built with **React**, **Three.js**, **React Three Fiber**, **GSAP**, **Framer Motion**, and **Tailwind CSS**.

---

## ✨ Features

- **True 3D Planetary Rendering**: Every planet is rendered in real-time as a 3D sphere with high-resolution procedural textures, axial tilts, dynamic Fresnel atmospheric glow shaders, and rotating cloud layers.
- **Cinematic Camera Transitions**: Orchestrated with **GSAP timelines** — camera swoops smoothly toward each planet before revealing details.
- **Staggered Information Reveal**: Planet descriptions, physical characteristics, metrics, and phenomena appear strictly after the 3D transition animation completes.
- **All 8 Solar System Planets**:
  - **Mercury (01)**: Scorched, heavily cratered regolith terrain with high roughness.
  - **Venus (02)**: Golden, runaway greenhouse cloud shroud with atmospheric glow.
  - **Earth (03)**: Vibrant blue oceans, green continents, rotating atmospheric cloud layer, and glowing Rayleigh scattering envelope.
  - **Mars (04)**: Rust-red iron oxide surface, dark basalt plains (Syrtis Major), and polar ice caps.
  - **Jupiter (05)**: Magnificent atmospheric storm bands, micro-eddies, and the Great Red Spot.
  - **Saturn (06)**: Golden gas giant with double-sided 3D concentric rings, Cassini division, and ring transparency.
  - **Uranus (07)**: Pale aquamarine realm rolling on a 98-degree axial tilt with faint rings.
  - **Neptune (08)**: Deep azure ice giant with supersonic storm streaks and the Great Dark Spot.
- **Hero Landing Screen**: Full-screen deep space environment with a glowing 3D Sun, coronal pulse, miniature planetary orbit paths, and direct planet access shortcuts.
- **Interactive Controls**:
  - Horizontal planet selector with spring-animated active indicator
  - Prev / Next navigation buttons with planet index counter (`03 / 08`)
  - Full keyboard navigation: `[←]` `[→]` or `[↑]` `[↓]` to navigate, `[Esc]` to return to landing
  - Mouse wheel scroll support with debounced planet transitions
  - Free 3D Orbit inspection mode
  - Ambient celestial audio drone and futuristic UI sound effects via Web Audio API
- **Responsive & Optimized**: Adapts seamlessly to desktop, tablet, and mobile screen sizes.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI component architecture and state management |
| **Vite** | Modern, blazing-fast bundler and dev server |
| **Three.js** | 3D graphics and WebGL rendering engine |
| **@react-three/fiber** | Declarative Three.js scene graph in React |
| **@react-three/drei** | Three.js helpers and camera controls |
| **GSAP** | Cinematic camera swoop sequences and timelines |
| **Framer Motion** | Fluid layout transitions and staggered typography |
| **Tailwind CSS** | Styling, glassmorphism, and responsive layouts |
| **Lucide React** | Space and navigation icons |
| **Web Audio API** | Ambient harmonic drone and UI sound effects |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```


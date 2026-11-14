# ASTRA DEVELOPER MANUAL & ARCHITECTURE SPECIFICATION
### Technical Guide to the 2.5D Simulation Engine & Design System
**Version:** 1.0.0  
**Stack:** Python 3.13 / FastAPI / SQLite • React 19 / TypeScript / Vite / Tailwind CSS / Motion  

---

> [!IMPORTANT]
> **NASA NON-ENDORSEMENT NOTICE**  
> ASTRA is an independent educational simulator developed for the 2026 NASA Space Apps Challenge. It is **not** affiliated with, endorsed by, or certified by NASA.

---

## 1. CROSS-PLATFORM DEVELOPMENT SETUP

### Prerequisites
- **Python:** 3.11+ (Python 3.13 tested and verified)
- **Node.js:** v20.18+ (tested on Node 20.18.0)
- **Git**

### Step-by-Step Local Setup

#### Windows (PowerShell)
```powershell
# 1. Clone repository and enter project root
git clone https://github.com/your-username/astra.git
cd astra

# 2. Setup Python virtual environment
python -m venv backend\venv
.\backend\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

# 3. Setup Frontend Node dependencies
cd frontend
npm install
cd ..

# 4. Run All Automated Tests
python scripts\run_all_tests.py
```

#### macOS / Linux (Bash or Zsh)
```bash
# 1. Clone and enter directory
git clone https://github.com/your-username/astra.git
cd astra

# 2. Setup Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# 3. Setup Frontend dependencies
cd frontend
npm install
cd ..

# 4. Run All Automated Tests
python scripts/run_all_tests.py
```

### Running the Development Servers
In two separate terminal sessions:

- **Backend (FastAPI):**
  ```bash
  # Windows
  $env:PYTHONPATH='backend'; .\backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  # macOS / Linux
  export PYTHONPATH=backend && source backend/venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
  API Docs: `http://127.0.0.1:8000/docs`

- **Frontend (Vite):**
  ```bash
  cd frontend
  npm run dev
  ```
  App UI: `http://127.0.0.1:5173`

---

## 2. DESIGN SYSTEM & VISUAL ARCHITECTURE

ASTRA implements a cinematic space UI inspired by classic planetary exploration consoles:

```
┌────────────────────────────────────────────────────────────────────────┐
│  astra  [SOL 14 / 90]  [Explorer]                   [Effects: On]      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   LUNAR OUTPOST                                      ○ (Procedural     │
│   ASTRA                                                 Faux-Sphere)   │
│   ──────────────────                                                   │
│   Closed-loop life support simulator                                   │
│   [START MISSION]  (○)                                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Color Palette Tokens
Defined in `frontend/tailwind.config.js` and `frontend/src/index.css`:

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `cinematic-bg-dark` | `#060A18` | Deep space background canvas |
| `cinematic-bg-deep` | `#0A1128` | Secondary gradient space background |
| `cinematic-surface` | `#0E1736` | Card backgrounds and elevated decks |
| `cinematic-glass` | `rgba(14, 23, 54, 0.72)` | Translucent backdrop blur panels |
| `cinematic-hairline`| `rgba(170, 200, 255, 0.14)`| Thin baseline dividers and card borders |
| `cinematic-text` | `#F2F6FF` | High-contrast body typography |
| `cinematic-muted` | `#A9B6D3` | Secondary labels and metadata |
| `cinematic-cyan` | `#6FE7EE` | Primary accent, glowing rules, and active tab indicator |
| `cinematic-pill` | `#DCEBFF` | Pale button background |
| `cinematic-pill-text`| `#0A1128`| Contrast dark text inside pale buttons |
| `astra-nominal` | `#3DDC97` | Status green (always paired with icon + text) |
| `astra-caution` | `#FFB84D` | Status amber (always paired with icon + text) |
| `astra-critical` | `#FF5C6C` | Status crimson (always paired with icon + text) |

### Typography Tokens via @fontsource
- **Display Serif:** `Playfair Display` / `Cinzel` (`font-serif`) – High-contrast titles, Sol counters, and mode headings.
- **UI Sans:** `Montserrat` (`font-sans`) – Body copy, navigation links, and button labels.
- **Data Monospace:** `JetBrains Mono` (`font-mono`) – Numbers, units, mission clock, checksums, and JSON payloads.

---

## 3. PROCEDURAL PLANETARY ENGINE (2D/2.5D CANVAS + CSS)

In accordance with strict 2D/2.5D requirements (no heavy WebGL/Three.js 3D engines), planets in ASTRA are procedural faux-spheres generated via pure Canvas 2D and layered CSS:

### How `Planet.tsx` Works:
1. **Texture Synthesis (HTML5 Canvas 2D):**
   - Procedural Perlin/Simplex noise generates tileable surface variation.
   - For the Moon: multi-octave grayscale noise with crater impact rings (`ctx.arc`).
   - For Earth/Mars/Venus: custom noise palettes generating continents, oceans, and atmospheric cloud bands.
   - The texture is generated once on component mount, cached as an offscreen Canvas pattern, and painted.
2. **Infinite Rotation:**
   - The canvas texture offset scrolls continuously along the X axis inside `requestAnimationFrame`.
   - The rotation auto-pauses when the document tab is hidden (`document.hidden`) or when reduced-motion is enabled.
3. **Faux-3D Terminator & Shadow:**
   - A CSS overlay with a radial/linear gradient (`radial-gradient(circle at 35% 35%, transparent 40%, rgba(6,10,24,0.95) 85%)`) creates a realistic spherical terminator and shadow side.
4. **Atmospheric Limb Glow:**
   - Outer `box-shadow` and SVG filter blur layers produce the brilliant blue atmospheric rim light matching the reference aesthetic.

---

## 4. HOW TO ADD A NEW EVENT TO THE SIMULATION

Simulation events are deterministically managed in `backend/app/engine/events.py`. To introduce a new event:

1. **Define the Event Code & Structure:**
   In `backend/app/engine/events.py`, add your event dictionary to `EVENT_CATALOG`:
   ```python
   {
       "event_code": "EVT_MICROMETEOROID",
       "event_type": "EQUIPMENT_FAILURE",
       "severity": "MODERATE",
       "title": "Micrometeoroid Hull Puncture: Radiator Array",
       "description": "High-velocity regolith fragment punctured auxiliary thermal radiator loop.",
       "affected_systems": ["power", "thermal"],
       "requires_decision": True,
       "options": [
           {
               "option_id": "seal_loop",
               "title": "Isolate Radiator Loop & Deploy Patch",
               "description": "Vent damaged loop and seal with emergency sealant tape.",
               "trade_offs_summary": "-5 kW thermal efficiency; minimal crew risk.",
               "energy_cost": 5.0,
               "water_cost": 0.0,
               "food_cost": 0.0,
               "stress_impact": 5.0,
               "health_impact": 0.0,
               "educational_hint": "Micro-meteorite shielding utilizes Whipple bumpers to vaporize hypervelocity impacts."
           },
           {
               "option_id": "eva_weld",
               "title": "Order Emergency EVA Repair",
               "description": "Deploy two astronauts outside to weld titanium patch plate.",
               "trade_offs_summary": "Restores 100% cooling; elevates radiation and astronaut stress.",
               "energy_cost": 0.0,
               "water_cost": 0.0,
               "food_cost": 0.0,
               "stress_impact": 20.0,
               "health_impact": -5.0,
               "educational_hint": "Extravicular activity outside the Earth's magnetosphere exposes crew to acute cosmic flux."
           }
       ]
   }
   ```
2. **Add Context-Matched Educational Concept:**
   In `backend/app/engine/education.py`, map the event code to an educational takeaway in `EDUCATIONAL_CATALOG`.
3. **Run Invariant Tests:**
   Run `backend\venv\Scripts\python.exe -m pytest backend/tests` to verify determinism and physics safety.

---

## 5. AUTOMATED TESTING ARCHITECTURE

ASTRA includes a 4-tier automated test suite verifying 100% of the PRD requirements:

```
┌────────────────────────────────────────────────────────┐
│               python scripts/run_all_tests.py          │
├──────────────────────────┬─────────────────────────────┤
│ Backend Tests            │ Frontend Tests              │
│ - pytest (21 tests)      │ - vitest (21 tests)         │
│ - hypothesis (property)  │ - happy-dom environment     │
│ - verify_full_playthrough│ - Playwright E2E (10 tests) │
│ - pip-audit (security)   │ - npm audit (security)      │
└──────────────────────────┴─────────────────────────────┘
```

### Test Commands:
- **Run Everything & Generate Report:**
  ```bash
  python scripts/run_all_tests.py
  ```
- **Backend Tests Only:**
  ```bash
  python -m pytest backend/tests --cov=app --cov-report=term-missing
  ```
- **Hypothesis Invariant Tests:**
  ```bash
  python -m pytest backend/tests/test_invariants_hypothesis.py
  ```
- **Frontend Vitest Only:**
  ```bash
  cd frontend && npx vitest run
  ```
- **Playwright E2E Only:**
  ```bash
  cd frontend && npx playwright test
  ```

---

## 6. PRODUCTION DEPLOYMENT CONFIGURATIONS

### Frontend: Vercel Deployment
Create `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-service.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend: Render / Railway Deployment
Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: astra-backend
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        value: sqlite:///./astra.db
      - key: CORS_ORIGINS
        value: "*"
```

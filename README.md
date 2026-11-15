# astra-mission-trainer

**ASTRA – Mission Trainer**
**2026 NASA Space Apps Challenge Entry**

ASTRA is an interactive 2D/2.5D educational space mission simulation web application designed for beginner and intermediate STEM students. The student assumes the role of **Mission Commander** at a lunar research outpost, tasked with keeping a crew of four astronauts alive across a 90-day mission by managing six coupled survival and engineering systems: **Oxygen**, **Water**, **Energy**, **Food**, **Radiation Safety**, and **Crew Health**.

> **IMPORTANT SCIENTIFIC NOTICE & DISCLAIMER**
> Gameplay values, rates, capacities, and scoring factors are simplified educational placeholders, not verified scientific data.
> ASTRA is an independent educational project developed for the 2026 NASA Space Apps Challenge. It is **not** affiliated with, endorsed by, sponsored by, or certified by NASA.

---

## 📚 Mission Manuals & Documentation

| Document | Audience & Purpose | Link |
| :--- | :--- | :---: |
| **User & Astronaut Flight Manual** | 3-step quickstart, screen-by-screen walkthrough with screenshots, keyboard shortcuts, and qualitative ECLSS loops guide for students (12–18) and educators. | [`docs/USER_MANUAL.md`](docs/USER_MANUAL.md) |
| **Developer Architecture Manual** | Cross-platform setup, procedural planet engine (Canvas + CSS), design tokens, event authoring, test execution, and Vercel/Render deployment guide. | [`docs/DEVELOPER_MANUAL.md`](docs/DEVELOPER_MANUAL.md) |
| **Automated Test Report** | AC-01 through AC-20 full traceability matrix, pytest/hypothesis logs, vitest unit results, Playwright E2E results, and security audit logs. | [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md) |
| **Product Requirements Document** | Complete functional and non-functional specifications, screens SCR-01 to SCR-06, and system parameter register. | [`docs/ASTRA_PRD_v1.md`](docs/ASTRA_PRD_v1.md) |

---

## 1. Prerequisites

- **Python:** 3.11+ (Python 3.13 tested)
- **Node.js:** v20.18+ / npm 10+
- **Git**

---

## 2. Quickstart: How to Run Locally

Running ASTRA requires two commands in separate terminal windows (one for the backend, one for the frontend).

### Terminal 1: Backend Server (FastAPI + Deterministic Engine)

On Windows (PowerShell):
```powershell
# 1. Navigate to project root and set PYTHONPATH
$env:PYTHONPATH='backend'

# 2. Activate virtual environment (if not already activated)
.\backend\venv\Scripts\Activate.ps1

# 3. Start the FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

On macOS / Linux (bash):
```bash
# 1. Set PYTHONPATH and activate venv
export PYTHONPATH=backend
source backend/venv/bin/activate

# 2. Start the FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will be available at: `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`).

### Terminal 2: Frontend Server (React + Vite + Tailwind CSS)

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start Vite dev server on port 5173
npm run dev
```

Open your browser to: **`http://localhost:5173`**

---

## 3. How to Run Tests

### Single-Command Unified Suite (Recommended)

Run backend pytest/hypothesis tests, full 90-day playthrough integration, frontend Vitest tests, Playwright E2E tests, and dependency security audits in one command, automatically compiling `docs/TEST_REPORT.md`:

```bash
python scripts/run_all_tests.py
```

### Individual Test Suites

- **Backend Pytest & Hypothesis:**
  ```bash
  python -m pytest backend/tests --cov=app --cov-report=term-missing
  ```
- **Frontend Vitest Unit Tests:**
  ```bash
  cd frontend && npx vitest run
  ```
- **Playwright E2E Tests (Responsive Matrix & WCAG a11y):**
  ```bash
  cd frontend && npx playwright test
  ```

### Frontend Linting & Production Build

```bash
cd frontend
npm run lint    # Runs oxlint across all source files (0 warnings, 0 errors)
npm run build   # Typechecks with tsc -b and builds Vite production bundle in dist/
```

### Component Styleguide (Dev Only)

To inspect every design system token, button variant, triple-encoded status badge, arc gauge, sparkline, and astronaut card in isolation, visit:
**`http://127.0.0.1:5173/#styleguide`** (or click the *Component Styleguide* link in the landing page footer).

---

## 4. Environment Variables

### Backend Configuration (`backend/.env` or system environment)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./astra.db` | SQLAlchemy connection string (SQLite file path) |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173` | Comma-separated allowed frontend origins (or `*`) |
| `HOST` | `0.0.0.0` | Backend bind host |
| `PORT` | `8000` | Backend bind port |

### Frontend Configuration (`frontend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://127.0.0.1:8000` | Base URL of the FastAPI backend (Vite also proxies `/api` locally) |

---

## 5. Project Structure

```text
astra/
├── docs/
│   └── ASTRA_PRD_v1.md           # Source of truth Product Requirements Document
├── render.yaml                   # Deployment-ready Render Blueprint for backend
├── backend/
│   ├── requirements.txt          # Python dependencies (FastAPI, SQLAlchemy, pytest, etc.)
│   ├── .env.example              # Sample backend environment variables
│   ├── app/
│   │   ├── main.py               # FastAPI application with CORS & lifespan DB init
│   │   ├── settings.py           # Runtime environment configuration
│   │   ├── config/
│   │   │   └── parameters.py     # Parameter Register: ALL 40 PRD parameters as labeled placeholders
│   │   ├── engine/               # Pure-Python deterministic simulation engine
│   │   │   ├── types.py          # Enums and state dataclasses
│   │   │   ├── simulator.py      # 8-step daily simulation loop & failure evaluation
│   │   │   ├── events.py         # Deterministic seeded event generator & severities
│   │   │   ├── scoring.py        # Multi-factor score calculator
│   │   │   └── education.py      # PRD [FACT]-only educational feedback catalog
│   │   ├── db/
│   │   │   ├── database.py       # SQLAlchemy engine & session dependency
│   │   │   └── models.py         # Relational ORM models (Mission, Crew, Snapshot, Event, Score)
│   │   ├── schemas/
│   │   │   └── mission.py        # Pydantic v2 validation models
│   │   └── api/
│   │       └── routes.py         # REST endpoints matching PRD Section 12.3
│   └── tests/
│       ├── test_engine_determinism.py
│       ├── test_engine_physics.py
│       ├── test_engine_outcomes.py
│       └── test_api.py
├── frontend/
│   ├── package.json              # React 19, Vite 8, Tailwind CSS, Recharts, Lucide
│   ├── vercel.json               # Deployment-ready Vercel SPA rewrite configuration
│   ├── vite.config.ts            # Vite config with local /api proxy to port 8000
│   ├── tailwind.config.js        # Mission Control dark palette
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx               # Screen router & state management
│   │   ├── index.css             # Tailwind base & WCAG 2.1 AA focus / reduced-motion styles
│   │   ├── api/
│   │   │   ├── browserId.ts      # Anonymous student UUID generator (session isolation)
│   │   │   └── client.ts         # REST API client with X-Browser-Id attachment
│   │   ├── types/
│   │   │   └── mission.ts        # TypeScript interfaces matching backend models
│   │   ├── utils/
│   │   │   └── soundFx.ts        # Procedural Web Audio API synthesizer (clicks, alarms, transitions)
│   │   ├── components/
│   │   │   ├── ui/               # Standardized WCAG 2.1 AA Component Design System
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── StatusBadge.tsx   # Triple-encoded (color + icon + text label)
│   │   │   │   ├── ArcGauge.tsx      # SVG circular tachometer gauge with thresholds
│   │   │   │   ├── Sparkline.tsx     # Miniature SVG historical trajectory sparkline
│   │   │   │   ├── StatTile.tsx      # Subsystem KPI tile with gauge, delta & sparkline
│   │   │   │   ├── CrewCard.tsx      # Astronaut card with original vector helmet avatar
│   │   │   │   ├── Toast.tsx         # Accessible live notification toast container
│   │   │   │   ├── Modal.tsx         # Focus-trapped dialog overlay
│   │   │   │   ├── SlideOver.tsx     # Slide-over engineering drawer
│   │   │   │   ├── SliderWithStepper.tsx # Continuous slider with precision steppers
│   │   │   │   ├── ToggleSwitch.tsx  # Accessible role="switch" toggle
│   │   │   │   ├── Tooltip.tsx       # Accessible hover and focus tooltip
│   │   │   │   ├── SkeletonLoader.tsx # Shimmer placeholder for loading states
│   │   │   │   ├── EmptyState.tsx    # Accessible empty state container
│   │   │   │   └── ErrorStateWithRetry.tsx # Accessible error state with retry action
│   │   │   ├── LayoutHeader.tsx  # Telemetry bar, Reduced Motion toggle, Sound toggle, Info modal
│   │   │   ├── MasterAnnunciatorPanel.tsx # 12-tile aerospace caution & warning annunciator
│   │   │   ├── OutpostIsometricView.tsx # Pure SVG 2.5D lunar base with zoom & conduits
│   │   │   ├── CinematicCycleTransition.tsx # Full-screen orbital Sol progression overlay
│   │   │   ├── CrewStatusPanel.tsx # 4 astronaut vitals & live ECG lines
│   │   │   ├── ResourceTrendsChart.tsx # Recharts multi-day time series graphs
│   │   │   ├── EducationalCard.tsx # Contextual STEM explanation cards
│   │   │   └── StarfieldCanvas.tsx # Canvas background with subtle pointer parallax
│   │   └── screens/
│   │       ├── StyleguideScreen.tsx # Dev-only design system styleguide (/#styleguide)
│   │       ├── LandingPage.tsx   # SCR-01 Hero with 2.5D silhouette & mission log
│   │       ├── MissionSetup.tsx  # SCR-02 Explorer vs Commander comparison & crew preview
│   │       ├── MissionDashboard.tsx # SCR-03 3-Column Mission Control hero deck
│   │       ├── EngineeringPage.tsx  # SCR-04 Subsystem power matrix & steppers
│   │       ├── EventsPage.tsx    # SCR-05 Anomaly trade-off decision deck
│   │       └── MissionReport.tsx # SCR-06 Final score factor breakdown & debrief
└── README.md
```

---

## 6. Persistence & Hosting Note (Render & Vercel)

- **Local Storage:** By default, the backend stores mission state in a local SQLite file (`astra.db`). The database schema is initialized automatically when the backend boots.
- **Render Deployment Notice:** Container hosting platforms like Render have ephemeral root filesystems that reset on redeployment or restart. For persistent mission history on Render, you must:
  1. Attach a **Render Persistent Disk** mounted at a directory like `/var/data` (as configured in the included `render.yaml`) and set `DATABASE_URL=sqlite:////var/data/astra.db`, OR
  2. Switch the `DATABASE_URL` environment variable to a managed relational database service (such as Render PostgreSQL or Neon). Because ASTRA uses SQLAlchemy ORM models, no application code changes are needed when switching database backends.
- **Vercel Deployment:** The frontend is packaged for static edge deployment on Vercel via the included `frontend/vercel.json` rewrite file, which routes all incoming requests to `index.html`.

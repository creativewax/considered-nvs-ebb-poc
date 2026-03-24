# Ebb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side sleep wellness POC with interactive 3D orb visualisations for CSU patients.

**Architecture:** Event-driven managers with pub/sub events, mirroring the Velocity project pattern. All data is client-side fake JSON. Three.js orb with MeshPhysicalMaterial + vertex displacement + normal recalculation. Web Audio API ambient sound. Mobile-first with desktop phone-frame.

**Tech Stack:** Vite, React 19, React Router 7, Three.js, Framer Motion, GSAP, Web Audio API, Lucide React, CSS custom properties + modules.

**Specs:** `docs/prd.md`, `docs/design.md` (CSS), `docs/orb-rendering-guide.md` (Three.js)

**Reference project:** `/Users/creativewax/Dropbox/Work Dropbox/Velocity/Build` — read its source files for pattern guidance.

---

## Phase Overview

| Phase | What It Builds | Demoable? |
|-------|---------------|-----------|
| 1 | Scaffold + global styles + layout shell + routing | Yes — app frame with nav |
| 2 | Core infrastructure — EventSystem, BaseManager, DataManager, seed data | No — internal plumbing |
| 3 | Managers + hooks — Sleep, Log, Device, Orb, Sound | No — state layer |
| 4 | Home page — ambient animation + sleep summary | Yes — home screen |
| 5 | Results page — orb + metrics + hypnogram + insights | Yes — full results |
| 6 | History page — cards with CSS mini-orbs | Yes — history list |
| 7 | Profile page — wearable card + fake sync | Yes — profile + sync |
| 8 | Add sheet — overlay + log forms | Yes — logging flow |
| 9 | Sound — ambient audio engine | Yes — full experience |
| 10 | Polish — transitions, interactions, tendrils, performance | Yes — ship-ready |

---

## Phase 1: Scaffold + Layout Shell

### Task 1.1: Vite + React Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold the Vite project**

```bash
cd "/Users/creativewax/Dropbox/Work Dropbox/Considered/Novartis/NVS1124 Emerging Tech/Ebb"
npm create vite@latest . -- --template react
```

Select: React, JavaScript. If prompted about existing files, allow overwrite (it won't touch docs/).

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom framer-motion gsap three postprocessing lucide-react
npm install -D @vitejs/plugin-basic-ssl
```

- [ ] **Step 3: Configure Vite**

Replace `vite.config.js` with the config from PRD §12 — vendor chunks for react, three, ui, gsap. Add `basicSsl()` plugin, `assetsInclude` for `.frag`/`.vert` shaders.

- [ ] **Step 4: Update `.gitignore`**

Ensure `node_modules/`, `dist/`, `.env*.local` are listed. Add `firebase-debug.log`.

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server on https://localhost:5173 with default React page.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with dependencies"
```

---

### Task 1.2: Global Styles + Theme

**Files:**
- Create: `src/styles/global.css`
- Create: `src/styles/animations.css`
- Modify: `src/main.jsx` — import styles

- [ ] **Step 1: Create `src/styles/global.css`**

Copy the full custom properties block from `docs/design.md` §11.1. Include the base reset (§11.2), mobile-first responsive layout (§11.3). All colour, spacing, radius, shadow, transition, layout, z-index, and safe-area tokens.

- [ ] **Step 2: Create `src/styles/animations.css`**

Shared keyframes from `docs/design.md` §11.13: `fade-in`, `slide-up`, `breathe`, `pulse-ring`, `spin-slow`, `sync-spin`. Utility classes `.animate-fade-in`, `.animate-breathe`, `.sync-spinner`.

- [ ] **Step 3: Import styles in `src/main.jsx`**

```jsx
import './styles/global.css'
import './styles/animations.css'
```

- [ ] **Step 4: Load Inter font**

Add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 5: Verify** — dev server shows warm white background, Inter font applied to body text.

- [ ] **Step 6: Commit**

```bash
git add src/styles/ src/main.jsx index.html
git commit -m "feat: add global styles, Inter font, and animation keyframes"
```

---

### Task 1.3: Constants

**Files:**
- Create: `src/constants/routes.js`
- Create: `src/constants/events.js`
- Create: `src/constants/sleep.js`
- Create: `src/constants/colours.js`

- [ ] **Step 1: Create route constants**

```javascript
// src/constants/routes.js
export const ROUTES = {
  HOME: '/',
  RESULTS: '/results/:id',
  HISTORY: '/history',
  PROFILE: '/profile',
}

export const buildResultsPath = (id) => `/results/${id}`
```

- [ ] **Step 2: Create event constants**

```javascript
// src/constants/events.js
export const EVENTS = {
  // Sleep
  SLEEP_DATA_LOADED: 'sleep:data_loaded',
  SLEEP_RECORD_SELECTED: 'sleep:record_selected',

  // Orb
  ORB_CONFIG_UPDATED: 'orb:config_updated',

  // Logs
  LOG_ENTRY_ADDED: 'log:entry_added',
  LOG_ENTRIES_LOADED: 'log:entries_loaded',

  // Device
  DEVICE_SYNC_REQUESTED: 'device:sync_requested',
  DEVICE_SYNC_PROGRESS: 'device:sync_progress',
  DEVICE_SYNC_COMPLETE: 'device:sync_complete',
  DEVICE_STATUS_CHANGED: 'device:status_changed',

  // Sound
  SOUND_QUALITY_CHANGED: 'sound:quality_changed',
}
```

- [ ] **Step 3: Create sleep constants**

```javascript
// src/constants/sleep.js
export const QUALITY_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  FAIR: 40,
  POOR: 0,
}

export const QUALITY_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export const STAGE_NAMES = {
  light: 'Light',
  deep: 'Deep',
  rem: 'REM',
  awake: 'Awake',
}

export const scoreToQuality = (score) => {
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) return 'excellent'
  if (score >= QUALITY_THRESHOLDS.GOOD) return 'good'
  if (score >= QUALITY_THRESHOLDS.FAIR) return 'fair'
  return 'poor'
}
```

- [ ] **Step 4: Create colour constants**

```javascript
// src/constants/colours.js
export const QUALITY_COLOURS = {
  poor:      { primary: '#D0566C', accent: '#E8834A', deep: '#6B3FA0' },
  fair:      { primary: '#D4A84B', accent: '#7BAFAA' },
  good:      { primary: '#3DAA7A', accent: '#44AEC6', light: '#E8DCC8' },
  excellent: { primary: '#2E8B6E', accent: '#38A3B8' },
}

export const STAGE_COLOURS = {
  light: '#6B9BD2',
  deep:  '#2D4A7A',
  rem:   '#E8834A',
  awake: '#D0566C',
}

export const LOG_COLOURS = {
  photo:       '#6B3FA0',
  food:        '#D0566C',
  sleep_note:  '#44AEC6',
  csu_trigger: '#E8834A',
}
```

- [ ] **Step 5: Commit**

```bash
git add src/constants/
git commit -m "feat: add route, event, sleep, and colour constants"
```

---

### Task 1.4: Layout Shell + Bottom Nav + Routing

**Files:**
- Create: `src/components/layout/AppLayout.jsx`
- Create: `src/components/layout/AppLayout.module.css`
- Create: `src/components/layout/BottomNav.jsx`
- Create: `src/components/layout/BottomNav.module.css`
- Create: `src/components/layout/DesktopKeyline.jsx`
- Create: `src/components/common/PageLoader.jsx`
- Create: `src/pages/HomePage.jsx` (placeholder)
- Create: `src/pages/ResultsPage.jsx` (placeholder)
- Create: `src/pages/HistoryPage.jsx` (placeholder)
- Create: `src/pages/ProfilePage.jsx` (placeholder)
- Modify: `src/App.jsx` — routing setup

- [ ] **Step 1: Create placeholder pages**

Each page is a simple div with the page name, styled minimally. They'll be fleshed out in later phases.

```jsx
// src/pages/HomePage.jsx
export default function HomePage() {
  return <div className="page"><div className="page-content"><h1>Home</h1></div></div>
}
```

Same pattern for ResultsPage, HistoryPage, ProfilePage. ResultsPage accepts `useParams()` for the `:id`.

- [ ] **Step 2: Create BottomNav**

5-position nav matching `docs/design.md` §11.4. Icons from Lucide: Home, Clock (history), Plus (add centre), User (profile), Settings. Orange centre button. Active state from `useLocation()`. CSS module for scoping.

- [ ] **Step 3: Create AppLayout**

Shell component wrapping `<Outlet />` + `<BottomNav />`. Manages the Add sheet visibility state (just the toggle — sheet component comes in Phase 8).

- [ ] **Step 4: Create DesktopKeyline**

Decorative `::before` pseudo-element border around the app frame on desktop. Purely cosmetic, hidden on mobile.

- [ ] **Step 5: Create PageLoader**

Simple spinner/loading fallback for Suspense.

- [ ] **Step 6: Wire up routing in App.jsx**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import AppLayout from './components/layout/AppLayout'
import PageLoader from './components/common/PageLoader'
import { ROUTES } from './constants/routes'

const HomePage = lazy(() => import('./pages/HomePage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
            <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

- [ ] **Step 7: Verify** — dev server shows app shell with dark bottom nav, orange add button, page content area. Nav icons highlight on active route. Desktop shows phone-frame layout.

- [ ] **Step 8: Commit**

```bash
git add src/components/ src/pages/ src/App.jsx
git commit -m "feat: add layout shell, bottom nav, routing, and placeholder pages"
```

---

## Phase 2: Core Infrastructure

### Task 2.1: EventSystem + BaseManager

**Files:**
- Create: `src/lib/events/EventSystem.js`
- Create: `src/managers/BaseManager.js`
- Create: `src/hooks/useManagerSubscription.js`

- [ ] **Step 1: Create EventSystem**

Read Velocity's `src/lib/EventSystem.js` for reference. Simple pub/sub singleton with `on(event, callback)`, `off(event, callback)`, `emit(event, data)`. Named export.

- [ ] **Step 2: Create BaseManager**

Read Velocity's `src/managers/BaseManager.js`. Abstract base class with:
- `_state` object
- `_listeners` set
- `subscribe(listener)` / `unsubscribe(listener)`
- `_notify()` — calls all listeners with current state
- `_setState(partial)` — merges partial, notifies
- `_cleanupEvents()` — for HMR disposal

- [ ] **Step 3: Create useManagerSubscription hook**

Read Velocity's `src/hooks/useManagerSubscription.js`. React hook that subscribes to a manager on mount, unsubscribes on unmount, returns current state.

- [ ] **Step 4: Verify** — import EventSystem in `main.jsx`, emit a test event, confirm it logs. Remove test code.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ src/managers/BaseManager.js src/hooks/useManagerSubscription.js
git commit -m "feat: add EventSystem, BaseManager, and useManagerSubscription hook"
```

---

### Task 2.2: Seed Data + DataManager

**Files:**
- Create: `src/data/sleepRecords.js`
- Create: `src/data/logEntries.js`
- Create: `src/data/insights.js`
- Create: `src/managers/DataManager.js`
- Create: `src/lib/utils.js`

- [ ] **Step 1: Create utility functions**

`src/lib/utils.js` — `formatTime(minutes)`, `formatDate(dateStr)`, `generateId()`, `scoreToQuality()` (re-export from constants), `minutesToHours(mins)`.

- [ ] **Step 2: Create sleep records seed data**

`src/data/sleepRecords.js` — 12 records spanning 2 weeks. Each matches the SleepRecord shape from PRD §6.1 including `stageTimeline` arrays and `heartRateTimeline` arrays. Distribution: 2 poor, 3 fair, 4 good, 2 excellent, 1 poor. Poor nights have shorter duration, more awake time, worse vitals. Good nights have realistic 7-8h duration, healthy stage distribution. Include `source: 'wearable'` on all records.

- [ ] **Step 3: Create log entries seed data**

`src/data/logEntries.js` — ~15-20 entries scattered across sleep records. Mix of types: 3-4 food logs, 2-3 photo placeholders, 3-4 sleep notes, 5-6 CSU triggers. CSU triggers on poor nights have high `flareSeverity` (7-10) and `itchIntensity` (6-10). Good nights have low/no CSU triggers.

- [ ] **Step 4: Create insight strings**

`src/data/insights.js` — Pre-computed insight strings keyed by sleep record ID. Each record with CSU data gets 1-3 relevant insights. E.g., `{ recordId: [{ text: "...", type: 'correlation' }] }`.

- [ ] **Step 5: Create DataManager**

Singleton (not a BaseManager subclass). Loads seed data on construction. Provides the interface from PRD §7.2: `getSleepRecords()`, `getSleepRecord(id)`, `getLogEntries(sleepRecordId)`, `addLogEntry(entry)`, `getInsights(sleepRecordId)`, `revealSyncedRecords()`, `getDeviceStatus()`, `setDeviceStatus(status)`.

Internal state tracks which records are "revealed" (for the fake sync flow). Initially only 3-4 records are visible; `revealSyncedRecords()` makes all of them available.

- [ ] **Step 6: Verify** — import DataManager, call `getSleepRecords()`, confirm it returns the initial visible records. Call `revealSyncedRecords()`, confirm all 12 are now returned.

- [ ] **Step 7: Commit**

```bash
git add src/data/ src/managers/DataManager.js src/lib/utils.js
git commit -m "feat: add seed data, DataManager, and utility functions"
```

---

## Phase 3: Managers + Hooks

### Task 3.1: SleepManager + useSleep

**Files:**
- Create: `src/managers/SleepManager.js`
- Create: `src/hooks/useSleep.js`

- [ ] **Step 1: Create SleepManager**

Extends BaseManager. State: `{ records: [], selectedRecord: null, isLoading: false }`. Listens for `SLEEP_DATA_LOADED` → updates records. Listens for `SLEEP_RECORD_SELECTED` → sets selected record. Methods to load data via DataManager.

- [ ] **Step 2: Create useSleep hook**

Wraps SleepManager via `useManagerSubscription`. Returns state + action emitters: `selectRecord(id)`, `loadRecords()`.

- [ ] **Step 3: Commit**

```bash
git add src/managers/SleepManager.js src/hooks/useSleep.js
git commit -m "feat: add SleepManager and useSleep hook"
```

---

### Task 3.2: LogManager + useLogs

**Files:**
- Create: `src/managers/LogManager.js`
- Create: `src/hooks/useLogs.js`

- [ ] **Step 1: Create LogManager**

Extends BaseManager. State: `{ entries: [], isAdding: false }`. Loads entries for a record via DataManager. Handles adding new entries (in-memory).

- [ ] **Step 2: Create useLogs hook**

Returns entries for current record + `addEntry(entry)` emitter.

- [ ] **Step 3: Commit**

```bash
git add src/managers/LogManager.js src/hooks/useLogs.js
git commit -m "feat: add LogManager and useLogs hook"
```

---

### Task 3.3: DeviceManager + useDevice

**Files:**
- Create: `src/managers/DeviceManager.js`
- Create: `src/hooks/useDevice.js`

- [ ] **Step 1: Create DeviceManager**

Extends BaseManager. State: `{ connected: false, syncing: false, syncProgress: 0, lastSync: null }`. On `DEVICE_SYNC_REQUESTED` → starts a 3-second fake timer, emits progress at intervals, then emits complete. On complete → calls `DataManager.revealSyncedRecords()` and emits `SLEEP_DATA_LOADED`.

- [ ] **Step 2: Create useDevice hook**

Returns state + `requestSync()` and `connect()` emitters.

- [ ] **Step 3: Commit**

```bash
git add src/managers/DeviceManager.js src/hooks/useDevice.js
git commit -m "feat: add DeviceManager with fake sync and useDevice hook"
```

---

### Task 3.4: OrbManager + useOrb

**Files:**
- Create: `src/managers/OrbManager.js`
- Create: `src/hooks/useOrb.js`

- [ ] **Step 1: Create OrbManager**

Extends BaseManager. State: `{ config: null }`. Listens for `SLEEP_RECORD_SELECTED` → calculates visual params from sleep data. The config object maps sleep metrics to Three.js uniforms using the mapping from `docs/orb-rendering-guide.md` §4 (distort, frequency, surfaceDistort, speed values per quality tier). Also calculates material properties (roughness, clearcoat values per quality) and colour palette.

- [ ] **Step 2: Create useOrb hook**

Returns `{ config }` — the current orb visual configuration.

- [ ] **Step 3: Commit**

```bash
git add src/managers/OrbManager.js src/hooks/useOrb.js
git commit -m "feat: add OrbManager with sleep-to-visual mapping and useOrb hook"
```

---

### Task 3.5: SoundManager + useSound

**Files:**
- Create: `src/managers/SoundManager.js`
- Create: `src/hooks/useSound.js`

- [ ] **Step 1: Create SoundManager**

Extends BaseManager. State: `{ playing: false, quality: null }`. Manages a reference to the AmbientEngine (created in Phase 9). For now, just tracks state — the actual Web Audio implementation comes later.

- [ ] **Step 2: Create useSound hook**

Returns state + `play()`, `stop()` emitters.

- [ ] **Step 3: Commit**

```bash
git add src/managers/SoundManager.js src/hooks/useSound.js
git commit -m "feat: add SoundManager stub and useSound hook"
```

---

### Task 3.6: Initialise Managers in App

**Files:**
- Modify: `src/App.jsx`
- Create: `src/lib/init.js`

- [ ] **Step 1: Create init.js**

Instantiate all managers, wire up cross-manager event listeners, export singletons. Register HMR cleanup.

```javascript
// src/lib/init.js
import { sleepManager } from '../managers/SleepManager'
import { logManager } from '../managers/LogManager'
import { deviceManager } from '../managers/DeviceManager'
import { orbManager } from '../managers/OrbManager'
import { soundManager } from '../managers/SoundManager'

// Initial data load
sleepManager.loadRecords()

export { sleepManager, logManager, deviceManager, orbManager, soundManager }
```

- [ ] **Step 2: Import init.js in App.jsx**

```javascript
import './lib/init'
```

This ensures managers are created and wired on app boot.

- [ ] **Step 3: Verify** — app loads without errors. Check browser console for any manager initialisation issues.

- [ ] **Step 4: Commit**

```bash
git add src/lib/init.js src/App.jsx
git commit -m "feat: initialise all managers on app boot"
```

---

## Phase 4: Home Page

### Task 4.1: Home Page — Sleep Summary + Trend Cards

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Create: `src/components/home/SleepSummary.jsx`
- Create: `src/components/home/TrendCards.jsx`
- Create: `src/components/home/TrendCards.module.css`

- [ ] **Step 1: Create SleepSummary**

Shows last night's quality label, score, and duration. Uses `useSleep()` to get the most recent record. Quality label is colour-coded.

- [ ] **Step 2: Create TrendCards**

Two cards side by side: weekly average score + trend direction (up/down arrow). Computed from the visible sleep records.

- [ ] **Step 3: Wire into HomePage**

```jsx
export default function HomePage() {
  return (
    <div className="page">
      <div className="page-content">
        <HomeAnimation />  {/* placeholder div for now */}
        <SleepSummary />
        <TrendCards />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.jsx src/components/home/
git commit -m "feat: add home page with sleep summary and trend cards"
```

---

### Task 4.2: Home Page — Ambient Animation

**Files:**
- Create: `src/components/home/HomeAnimation.jsx`
- Create: `src/components/home/HomeAnimation.module.css`

- [ ] **Step 1: Create HomeAnimation**

The ambient background layer from `docs/design.md` §11.17. Thick filled arcs (4 coloured crescent shapes) positioned absolutely, animated with GSAP for slow organic drift. Radial spirograph SVG lines at 6% opacity. Central breathing logo element. All wrapped in a `pointer-events: none` container.

GSAP timeline: each arc rotates slowly on different axes at different speeds (8-15s per full rotation). Use `gsap.to()` with `repeat: -1` and `ease: 'none'` for continuous motion.

- [ ] **Step 2: Verify** — home page shows gentle, drifting coloured arcs behind the sleep summary. Desktop frame looks premium.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeAnimation.jsx src/components/home/HomeAnimation.module.css
git commit -m "feat: add ambient home animation with GSAP-driven arcs"
```

---

## Phase 5: Results Page — The Star of the Show

### Task 5.1: Three.js Orb — Scene + Material + Displacement

**Files:**
- Create: `src/lib/three/OrbScene.js`
- Create: `src/lib/three/OrbGeometry.js`
- Create: `src/lib/three/shaders/orb.vert`
- Create: `src/lib/three/shaders/orb.frag`
- Create: `src/lib/three/shaders/noise.glsl`
- Create: `src/lib/three/shaders/displacement.glsl`

This is the most complex task. Follow `docs/orb-rendering-guide.md` precisely.

- [ ] **Step 0: Download environment map**

Download a soft studio HDRI from [Poly Haven](https://polyhaven.com/hdris) (e.g., "studio_small_09" or similar soft lighting). Save as `public/env/studio.hdr` (or `.jpg` for smaller filesize). This MUST be done before the orb scene — the visual quality depends on it.

- [ ] **Step 1: Create noise.glsl**

Stefan Gustavson's periodic classic Perlin 3D noise (`pnoise`). This is a well-known shader — adapt from the orb rendering guide §4.

- [ ] **Step 2: Create displacement.glsl**

The displacement function `f()` and normal recalculation from orb rendering guide §4 and §5. Includes `orthogonal()` helper, two-layer noise (goo + surface), pole attenuation, neighbour-sampling normal fix.

- [ ] **Step 3: Create OrbGeometry.js**

Creates a `THREE.SphereGeometry(1, 256, 256)`. Exports a function that returns the geometry.

- [ ] **Step 4: Create OrbScene.js**

The full Three.js scene setup:
- WebGLRenderer with ACESFilmic tone mapping, sRGB output, alpha: true, antialias, pixel ratio capped at 1.5
- PerspectiveCamera FOV 40, position (0, 0, 4)
- Scene with environment map (load a soft studio HDRI from `/public/env/` — source one from Poly Haven or use a simple equirectangular photo)
- MeshPhysicalMaterial with `onBeforeCompile` injecting the displacement + normal fix shaders
- Custom uniforms: time, distort, frequency, speed, surfaceDistort, surfaceFrequency, surfaceSpeed, numberOfWaves, fixNormals, surfacePoleAmount, gooPoleAmount
- AmbientLight (0.2) + SpotLight (0.5, penumbra 1)
- Post-processing: EffectComposer with bloom (threshold 0.15, intensity 0.4) + vignette (darkness 0.25)
- Animation loop advancing time uniforms
- OrbitControls for touch/drag rotation
- `updateConfig(config)` method to transition uniforms/material when sleep data changes
- `mount(container)` / `unmount()` / `dispose()` lifecycle

- [ ] **Step 5: Verify** — create a temporary test page that mounts the orb scene. Confirm a smooth, reflective sphere renders with environment map reflections. Tweak distort uniform to verify displacement works.

- [ ] **Step 6: Commit**

```bash
git add src/lib/three/ public/env/
git commit -m "feat: add Three.js orb with PBR material, displacement, and normal recalculation"
```

---

### Task 5.2: Orb React Component

**Files:**
- Create: `src/components/orb/OrbCanvas.jsx`
- Create: `src/components/orb/OrbCanvas.module.css`
- Create: `src/components/orb/OrbFallback.jsx`

- [ ] **Step 1: Create OrbCanvas**

React component that:
- Creates OrbScene on mount, passes container ref
- Uses `useOrb()` to get config, calls `orbScene.updateConfig(config)` on change
- Handles WebGL detection — renders OrbFallback if not supported
- Cleans up on unmount

- [ ] **Step 2: Create OrbFallback**

CSS-only fallback — radial gradient circle with quality colours and a breathing animation. From `docs/design.md` §11.12.

- [ ] **Step 3: Commit**

```bash
git add src/components/orb/
git commit -m "feat: add OrbCanvas React wrapper with WebGL fallback"
```

---

### Task 5.3: Results Page — Charts + Metrics

**Files:**
- Create: `src/components/charts/Hypnogram.jsx`
- Create: `src/components/charts/Hypnogram.module.css`
- Create: `src/components/common/ProgressRing.jsx`
- Create: `src/components/results/MetricsRow.jsx`
- Create: `src/components/results/ResultsHeader.jsx`

- [ ] **Step 1: Create ProgressRing**

SVG circular progress ring from `docs/design.md` §11.7. Props: `value`, `max`, `colour`, `label`, `size`. Dual-ring option (orange outer accent ring). Animated stroke-dashoffset.

- [ ] **Step 2: Create MetricsRow**

Row of 4 ProgressRings: Score, Duration, Deep %, REM %. Colours from `QUALITY_COLOURS` based on the record's quality.

- [ ] **Step 3: Create Hypnogram**

Canvas-rendered stepped line chart. X-axis: time (bedtime to wake). Y-axis: sleep stage levels (Awake top, Deep bottom). Draws coloured stepped segments from `record.stageTimeline`. Legend with coloured squares below.

- [ ] **Step 4: Create ResultsHeader**

Back button (ChevronLeft), title "[Quality] Sleep, [Date]", Connected badge, share + settings icons (non-functional for POC).

- [ ] **Step 5: Commit**

```bash
git add src/components/charts/ src/components/common/ProgressRing.jsx src/components/results/
git commit -m "feat: add hypnogram, progress rings, metrics row, and results header"
```

---

### Task 5.4: Results Page — Insights + Expandables + Assembly

**Files:**
- Create: `src/components/results/InsightCards.jsx`
- Create: `src/components/common/Expandable.jsx`
- Create: `src/components/results/ExpandableStats.jsx`
- Create: `src/components/charts/HeartRateChart.jsx`
- Modify: `src/pages/ResultsPage.jsx`

- [ ] **Step 1: Create Expandable**

Reusable collapsible section from `docs/design.md` §11.10. Framer Motion AnimatePresence for smooth open/close. ChevronDown icon rotates on open.

- [ ] **Step 2: Create HeartRateChart**

Simple canvas line chart plotting `heartRateTimeline` data. Time on X, BPM on Y. Quality-coloured line.

- [ ] **Step 3: Create ExpandableStats**

Three expandable sections: Heart Rate (chart), HRV (value + trend), Respiratory Rate (value + baseline comparison). Plus a Logs section showing any log entries for this record.

- [ ] **Step 4: Create InsightCards**

Renders CSU insight strings from DataManager. Styled cards from `docs/design.md` §11.15 with lightbulb icon (Lightbulb from Lucide), tinted background per quality.

- [ ] **Step 5: Assemble ResultsPage**

```jsx
export default function ResultsPage() {
  const { id } = useParams()
  const { selectedRecord, selectRecord } = useSleep()
  const { config } = useOrb()

  useEffect(() => { selectRecord(id) }, [id])

  if (!selectedRecord) return <PageLoader />

  return (
    <div className="page">
      <ResultsHeader record={selectedRecord} />
      <OrbCanvas config={config} />
      <MetricsRow record={selectedRecord} />
      <Hypnogram timeline={selectedRecord.stageTimeline} bedtime={selectedRecord.bedtime} wakeTime={selectedRecord.wakeTime} />
      <InsightCards recordId={id} />
      <ExpandableStats record={selectedRecord} />
    </div>
  )
}
```

- [ ] **Step 6: Verify** — navigate to a results page. Orb renders with correct quality, metrics show, hypnogram draws stages, insights appear for CSU records.

- [ ] **Step 7: Commit**

```bash
git add src/components/results/ src/components/common/Expandable.jsx src/components/charts/HeartRateChart.jsx src/pages/ResultsPage.jsx
git commit -m "feat: assemble results page with orb, charts, insights, and expandable stats"
```

---

## Phase 6: History Page

### Task 6.1: History Cards + Mini-Orbs

**Files:**
- Create: `src/components/history/MiniOrb.jsx`
- Create: `src/components/history/MiniOrb.module.css`
- Create: `src/components/history/HistoryCard.jsx`
- Create: `src/components/history/HistoryCard.module.css`
- Modify: `src/pages/HistoryPage.jsx`

- [ ] **Step 1: Create MiniOrb**

Animated CSS orb from `docs/design.md` §11.16. Gradient circle with quality colours (set via inline style). Rotating conic-gradient noise layer. Speed/opacity varies by quality (poor = fast/opaque, excellent = slow/subtle).

- [ ] **Step 2: Create HistoryCard**

Card from `docs/design.md` §11.11. Shows MiniOrb, date, quality label (colour-coded), score, duration. Navigates to `/results/:id` on tap. Whisper-soft shadow, press state removes it.

- [ ] **Step 3: Assemble HistoryPage**

Uses `useSleep()` to get all records, sorted by date descending. Maps to HistoryCards. Framer Motion stagger animation on mount.

- [ ] **Step 4: Verify** — history page shows list of cards with coloured mini-orbs. Tapping a card navigates to results.

- [ ] **Step 5: Commit**

```bash
git add src/components/history/ src/pages/HistoryPage.jsx
git commit -m "feat: add history page with animated CSS mini-orbs"
```

---

## Phase 7: Profile Page

### Task 7.1: Wearable Card + Fake Sync

**Files:**
- Create: `src/components/profile/WearableCard.jsx`
- Create: `src/components/profile/SyncButton.jsx`
- Create: `src/components/profile/Settings.jsx`
- Modify: `src/pages/ProfilePage.jsx`

- [ ] **Step 1: Create WearableCard**

From `docs/design.md` §11.14. Shows "Apple Watch", connected status dot, last sync time. Uses `useDevice()`.

- [ ] **Step 2: Create SyncButton**

Orange button that triggers `requestSync()`. Shows spinner while syncing, progress percentage. Disabled while syncing.

- [ ] **Step 3: Create Settings**

Simple settings display: Sleep Target (8h, static), Notifications (On, static). About section with version 0.1.0 (POC).

- [ ] **Step 4: Assemble ProfilePage**

WearableCard + SyncButton + Settings. After sync completes, the history and home pages should show more records.

- [ ] **Step 5: Verify** — profile page shows wearable status. Tapping Sync Now runs the 3-second animation, then records become available in history.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/ src/pages/ProfilePage.jsx
git commit -m "feat: add profile page with wearable card and fake sync"
```

---

## Phase 8: Add Sheet

### Task 8.1: Add Sheet Overlay + Log Forms

**Files:**
- Create: `src/components/add/AddSheet.jsx`
- Create: `src/components/add/AddSheet.module.css`
- Create: `src/components/add/LogForm.jsx`
- Create: `src/components/add/CsuTriggerForm.jsx`
- Modify: `src/components/layout/AppLayout.jsx` — wire sheet toggle

- [ ] **Step 1: Create AddSheet**

Framer Motion slide-up overlay from `docs/design.md` §11.5. Dark sheet with "Add" title, 4 log categories with coloured dots, close button. Tapping a category sets the active form type.

- [ ] **Step 2: Create LogForm**

Simple form for photo/food/sleep_note types: text area + submit. For photo, a placeholder image area. Calls `useLogs().addEntry()` on submit. Dismisses sheet on success.

- [ ] **Step 3: Create CsuTriggerForm**

Extended form for CSU triggers: flare severity slider (1-10), itch intensity slider (1-10), hives toggle, antihistamine toggle + time, stress level (1-5), notes textarea. Styled with range inputs and toggles.

- [ ] **Step 4: Wire into AppLayout**

BottomNav's centre button toggles sheet visibility. Sheet renders inside AppLayout via AnimatePresence.

- [ ] **Step 5: Verify** — tapping the orange + button opens the dark sheet. Selecting CSU Trigger shows the extended form. Submitting a log entry closes the sheet and the entry appears in the results page expandable logs section.

- [ ] **Step 6: Commit**

```bash
git add src/components/add/ src/components/layout/AppLayout.jsx
git commit -m "feat: add sheet overlay with log forms and CSU trigger form"
```

---

## Phase 9: Ambient Sound

### Task 9.1: Web Audio Engine

**Files:**
- Create: `src/lib/audio/AmbientEngine.js`
- Modify: `src/managers/SoundManager.js` — wire to AmbientEngine

- [ ] **Step 1: Create AmbientEngine**

Web Audio API class. Creates AudioContext (lazy — on first user interaction to satisfy browser autoplay policy). Builds an oscillator + filter chain:
- 2-3 oscillators (sine, triangle) at different base frequencies
- BiquadFilter (lowpass) — cutoff frequency shifts with quality
- GainNode for volume control
- Quality-to-sound mapping from PRD §5.7:
  - Excellent: low frequencies (80-200Hz), smooth sine, low filter cutoff
  - Poor: higher frequencies (300-800Hz), added noise oscillator, high filter cutoff, slight detune for dissonance
- `setQuality(quality)` — crossfades parameters over 1-2 seconds
- `start()` / `stop()` with fade in/out

- [ ] **Step 2: Wire SoundManager to AmbientEngine**

SoundManager creates AmbientEngine on first play request. Listens for `SLEEP_RECORD_SELECTED` → calls `engine.setQuality(quality)`. Listens for route changes to stop on non-results pages.

- [ ] **Step 3: Verify** — navigate to results page, hear ambient sound that changes when switching between good and poor sleep records.

- [ ] **Step 4: Commit**

```bash
git add src/lib/audio/ src/managers/SoundManager.js
git commit -m "feat: add Web Audio ambient engine with quality-driven sound morphing"
```

---

## Phase 10: Polish

### Task 10.1: Page Transitions

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/*.jsx`

- [ ] **Step 1: Add Framer Motion page transitions**

Wrap route content with `<AnimatePresence>` and `<motion.div>` using the page variants from `docs/design.md` §11.13:
```javascript
const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.15 } }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx src/pages/
git commit -m "feat: add Framer Motion page transitions"
```

---

### Task 10.2: Orb Interaction Polish

**Files:**
- Modify: `src/lib/three/OrbScene.js`

- [ ] **Step 1: Add tap-to-pulse**

On click/tap, trigger a GSAP tween that briefly increases `distort` uniform by 0.15, then eases back. Creates a ripple/pulse effect.

- [ ] **Step 2: Add press-and-hold**

On pointerdown (held > 500ms), slow orbit rotation speed. On release, restore. Optional: highlight specific metric tendrils.

- [ ] **Step 3: Smooth transitions between records**

When `updateConfig()` is called, GSAP tween all uniforms + material properties to new values over 0.8s instead of snapping. This creates a smooth morph when navigating between nights.

- [ ] **Step 4: Commit**

```bash
git add src/lib/three/OrbScene.js
git commit -m "feat: add orb tap-pulse, press-hold, and smooth transitions"
```

---

### Task 10.3: Tendril System

**Files:**
- Create: `src/lib/three/TendrilSystem.js`
- Modify: `src/lib/three/OrbScene.js` — integrate tendrils

- [ ] **Step 1: Create TendrilSystem**

Instanced geometry (thin cylinders or lines) extending from the sphere surface. Count and behaviour driven by sleep data:
- REM % → more flowing tendrils
- Poor quality → more chaotic, tangled tendrils
- Good quality → sparse, graceful tendrils

Uses InstancedMesh with per-instance transforms updated each frame. Each tendril has a base point on the sphere, extends outward following a noise-perturbed path.

- [ ] **Step 2: Integrate into OrbScene**

Add TendrilSystem to the scene. Update tendril config when `updateConfig()` is called.

- [ ] **Step 3: Commit**

```bash
git add src/lib/three/TendrilSystem.js src/lib/three/OrbScene.js
git commit -m "feat: add instanced tendril system extending from orb"
```

---

### Task 10.4: Final Touches

**Files:**
- Various

- [ ] **Step 1: Stagger animations on history cards** — Framer Motion `variants` with `staggerChildren: 0.05`
- [ ] **Step 2: Loading states** — PageLoader shown during lazy page loads and data fetches
- [ ] **Step 3: Empty states** — "No sleep data yet" message on home/history before first sync
- [ ] **Step 4: Browser tab title** — `document.title` updates per page ("Ebb — Home", "Ebb — Results", etc.)
- [ ] **Step 5: Responsive verification** — test phone-frame on desktop, full-width on mobile, safe areas on notched devices
- [ ] **Step 6: Performance check** — ensure orb maintains 60fps on mobile, reduce sphere segments if needed (try 128)

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: polish — stagger animations, loading states, responsive fixes"
```

---

## Post-Implementation

- [ ] Run through the full demo flow: Home → Sync → History → Results (good) → Results (poor) → Add CSU Trigger → Profile
- [ ] Verify orb quality difference is visually dramatic between good and poor nights
- [ ] Verify sound morphs correctly
- [ ] Verify desktop phone-frame looks premium
- [ ] Verify CSU insight cards appear on relevant records

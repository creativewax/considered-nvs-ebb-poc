# Ebb — Product Requirements Document

> **Client:** Novartis (NVS1124 Emerging Tech)
> **Type:** Proof of Concept
> **Date:** 2026-03-24
> **Version:** 1.0

---

## 1. Purpose

Ebb is a sleep wellness POC for **Chronic Spontaneous Urticaria (CSU)** patients. CSU causes unpredictable hives and intense itching that severely disrupt sleep — and poor sleep worsens flare-ups, creating a vicious cycle.

Ebb visualises this relationship by transforming sleep metrics into a living 3D orb. A perfect night produces a **smooth, near-perfect sphere**. A night wrecked by CSU symptoms produces a **chaotic, distorted mass**. The orb makes the impact of CSU on sleep visceral and immediate — felt, not just read.

Users log CSU-specific triggers (flare severity, itch intensity, antihistamine timing) alongside standard sleep data. The app surfaces correlations between triggers and sleep quality through insight cards.

**This is a client-facing POC.** All data is fake, pre-seeded on the client. There is no backend, no database, no authentication, no real wearable integration.

---

## 2. Target Audience

- Novartis stakeholders evaluating an emerging tech concept
- CSU patients (represented via demo walkthrough)
- The app will be demoed on mobile devices and desktop browsers

---

## 3. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Build | Vite | Latest | Code-splitting, vendor chunks, HTTPS dev |
| Frontend | React | 19.x | JavaScript — no TypeScript |
| Routing | React Router | 7.x | Lazy-loaded pages, Suspense |
| 3D | Three.js | Latest | Custom shaders, noise displacement |
| Animation | Framer Motion | Latest | Page transitions, sheet, expandables |
| Animation (adv) | GSAP | Latest | Orb interactions, home arcs, timelines |
| Audio | Web Audio API | Native | Ambient sound morphing with sleep quality |
| State | EventSystem + Managers | Custom | Decoupled, event-driven (see §7) |
| CSS | Custom properties + modules | Native | Light theme, mobile-first (see §10) |
| Icons | Lucide React | Latest | Consistent icon set |

**No backend.** No Express, no Firebase, no Axios, no Zod, no API client, no database. All data lives in `src/data/` as static JavaScript objects.

---

## 4. Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Logo, ambient animation, last night summary, weekly average, trend |
| `/results/:id` | Results | Hero orb + sound + metrics + hypnogram + CSU insights for one night |
| `/history` | History | Scrollable list of past nights with animated CSS mini-orbs |
| `/profile` | Profile | Wearable connection status, fake sync, settings, about |

### Navigation

- **Bottom nav bar** — dark charcoal, 5 positions: Home, History, (Add centre), Profile, Settings (navigates to `/profile` — Settings is a section within Profile, not its own route)
- **Centre button** — orange, slightly raised, opens the Add sheet overlay
- **Add sheet** — dark overlay sliding up from the nav with CSU-aware log categories
- **Page transitions** — Framer Motion fade/slide (see §10.13 for variants)

---

## 5. The Orb

### 5.1 Core Concept

A Three.js organic form that morphs from a smooth sphere to a chaotic mass based on sleep quality. Tendrils extend from the core sphere from day one — crystalline growths are saved for a later pass.

**Inspiration:** [Blobmixer by 14islands](https://blobmixer.14islands.com) — evolved with organic tendrils and CSU-specific surface effects.

### 5.2 Sphere-to-Chaos Spectrum

| Sleep Quality | Score | Orb Form | Behaviour |
|---------------|-------|----------|-----------|
| **Excellent** | 85-100 | Near-perfect smooth sphere | Minimal surface noise. Cool colours (teal, cream). Gentle breathing pulse. Serene. |
| **Good** | 70-84 | Slightly organic sphere, soft undulations | Smooth flowing surface. Greens and teals. Calm drift. Sparse, graceful tendrils. |
| **Fair** | 40-69 | Visibly deformed, uneven surface | Mixed flow with turbulence. Warm-to-cool gradient. Medium density tendrils. |
| **Poor** | 0-39 | Heavily distorted, chaotic mass | Tangled strands, jagged spikes. Hot colours (red, orange, purple). Rapid, erratic movement. Dense, knotted core. |

### 5.3 Data-to-Visual Mapping

| Metric | Visual Property |
|--------|----------------|
| **Overall score** (0-100) | **Core shape** — perfect sphere (100) progressively distorts to chaotic mesh (0). Dominant visual driver. |
| **Duration** | Orb scale — larger for longer sleep |
| **Deep sleep %** | Core density/solidity — more deep = denser, grounded core |
| **REM %** | Tendril activity — more REM = flowing, dream-like extensions |
| **Light sleep %** | Transparency/opacity of outer layers |
| **Awake time** | Spike/jag frequency — more awake = sharp surface disruptions |
| **Heart rate** | Pulse rhythm — the orb breathes at the user's average resting HR |
| **HRV** | Smoothness of movement — high HRV = fluid, low HRV = jerky |
| **CSU severity** (if logged) | Surface irritation — red-hot patches/fractures, more intense with worse flare-ups |

### 5.4 Colour Palette

```
Poor (0-39)        → Reds, oranges, deep purples (#D0566C, #E8834A, #6B3FA0)
Fair (40-69)       → Ambers, warm teals (#D4A84B, #7BAFAA)
Good (70-84)       → Teals, greens, soft cream (#3DAA7A, #44AEC6, #E8DCC8)
Excellent (85-100) → Deep teal, serene blue-green (#2E8B6E, #38A3B8)
```

### 5.5 Interaction

- **Auto-rotate** — slow rotation on its own
- **Touch/drag to rotate** — user can spin freely
- **Pinch/scroll to zoom** — inspect organic structures
- **Tap to pulse** — ripple animation revealing more detail
- **Press and hold** — slows rotation, highlights individual metric contributions (e.g., REM tendrils glow)

### 5.6 Technical Approach

> Full implementation reference: [`docs/orb-rendering-guide.md`](./orb-rendering-guide.md)

The rendering quality is achieved through these specific techniques (derived from blobmixer source analysis):

- **MeshPhysicalMaterial** with `clearcoat: 1`, `roughness: 0.14`, `metalness: 0` — wet, organic dual-layer PBR
- **Custom vertex displacement** via `onBeforeCompile` — periodic Perlin noise deforms the sphere
- **Normal recalculation after displacement** — THE critical technique. Samples two neighbouring vertices, displaces them with the same function, computes cross product for true surface normals. Without this, lighting is completely wrong.
- **Real photograph environment map** — equirectangular JPEG converted to cube render target. Provides naturalistic reflections.
- **Two-layer noise** — large "goo" layer (organic shape) + fine "surface" layer (wave-like ridges), each with independent animation speed
- **Pole attenuation** — smoothstep/sin reduces displacement at poles to prevent artefacts
- **Post-processing** — subtle bloom (catches clearcoat specular highlights) + mild vignette. Skip scanlines/noise for clean medical aesthetic.
- **High geometry resolution** — SphereGeometry(1, 256, 256) = ~130K vertices for smooth organic curves
- **Renderer** — ACESFilmic tone mapping, sRGB output, FOV 40 (narrow = product-photography feel), pixel ratio capped at 1.5
- **Performance** — WebGL capability detection, graceful CSS fallback, requestAnimationFrame throttling

### 5.7 Ambient Sound

Web Audio API layer that shifts with sleep quality. Always present on results, subtle on home.

| Quality | Sound |
|---------|-------|
| **Excellent** | Soft warm drone, gentle sine waves, deep breathing rhythm |
| **Good** | Calm ambient tones, subtle harmonic movement, light shimmer |
| **Fair** | Unsettled warmth, occasional dissonant undertone |
| **Poor** | Scratchy, agitated texture, high-frequency crackle (CSU irritation metaphor), irregular rhythm |

- Crossfades smoothly when navigating between nights
- Uses oscillators + filters (no audio file dependencies)

---

## 6. Data Model

All data is client-side, defined in `src/data/`.

### 6.1 Sleep Record

```javascript
{
  id,                    // String — unique identifier
  date,                  // String — 'YYYY-MM-DD'
  source,                // 'wearable' | 'manual'
  syncedAt,              // Date | null

  // Duration
  bedtime,               // String — 'HH:mm'
  wakeTime,              // String — 'HH:mm'
  totalDuration,         // Number — minutes in bed
  sleepDuration,         // Number — minutes actually asleep

  // Stages (minutes)
  lightSleep,
  deepSleep,
  remSleep,
  awakeTime,

  // Stage timeline (for hypnogram)
  stageTimeline,         // Array<{ start: 'HH:mm', end: 'HH:mm', stage: 'light'|'deep'|'rem'|'awake' }>

  // Vitals
  avgHeartRate,          // Number — bpm
  minHeartRate,          // Number — bpm
  hrv,                   // Number — ms
  respiratoryRate,       // Number — breaths/min

  // Heart rate over time (for chart)
  heartRateTimeline,     // Array<{ time: 'HH:mm', bpm: Number }>

  // Computed
  score,                 // Number — 0-100
  quality,               // 'poor' | 'fair' | 'good' | 'excellent'
}
```

### 6.2 Log Entry

```javascript
{
  id,
  sleepRecordId,         // String | null
  type,                  // 'photo' | 'food' | 'sleep_note' | 'csu_trigger'
  content,               // String — text content
  imageUrl,              // String | null — placeholder for 'photo' type
  createdAt,             // Date
}
```

### 6.3 CSU Trigger (nested in LogEntry when type = 'csu_trigger')

```javascript
{
  flareSeverity,         // Number — 1-10
  itchIntensity,         // Number — 1-10
  hivesPresent,          // Boolean
  antihistamineTaken,    // Boolean
  antihistamineTime,     // String | null — 'HH:mm'
  stressLevel,           // Number — 1-5
  notes,                 // String
}
```

### 6.4 Fake Data Requirements

- **10-14 pre-seeded sleep records** spanning two weeks
- **Distribution:** 2-3 poor, 3-4 fair, 3-4 good, 1-2 excellent
- **CSU correlation:** poor sleep nights paired with high-severity CSU triggers
- **Simulated wearable sync:** client-side timer reveals pre-seeded data progressively
- **Log entries:** scattered across records — food logs, placeholder photos, sleep notes, CSU triggers
- **Realistic stage timelines:** plausible distributions per quality level
- **Heart rate timelines:** 5-minute interval data points across each night

---

## 7. Architecture

### 7.1 Pattern — Event-Driven Managers

Identical to the Velocity project pattern. Components never import managers directly.

```
User Action → Hook emits event → Manager listens, updates state
  → Manager emits result event → useManagerSubscription re-renders component
```

### 7.2 DataManager — Fake JSON Database

All managers access data through a central `DataManager` that wraps the static seed files (`src/data/`) with a database-like interface. This keeps the fake data layer isolated — if this ever becomes a real app, you swap `DataManager` for a real API client without touching any other manager.

```javascript
// DataManager provides:
dataManager.getSleepRecords()              // → all records (or only "synced" ones)
dataManager.getSleepRecord(id)             // → single record by id
dataManager.getLogEntries(sleepRecordId)   // → logs for a specific night
dataManager.addLogEntry(entry)             // → writes to in-memory state
dataManager.getInsights(sleepRecordId)     // → CSU insight strings for a record
dataManager.revealSyncedRecords()          // → marks pre-seeded records as "synced" (fake wearable)
dataManager.getDeviceStatus()              // → { connected, lastSync }
dataManager.setDeviceStatus(status)        // → update connection state
```

**State is in-memory only.** New log entries persist for the session but are lost on refresh. The seed data reloads fresh each time — this is fine for a POC demo.

DataManager is a singleton (not a BaseManager subclass). It does not emit events or hold subscribed state — it is a pure data access layer. Managers call it, then emit their own events with the results.

### 7.3 Managers

| Manager | Responsibility |
|---------|---------------|
| `DataManager` | In-memory fake DB wrapping seed JSON. CRUD-like interface. No events. |
| `SleepManager` | Sleep records via DataManager, record selection, data access |
| `OrbManager` | Visual parameter calculation from sleep data (shape, colour, noise, tendrils) |
| `LogManager` | Log entries via DataManager, CSU trigger data, add/list operations |
| `SoundManager` | Web Audio API ambient sound, morphs with sleep quality |
| `DeviceManager` | Fake wearable connection state, simulated sync via DataManager |

### 7.3 Event Flow — Wearable Sync

```
User taps "Sync Now"
  → useDevice() emits DEVICE_SYNC_REQUESTED
  → DeviceManager starts fake timer, emits DEVICE_SYNC_PROGRESS (0%...100%)
  → DeviceManager emits DEVICE_SYNC_COMPLETE
  → SleepManager reveals pre-seeded records, emits SLEEP_DATA_LOADED
  → OrbManager calculates visual params, emits ORB_CONFIG_UPDATED
  → SoundManager crossfades to match new quality
  → UI re-renders
```

### 7.4 Event Flow — Navigate to Results

```
User taps history card
  → Router navigates to /results/:id
  → useSleep() selects record by id, emits SLEEP_RECORD_SELECTED
  → OrbManager recalculates params, emits ORB_CONFIG_UPDATED
  → SoundManager crossfades audio
  → Three.js scene transitions orb shape/colour
  → Charts populate with record data
```

### 7.5 Hooks

| Hook | Wraps | Returns |
|------|-------|---------|
| `useManagerSubscription(manager)` | BaseManager subscribe/unsubscribe | Current state |
| `useSleep()` | SleepManager | Records, selected record, actions |
| `useOrb()` | OrbManager | Visual config (shape, colour, noise, tendrils) |
| `useLogs()` | LogManager | Entries for a record, add action |
| `useSound()` | SoundManager | Play/stop, current quality |
| `useDevice()` | DeviceManager | Connection status, sync progress, sync action |

---

## 8. Folder Structure

```
src/
  constants/
    routes.js             # Route paths
    events.js             # All event name constants
    sleep.js              # Score thresholds, stage names, quality labels
    colours.js            # Quality colour maps, stage colours
  data/
    sleepRecords.js       # 10-14 pre-seeded sleep records
    logEntries.js         # Pre-seeded log entries + CSU triggers
    insights.js           # Pre-computed CSU insight strings
  lib/
    events/
      EventSystem.js      # Pub/sub singleton
    utils.js              # Pure utilities (formatTime, scoreToQuality, etc.)
    three/
      OrbScene.js         # Three.js scene setup, camera, renderer, post-processing
      OrbGeometry.js      # Sphere mesh with noise displacement shader
      TendrilSystem.js    # Instanced tendrils extending from core
      shaders/
        orb.vert          # Vertex shader — noise-based displacement
        orb.frag          # Fragment shader — quality-driven colour
      noise.js            # Simplex noise implementation
    audio/
      AmbientEngine.js    # Web Audio API oscillators, filters, crossfade
  managers/
    BaseManager.js        # Abstract base — state, subscribe, emit, HMR cleanup
    DataManager.js        # Singleton fake DB — wraps seed JSON, in-memory CRUD
    SleepManager.js
    OrbManager.js
    LogManager.js
    SoundManager.js
    DeviceManager.js
  hooks/
    useManagerSubscription.js
    useSleep.js
    useOrb.js
    useLogs.js
    useSound.js
    useDevice.js
  components/
    layout/
      AppLayout.jsx       # App shell — content area + bottom nav
      AppLayout.module.css
      BottomNav.jsx       # 5-position nav with orange centre button
      BottomNav.module.css
      DesktopKeyline.jsx  # Decorative border (desktop only)
    common/
      Badge.jsx           # Connected badge, quality badges
      ProgressRing.jsx    # SVG circular progress with dual-ring option
      Expandable.jsx      # Collapsible section with Framer Motion
      Sheet.jsx           # Bottom sheet overlay (Add menu)
      Card.jsx            # Base card with quality tint variants
    orb/
      OrbCanvas.jsx       # Three.js canvas mount + interaction handlers
      OrbCanvas.module.css
      OrbFallback.jsx     # CSS fallback when WebGL unavailable
    charts/
      Hypnogram.jsx       # Stepped line chart — sleep stages over time
      Hypnogram.module.css
      HeartRateChart.jsx  # Line chart — HR across the night
      ProgressRing.jsx    # (re-exported from common for convenience)
    home/
      HomeAnimation.jsx   # Ambient arcs + radial + breathing logo (GSAP)
      HomeAnimation.module.css
      SleepSummary.jsx    # Last night summary card
      TrendCards.jsx      # Weekly average + trend
    results/
      ResultsHeader.jsx   # Back button, title, badge, share/settings icons
      MetricsRow.jsx      # Row of 4 circular progress rings
      InsightCards.jsx    # CSU correlation insight cards
      ExpandableStats.jsx # HR, HRV, respiratory rate, efficiency
    history/
      HistoryCard.jsx     # Card with mini-orb, date, quality, stats
      MiniOrb.jsx         # Animated CSS orb (gradient + rotating noise)
      MiniOrb.module.css
    add/
      AddSheet.jsx        # Sheet content — log category list
      LogForm.jsx         # Simple form per category (text + optional photo)
    profile/
      WearableCard.jsx    # Connection status + sync button
      SyncButton.jsx      # Fake sync with progress animation
      Settings.jsx        # Sleep target, about
  pages/
    HomePage.jsx
    ResultsPage.jsx
    HistoryPage.jsx
    ProfilePage.jsx
  styles/
    global.css            # Custom properties, reset, responsive, theme
    animations.css        # Shared keyframes
```

---

## 9. Screens

### 9.1 Home

- Ambient organic animation behind everything (thick filled arcs drifting slowly, radial spirograph lines, breathing logo)
- Last night's sleep: quality label, score, duration
- Weekly average card + trend indicator
- Bottom nav

### 9.2 Results

- Header: back button, "[Quality] Sleep, [Date]", share icon, settings icon
- Connected badge (green)
- **Hero orb** — interactive Three.js canvas (drag, zoom, tap, hold)
- **Ambient sound** — plays on enter, morphs with quality
- **Metrics row** — 4 circular progress rings (Score, Duration, Deep %, REM %)
- **Hypnogram** — stepped line chart of sleep stages
- **Expandable sections:** Heart Rate chart, HRV, Respiratory Rate, Efficiency
- **CSU Insight Cards** — correlation notes from fake dataset
- **Logs section** — any log entries attached to this record

### 9.3 History

- Page title
- Scrollable list of history cards
- Each card: animated CSS mini-orb, date, quality label (colour-coded), score, duration
- Tap navigates to results

### 9.4 Profile

- Wearable card: device name, connected status, last sync time
- Sync Now button with progress animation
- Sleep target setting
- About section (version 0.1.0 POC)

### 9.5 Add Sheet (Overlay)

- Dark sheet slides up from bottom nav
- "Add" title
- Log categories with coloured dots:
  - Photo of Place (purple — `#6B3FA0`)
  - Food (coral — `#D0566C`)
  - Sleep Note (teal — `#44AEC6`)
  - CSU Trigger (orange — `#E8834A`)
- Tapping opens a simple form (text input + optional fields per type)
- Close button dismisses

---

## 10. Design System

### 10.1 Aesthetic Direction

**Refined medical luxury.** Clean, warm, airy. Think Apple Health meets a premium wellness brand. The elegance comes from restraint — light typography weights, generous whitespace, whisper-soft shadows, warm whites. Never heavy, never techy.

### 10.2 Font

**Inter** — loaded via Google Fonts or self-hosted. Premium feel achieved through weight and tracking choices, not font novelty.

- Headings: Inter 500 (medium), tight tracking (-0.01em)
- Body: Inter 400 (regular), 15px base
- Labels: Inter 500, wide tracking (0.06em), uppercase where appropriate
- Scores/numbers: Inter 600 (semibold) — sparingly

### 10.3 Colour Tokens

```css
/* App theme (warm white) */
--colour-bg:              #FDFCFB
--colour-surface:         #FFFFFF
--colour-text:            #1C1C1E
--colour-text-secondary:  #6E6E73
--colour-text-muted:      #AEAEB2
--colour-border:          #E8E6E3
--colour-border-subtle:   #F2F0ED
--colour-overlay:         rgba(0, 0, 0, 0.35)

/* Navigation */
--colour-nav-bg:          #2D2D35
--colour-nav-text:        #FFFFFF
--colour-nav-icon:        #9CA3AF
--colour-nav-icon-active: #FFFFFF

/* Accent */
--colour-accent:          #E8834A
--colour-accent-hover:    #D6743D
--colour-accent-glow:     rgba(232, 131, 74, 0.3)
--colour-connected:       #3DAA7A

/* Sleep quality */
--colour-poor:            #D0566C
--colour-poor-accent:     #E8834A
--colour-poor-deep:       #6B3FA0
--colour-fair:            #D4A84B
--colour-fair-accent:     #7BAFAA
--colour-good:            #3DAA7A
--colour-good-accent:     #44AEC6
--colour-good-light:      #E8DCC8
--colour-excellent:       #2E8B6E
--colour-excellent-accent:#38A3B8

/* Sleep stages */
--colour-stage-light:     #6B9BD2
--colour-stage-deep:      #2D4A7A
--colour-stage-rem:       #E8834A
--colour-stage-awake:     #D0566C

/* Log category dots */
--colour-log-photo:       #6B3FA0
--colour-log-food:        #D0566C
--colour-log-sleep:       #44AEC6
--colour-log-trigger:     #E8834A
```

### 10.4 Spacing

```
--space-xs:   0.25rem   (4px)
--space-sm:   0.5rem    (8px)
--space-md:   1rem      (16px)
--space-lg:   1.5rem    (24px)
--space-xl:   2rem      (32px)
--space-2xl:  3rem      (48px)
--space-3xl:  4rem      (64px)
```

### 10.5 Radii

```
--radius-sm:    0.375rem  (6px)
--radius-md:    0.5rem    (8px)
--radius-lg:    0.75rem   (12px)
--radius-xl:    1rem      (16px)
--radius-card:  1.25rem   (20px)
--radius-full:  9999px
```

### 10.6 Shadows

```css
/* Whisper-soft — present but never the first thing you notice */
--shadow-card:   0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)
--shadow-sheet:  0 -2px 16px rgba(0, 0, 0, 0.10)
--shadow-nav:    none
--shadow-frame:  0 2px 24px rgba(0, 0, 0, 0.06)   /* Desktop frame only */
```

### 10.7 Transitions

```
--transition-fast:    150ms ease
--transition-base:    250ms ease
--transition-slow:    400ms ease
--transition-spring:  500ms cubic-bezier(0.34, 1.56, 0.64, 1)
```

### 10.8 Layout

```
--max-width-desktop:   540px
--max-height-desktop:  min(100vh, 1000px)
--bottom-nav-height:   64px
--header-height:       56px
--orb-size-mobile:     280px
--orb-size-desktop:    320px
--content-padding:     1rem (16px)
```

### 10.9 Z-Index Layers

```
--z-base:          0
--z-cards:         10
--z-orb-controls:  50
--z-header:        100
--z-nav:           200
--z-sheet:         300
--z-overlay:       400
```

### 10.10 Mobile-First Responsive

- **Mobile (default):** Full viewport (100dvh), scrollable, safe area padding
- **Desktop (768px+):** Phone-frame — 540px max-width, centred, `min(100vh, 1000px)` height, rounded corners, decorative keyline border. Bottom nav switches from `fixed` to `absolute` (inside frame). Body background slightly darker (#F0F0F2) to frame the app.
- **Large desktop (1200px+):** Darker body background (#E8E8EC) for more contrast.

### 10.11 Home Screen Ambient Animation

- **Thick filled arcs** — solid coloured petal/crescent shapes (plum, dark forest teal, orange, coral) at ~70% opacity, animated with GSAP for slow organic drift
- **Radial spirograph lines** — very fine, light grey (6% opacity), centred
- **Breathing logo** — central element with 4s breathe animation

### 10.12 History Mini-Orbs (CSS)

- Gradient circle with quality colours set via inline style
- Rotating conic-gradient noise layer on top
- Speed and opacity of noise varies by quality:
  - Poor: 80% opacity, 2s rotation (agitated)
  - Good: 20% opacity, 10s rotation (calm)
  - Excellent: 5% opacity, 15s rotation (serene)

### 10.13 Page Transition Variants (Framer Motion)

```javascript
const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.15 } }
}
```

---

## 11. CSU Features

### 11.1 CSU Trigger Logging

When "CSU Trigger" is selected from the Add sheet, the form includes:
- Flare severity slider (1-10)
- Itch intensity slider (1-10)
- Hives present toggle
- Antihistamine taken toggle + time picker
- Stress level (1-5)
- Free-text notes

### 11.2 CSU Insight Cards

Shown on the results page when CSU trigger data exists for the record. Styled as subtle cards with a lightbulb/sparkle icon, tinted to the quality colour.

Pre-computed insights from the fake dataset:
- "Nights with severe flare-ups average 38% less deep sleep"
- "Antihistamine before bed improved your score by 12 points"
- "Your worst sleep nights coincide with high stress + active hives"
- "3 of your last 5 poor nights had flare severity above 7"

### 11.3 CSU Visual on Orb

When CSU trigger data exists, the orb surface shows red-hot patches/fractures — subtle glowing disruptions that intensify with higher flare severity. This makes CSU's impact visually tangible on the orb itself.

---

## 12. Vite Configuration

```javascript
export default defineConfig({
  plugins: [react(), basicSsl()],
  assetsInclude: ['**/*.frag', '**/*.vert'],
  server: {
    port: 5173,
    https: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-gsap': ['gsap'],
        },
      },
    },
  },
})
```

---

## 13. Scope

### In Scope (v1 POC)

- Pre-seeded sleep records (10-14 nights) with realistic CSU-correlated data
- Simulated wearable sync (client-side timer)
- Interactive 3D orb — smooth sphere to chaotic form + tendrils
- Ambient sound morphing with sleep quality (Web Audio API)
- CSU trigger logging with severity/itch scales
- CSU insight cards with correlation notes
- Sleep stages hypnogram
- Circular progress metric indicators
- Manual log entry (food, photo, sleep note, CSU trigger)
- History view with animated CSS mini-orbs
- Mobile-first layout with desktop phone-frame
- All client-side — no backend, no database, no auth

### Out of Scope

- Backend / API / database
- Authentication
- Real wearable API integration
- Real-time data collection
- Push notifications
- Social/sharing (button present but non-functional)
- Onboarding/tutorial flow
- Admin panel
- Analytics/tracking

---

## 14. Design Decisions Log

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Orb complexity | Sphere + tendrils from day one, crystalline growths later | Balances visual richness with buildability |
| 2 | Sound | Ambient audio, always on | Sells the experience in demos, CSU irritation metaphor |
| 3 | History mini-orbs | Animated CSS (not Three.js) | Lightweight, still communicates quality via colour + motion |
| 4 | CSU insights | Insight cards on results page | Adds clinical value, shows correlations Novartis cares about |
| 5 | Backend | None — all client-side | POC only, fake data, faster to build and demo |
| 6 | Theme | Light, warm white | Matches mockup aesthetic — refined medical luxury |
| 7 | Font | Inter | User specified — premium feel via weight/tracking |
| 8 | Shadows | Whisper-soft, barely visible | Matches mockup — flat design, whitespace for separation |
| 9 | Architecture | Event-driven managers (Velocity pattern) | Proven pattern, decoupled, framework-agnostic state |
| 10 | Charts | Hypnogram (stepped line) not bar chart | Matches mockup accurately — clinical sleep stage format |

---

## 15. Reference: Velocity Project

The Ebb architecture mirrors the Velocity project at `/Users/creativewax/Dropbox/Work Dropbox/Velocity/Build`. Key files to reference when building:

| Pattern | Velocity File |
|---------|--------------|
| EventSystem | `src/lib/EventSystem.js` |
| Event names | `src/lib/events/events.js` |
| BaseManager | `src/managers/BaseManager.js` |
| useManagerSubscription | `src/hooks/useManagerSubscription.js` |
| Example hook | `src/hooks/useAuth.js` |
| AppLayout | `src/components/layout/AppLayout.jsx` |
| BottomNav | `src/components/layout/BottomNav.jsx` |
| DesktopKeyline | `src/components/layout/DesktopKeyline.jsx` |
| Global CSS | `src/styles/global.css` |
| Vite config | `vite.config.js` |
| Route constants | `src/constants/routes.js` |

These files should be read and adapted — not copied verbatim, but used as the pattern reference for Ebb's implementation.

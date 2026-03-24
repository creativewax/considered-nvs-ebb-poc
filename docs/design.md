# Ebb — Design Specification

> **Client:** Novartis (NVS1124 Emerging Tech)
> **Type:** Proof of Concept
> **Date:** 2026-03-24

---

## 1. Overview

Ebb is a sleep wellness POC for **Chronic Spontaneous Urticaria (CSU)** patients. CSU causes unpredictable hives and intense itching that severely disrupt sleep — and poor sleep worsens flare-ups, creating a vicious cycle. Ebb visualises this relationship by transforming sleep data into living, organic 3D orbs whose form directly reflects sleep quality.

The hero element is a Three.js orb that morphs from a **smooth, near-perfect sphere** (excellent sleep) to a **chaotic, distorted form** (poor sleep disrupted by CSU symptoms). Users log CSU-specific triggers — flare-ups, itching severity, antihistamine timing, environmental factors — alongside standard sleep metrics, building a holistic picture of how their condition affects rest.

The app mimics wearable integration (Apple Health, Fitbit, etc.) with simulated sync events and pre-seeded data. **There is no backend** — all data is client-side, seeded in-app for the POC.

**Core idea:** Sleep quality is felt, not just read. The orb makes the impact of CSU on sleep visceral.

---

## 2. Design Analysis (from UI Mockup)

### 2.1 Home Screen (Centre-Left in Mockup)

- **Light theme** — white/off-white background, not dark
- **Decorative organic shapes** around the edges — thick, solid, filled arcs in plum purple, dark forest teal, warm orange, and coral. These are fat petal/crescent shapes, not thin strokes
- **Subtle radial pattern** in light grey — spirograph-like concentric lines radiating from the centre
- **Central logo/score element** — an orange circle at the centre, surrounded by a ring of cyan/teal dots in a circular formation
- **The background animation** behind the home screen is gentle and organic — the arcs/petals drift slowly, giving life to the otherwise minimal page
- **Bottom navigation bar** — dark/charcoal with icon items and a prominent orange circular button in the centre (the "Add" action)

### 2.2 Add Menu (Far-Left in Mockup)

- **Dark overlay sheet** rising from the bottom nav
- **"Add" title** at the top of the sheet
- **Log categories** listed vertically, each with a coloured dot indicator:
  - Photo of Place (purple dot) — environment where they slept
  - Food (coral/red dot) — diet that may affect flare-ups
  - Sleep Note (teal dot) — general sleep observation
  - CSU Trigger (orange dot) — flare-up severity, itching, antihistamine timing, stress
- **Close button (X)** at the bottom of the sheet
- This is a quick-entry menu — tap a category, log the data, dismiss

### 2.3 Results Screen — Bad Sleep (Centre-Right)

- **Header:** "Bad Sleep, Jan 25" with share and settings icons
- **"Connected" badge** (green) — indicates wearable sync status
- **Hero orb:** Chaotic, turbulent — tangled red/orange/purple strands, dense and messy. The organic form looks agitated, knotted, and restless
- **Circular progress indicators** below the orb in red/warm tones — likely duration, efficiency, or individual metric scores
- **Sleep Stages chart** — horizontal bar/block timeline showing Light (blue), Deep (dark blue), REM (coral), Awake (red) stages across the night
- **Bottom nav** consistent with home screen

### 2.4 Results Screen — Good Sleep (Far-Right)

- **Header:** "Good Sleep, Jan 28"
- **Same layout** as bad sleep screen
- **Hero orb:** Flowing, calm — smooth green/teal/cream strands that glide and weave harmoniously. The form is open, breathing, serene
- **Circular progress indicators** in green/teal tones — better scores across the board
- **Sleep Stages chart** — similar format but showing healthier distribution (more deep/REM, less awake)

---

## 3. App Structure

### 3.1 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Logo, ambient animation, recent sleep summary, quick stats |
| `/results/:id` | Results | Hero orb + sleep metrics for a specific night |
| `/history` | History | Scrollable list of past nights with mini orb thumbnails |
| `/profile` | Profile | Wearable connection status, settings, about |

### 3.2 Navigation

- **Bottom nav bar** (dark/charcoal) with 5 positions: Home, History, (Add centre), Profile, Settings
- **Centre button** (orange, slightly raised) opens the Add sheet overlay
- **Add sheet** slides up from bottom nav with log categories
- **Page transitions** via Framer Motion — smooth fade/slide

### 3.3 Layout

- **Mobile-first** — full viewport, scrollable content
- **Desktop** — phone-frame layout (540px max-width, centred, rounded corners, decorative keyline) matching the Velocity pattern
- **Light theme** — white background, dark text, accent colours from the orb palette

---

## 4. The Orb

### 4.1 Concept

The orb is a 3D organic form rendered with Three.js. It is the emotional centre of the app — a living sculpture that embodies sleep quality through its visual properties.

**Inspiration:** [Blobmixer by 14islands](https://blobmixer.14islands.com) — but evolved with additional organic structures (tendrils, filaments, crystalline growths) that extend from and orbit the core sphere.

### 4.2 The Sphere-to-Chaos Spectrum

The orb's **shape** is the primary indicator of sleep quality. A perfect night's sleep produces a **smooth, near-perfect sphere** — calm, pristine, and whole. As sleep quality degrades (especially when disrupted by CSU symptoms), the sphere **distorts, tangles, and fractures** into increasingly chaotic organic forms.

| Sleep Quality | Orb Form | Orb Behaviour |
|---------------|----------|---------------|
| **Excellent** (85-100) | Near-perfect smooth sphere | Minimal surface noise. Cool colours (teal, cream). Gentle, slow breathing pulse. Serene. |
| **Good** (70-84) | Slightly organic sphere with soft undulations | Smooth flowing surface. Greens and teals. Calm drift. Sparse, graceful tendrils. |
| **Fair** (40-69) | Visibly deformed sphere, uneven surface | Mixed flow with some turbulence. Warm-to-cool gradient. Medium density tendrils. |
| **Poor** (0-39) | Heavily distorted, chaotic mass | Tangled strands, jagged spikes. Hot colours (red, orange, purple). Rapid, erratic movement. Dense, knotted core. |

### 4.3 Data-to-Visual Mapping

| Metric | Visual Property |
|--------|----------------|
| **Overall score** (0-100) | **Core shape** — perfect sphere (100) progressively distorts to chaotic mesh (0). This is the dominant visual driver. |
| **Duration** | Orb scale — larger for longer sleep |
| **Deep sleep %** | Core density/solidity — more deep sleep = denser, more grounded core |
| **REM %** | Tendril activity — more REM = more flowing, dream-like extensions |
| **Light sleep %** | Transparency/opacity of outer layers |
| **Awake time** | Spike/jag frequency — more awake = more sharp disruptions in the surface |
| **Heart rate** | Pulse rhythm — the orb subtly breathes at the user's average resting HR |
| **HRV** | Smoothness of movement — high HRV = fluid motion, low HRV = jerky |
| **CSU severity** (if logged) | Surface irritation — subtle red-hot patches/fractures on the sphere surface, more intense with worse flare-ups |

### 4.4 Colour Palette

The orb's colour shifts along a gradient mapped to the overall sleep score:

```
Poor (0-40)     → Reds, oranges, deep purples (#D0566C, #E8834A, #6B3FA0)
Average (40-70) → Ambers, warm teals (#D4A84B, #7BAFAA)
Good (70-100)   → Teals, greens, soft cream (#3DAA7A, #44AEC6, #E8DCC8)
```

### 4.5 Interaction

- **Auto-rotate** — the orb slowly rotates on its own
- **Touch/drag to rotate** — user can spin the orb freely
- **Pinch/scroll to zoom** — get closer to inspect the organic structures
- **Tap to pulse** — tapping the orb triggers a ripple/pulse animation that briefly reveals more detail
- **Press and hold** — slows rotation, highlights individual metric contributions (e.g., "REM" tendrils glow brighter)

### 4.6 Technical Approach

- **Three.js** with custom shaders (vertex displacement for organic deformation)
- **Noise functions** (simplex/perlin) for organic surface movement
- **Instanced geometry** for tendrils/filaments extending from the core
- **Post-processing** — subtle bloom, chromatic aberration on interaction
- **Performance** — LOD (level of detail) scaling, requestAnimationFrame throttling, WebGL capability detection with graceful fallback

### 4.7 Ambient Sound

The orb has an ambient audio layer that shifts with sleep quality, powered by the Web Audio API.

| Sleep Quality | Sound Character |
|---------------|----------------|
| **Excellent** | Soft, warm drone. Gentle sine waves. Slow, deep breathing rhythm. Peaceful. |
| **Good** | Calm ambient tones with subtle harmonic movement. Light shimmer. |
| **Fair** | Slightly unsettled. Warmer frequencies, occasional dissonant undertone. |
| **Poor** | Scratchy, agitated texture. High-frequency crackle (CSU irritation metaphor). Irregular rhythm. Dissonant intervals. |

- Sound is always present on the results page (no mute toggle for POC)
- Crossfades smoothly when navigating between different nights
- Home page has a very subtle ambient bed (quieter than results)
- Uses oscillators + filters (no audio file dependencies)

### 4.8 Home Screen Animation

The home page features a gentler ambient version:
- **Decorative organic arcs** — soft coloured shapes (purple, teal, orange, coral) that drift slowly around the edges of the screen like orbital petals
- **Radial pattern** — light grey spirograph lines radiating from the centre
- **Central element** — the Ebb logo/icon with a subtle breathing animation
- This is NOT the full orb — it's a lighter, ambient canvas that hints at the orb language without the computational weight

---

## 5. Sleep Data Model

### 5.1 Sleep Record

```
SleepRecord {
  id                  — unique identifier
  date                — night of sleep (YYYY-MM-DD)
  source              — 'wearable' | 'manual'
  syncedAt            — timestamp of wearable sync (null if manual)

  // Duration
  bedtime             — time user went to bed
  wakeTime            — time user woke up
  totalDuration       — total time in bed (minutes)
  sleepDuration       — actual sleep time (minutes)

  // Stages (minutes)
  lightSleep          — minutes in light sleep
  deepSleep           — minutes in deep sleep
  remSleep            — minutes in REM sleep
  awakeTime           — minutes awake during the night

  // Vitals
  avgHeartRate        — average HR during sleep (bpm)
  minHeartRate        — lowest HR
  hrv                 — heart rate variability (ms)
  respiratoryRate     — breaths per minute

  // Computed
  score               — overall sleep score (0-100)
  quality             — 'poor' | 'fair' | 'good' | 'excellent'
}
```

### 5.2 Log Entry

```
LogEntry {
  id                  — unique identifier
  sleepRecordId       — linked sleep record (nullable)
  type                — 'photo' | 'food' | 'sleep_note' | 'csu_trigger'
  content             — text content or description
  imageUrl            — photo URL (for 'photo' type)
  createdAt           — timestamp
}
```

### 5.3 CSU Trigger Entry (extends LogEntry when type = 'csu_trigger')

```
CsuTriggerData {
  flareSeverity       — 1-10 scale (how bad the flare-up was)
  itchIntensity       — 1-10 scale (itching severity during the night)
  hivesPresent        — boolean (visible hives at bedtime)
  antihistamineTaken  — boolean
  antihistamineTime   — time taken (if applicable)
  stressLevel         — 1-5 scale
  notes               — free-text observations
}
```

### 5.4 Fake Data Strategy

All data lives in `src/data/` as static JavaScript objects. No API calls, no database.

For the POC, the app ships with:
- **10-14 pre-seeded sleep records** spanning two weeks, with varied quality (2-3 poor, 3-4 fair, 3-4 good, 1-2 excellent)
- **CSU correlation** — poor sleep nights are paired with high-severity CSU trigger logs (flare-ups, itching), showing the relationship the app is designed to surface
- **Simulated wearable sync** — a "Connect Wearable" flow that triggers a fake sync animation (client-side timer), then reveals the pre-seeded data as if it just arrived
- **Manual log entries** scattered across the records — a mix of food logs, environment photos (placeholder images), sleep notes, and CSU trigger entries
- **Sleep stage data** is realistic — generated to match plausible distributions for each quality level

---

## 6. Charts & Metrics

### 6.1 Circular Progress Indicators

Below the orb on the results screen, a row of small circular progress rings showing:
- **Sleep Score** (overall, 0-100)
- **Duration** (hours vs target)
- **Deep Sleep** (% of total)
- **REM** (% of total)

Colour matches the orb palette for that night (red tones for poor, green for good).

### 6.2 Sleep Stages Hypnogram

A stepped line chart (hypnogram) showing sleep architecture across the night:
- **X-axis:** Time (bedtime to wake time)
- **Y-axis:** Sleep stage levels — Awake (top), REM, Light, Deep (bottom)
- **Rendering:** Stepped line that drops/rises between stages, coloured per stage. Each horizontal segment is coloured by the active stage (Light = blue, Deep = navy, REM = orange, Awake = red)
- **Style:** Clean, thin stepped line with coloured fills beneath each segment. No smooth curves — sharp right-angle transitions between stages, matching the clinical hypnogram format
- **Legend:** Small coloured squares + labels below the chart

### 6.3 Additional Stats (Expandable)

Below the main charts, collapsible sections for:
- **Heart Rate** — line chart showing HR across the night
- **HRV** — bar chart or single value with trend indicator
- **Respiratory Rate** — average with comparison to baseline
- **Time in Bed vs Asleep** — efficiency percentage

### 6.4 CSU Insight Cards

Below the expandable stats, a section of insight cards that surface correlations between CSU triggers and sleep quality. These are computed from the fake dataset.

Example insights:
- "Nights with severe flare-ups average 38% less deep sleep"
- "Antihistamine before bed improved your score by 12 points"
- "Your worst sleep nights coincide with high stress + active hives"
- "3 of your last 5 poor nights had flare severity above 7"

Styled as subtle cards with an icon (lightbulb or sparkle), tinted to the quality colour of that night. Only shown if CSU trigger data exists for the record.

---

## 7. Screens in Detail

### 7.1 Home

```
┌─────────────────────────┐
│                         │
│   [organic arcs drift   │
│    around the edges]    │
│                         │
│      [radial lines]     │
│                         │
│        ┌─────┐          │
│        │ EBB │          │
│        │logo │          │
│        └─────┘          │
│                         │
│   Last Night: Good      │
│   Score: 82 · 7h 42m    │
│                         │
│   ┌─────┐  ┌─────┐     │
│   │ Avg  │  │Trend│     │
│   │ 74   │  │  ↑  │     │
│   └─────┘  └─────┘     │
│                         │
├─────────────────────────┤
│ 🏠  📋  (＋)  👤  ⚙   │
└─────────────────────────┘
```

- Ambient organic animation behind everything
- Quick summary of last night's sleep
- Weekly average and trend cards
- Bottom nav with orange Add button

### 7.2 Results

```
┌─────────────────────────┐
│ ← Bad Sleep, Jan 25  ↗ ⚙│
│              [Connected] │
│                         │
│      ┌───────────┐      │
│      │           │      │
│      │  3D ORB   │      │
│      │  (drag/   │      │
│      │   zoom)   │      │
│      │           │      │
│      └───────────┘      │
│                         │
│  ◯ 42   ◯ 5h   ◯ 12%  ◯ 8%│
│  Score  Dur   Deep  REM │
│                         │
│  ┌─ Sleep Stages ─────┐ │
│  │ ████░░███░░██░░░░  │ │
│  │ 11pm        6am    │ │
│  └────────────────────┘ │
│                         │
│  ▼ Heart Rate           │
│  ▼ HRV                  │
│  ▼ Logs (2)             │
│                         │
├─────────────────────────┤
│ 🏠  📋  (＋)  👤  ⚙   │
└─────────────────────────┘
```

- Back button returns to history or home
- Hero orb is interactive (drag, zoom, tap)
- Circular metrics row
- Sleep stages timeline
- Expandable sections for deeper stats and log entries

### 7.3 History

```
┌─────────────────────────┐
│ History                  │
│                         │
│  ┌─────────────────────┐│
│  │ ◉ Jan 28 — Good     ││
│  │   Score: 82 · 7h42m ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ◉ Jan 27 — Fair     ││
│  │   Score: 58 · 6h10m ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ◉ Jan 25 — Poor     ││
│  │   Score: 42 · 5h02m ││
│  └─────────────────────┘│
│  ...                    │
│                         │
├─────────────────────────┤
│ 🏠  📋  (＋)  👤  ⚙   │
└─────────────────────────┘
```

- Each card has a mini orb thumbnail (static snapshot or tiny animated preview)
- Quality label colour-coded
- Tap to navigate to full results screen

### 7.4 Profile

```
┌─────────────────────────┐
│ Profile                  │
│                         │
│  Wearable               │
│  ┌─────────────────────┐│
│  │ Apple Watch          ││
│  │ ● Connected          ││
│  │ Last sync: 2m ago    ││
│  └─────────────────────┘│
│                         │
│  [Sync Now]             │
│                         │
│  Sleep Target: 8h       │
│  Notifications: On      │
│                         │
│  About Ebb              │
│  Version 0.1.0 (POC)   │
│                         │
├─────────────────────────┤
│ 🏠  📋  (＋)  👤  ⚙   │
└─────────────────────────┘
```

- Wearable connection status with fake sync button
- Basic settings
- POC version info

### 7.5 Add Sheet (Overlay)

```
┌─────────────────────────┐
│                         │
│  (dimmed background)    │
│                         │
│  ┌─────────────────────┐│
│  │ Add                  ││
│  │                     ││
│  │ ● Photo of Place    ││
│  │ ● Food              ││
│  │ ● Sleep Note        ││
│  │ ● CSU Trigger       ││
│  │                     ││
│  │       ✕             ││
│  └─────────────────────┘│
├─────────────────────────┤
│ 🏠  📋  (＋)  👤  ⚙   │
└─────────────────────────┘
```

- Dark sheet slides up from the bottom nav
- Each category has a coloured dot (purple, coral, teal, orange)
- Tapping a category opens a simple form (text input + optional photo)
- Close button dismisses

---

## 8. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Build | Vite | Code-splitting, vendor chunks |
| Frontend | React 19 (JavaScript) | No TypeScript |
| Routing | React Router 7 | Lazy-loaded pages |
| 3D | Three.js | Custom shaders, noise displacement |
| Animation | Framer Motion + GSAP | Page transitions + orb interactions |
| State | EventSystem + Managers | Decoupled, event-driven (Velocity pattern) |
| CSS | Custom properties + modules | Light theme, mobile-first |
| Icons | Lucide React | Consistent with Velocity |

**No backend.** All data is client-side — seeded fake records, no API calls, no database, no authentication. This is a pure frontend POC.

---

## 9. Architecture

### 9.1 Managers

| Manager | Responsibility |
|---------|---------------|
| `SleepManager` | Sleep records, fake data seeding, record selection |
| `OrbManager` | Orb configuration derived from sleep data, visual parameter calculation |
| `LogManager` | Manual log entries (CSU triggers, food, photos, notes) |
| `SoundManager` | Web Audio API ambient sound, morphs with orb/sleep quality |
| `DeviceManager` | Wearable connection state, simulated sync flow |

### 9.2 Event Flow Example

```
User taps "Sync Now"
  → useDevice() emits DEVICE_SYNC_REQUESTED
  → DeviceManager listens, starts fake sync timer
  → DeviceManager emits DEVICE_SYNC_PROGRESS (0%...100%)
  → DeviceManager emits DEVICE_SYNC_COMPLETE
  → SleepManager listens, reveals pre-seeded records
  → SleepManager emits SLEEP_DATA_LOADED
  → OrbManager listens, calculates visual params from sleep data
  → OrbManager emits ORB_CONFIG_UPDATED
  → Results page re-renders with orb + metrics
```

### 9.3 Folder Structure

```
src/
  constants/          # Routes, events, sleep thresholds, colours
  data/               # Pre-seeded fake sleep records + log entries
  lib/
    events/           # EventSystem + event names
    utils.js          # Pure utilities
    three/            # Three.js scene setup, shaders, noise
  managers/
    BaseManager.js
    SleepManager.js
    OrbManager.js
    LogManager.js
    DeviceManager.js
  hooks/
    useManagerSubscription.js
    useSleep.js
    useOrb.js
    useLogs.js
    useDevice.js
  components/
    layout/           # AppLayout, BottomNav, DesktopKeyline
    common/           # Buttons, badges, cards, sheets, progress rings
    orb/              # OrbCanvas, OrbScene, shaders, fallback
    charts/           # SleepStagesChart, HeartRateChart, ProgressRing
    home/             # HomeAnimation, SleepSummary, TrendCards
    results/          # ResultsHeader, MetricsRow, ExpandableStats
    history/          # HistoryCard, MiniOrb
    add/              # AddSheet, LogForm
    profile/          # WearableCard, SyncButton, Settings
  pages/
    HomePage.jsx
    ResultsPage.jsx
    HistoryPage.jsx
    ProfilePage.jsx
  styles/
    global.css        # Custom properties, responsive rules, theme
    animations.css    # Shared keyframes
```

---

## 10. Colour & Theme

### 10.1 App Theme (Light, Warm White)

> See §11.1 for the full custom properties block. These are the key tokens:

```css
--colour-bg:            #FDFCFB   /* Warm white */
--colour-surface:       #FFFFFF
--colour-text:          #1C1C1E   /* Near-black, warm */
--colour-text-secondary:#6E6E73
--colour-border:        #E8E6E3   /* Warm border */
--colour-nav-bg:        #2D2D35
--colour-nav-text:      #FFFFFF
--colour-accent:        #E8834A   /* Orange — primary action */
--colour-connected:     #3DAA7A   /* Green — status badge */
```

### 10.2 Sleep Quality Colours

```css
/* Poor */
--colour-poor:          #D0566C
--colour-poor-accent:   #E8834A
--colour-poor-deep:     #6B3FA0

/* Fair */
--colour-fair:          #D4A84B
--colour-fair-accent:   #7BAFAA

/* Good */
--colour-good:          #3DAA7A
--colour-good-accent:   #44AEC6
--colour-good-light:    #E8DCC8

/* Excellent */
--colour-excellent:     #2E8B6E
--colour-excellent-accent: #38A3B8
```

### 10.3 Sleep Stage Colours

```css
--colour-stage-light:   #6B9BD2
--colour-stage-deep:    #2D4A7A
--colour-stage-rem:     #E8834A
--colour-stage-awake:   #D0566C
```

---

## 11. CSS & Styling Rules

### 11.1 Global Custom Properties (global.css)

```css
:root {
  /* ── COLOURS ── */

  /* App theme (light, warm white) */
  --colour-bg:              #FDFCFB;   /* Warm white — not cool grey */
  --colour-surface:         #FFFFFF;
  --colour-surface-raised:  #FFFFFF;
  --colour-text:            #1C1C1E;   /* Near-black, warm */
  --colour-text-secondary:  #6E6E73;   /* Apple-style secondary */
  --colour-text-muted:      #AEAEB2;
  --colour-border:          #E8E6E3;   /* Warm border */
  --colour-border-subtle:   #F2F0ED;   /* Barely visible divider */
  --colour-overlay:         rgba(0, 0, 0, 0.35);

  /* Navigation */
  --colour-nav-bg:          #2D2D35;
  --colour-nav-text:        #FFFFFF;
  --colour-nav-icon:        #9CA3AF;
  --colour-nav-icon-active: #FFFFFF;

  /* Accent */
  --colour-accent:          #E8834A;
  --colour-accent-hover:    #D6743D;
  --colour-accent-glow:     rgba(232, 131, 74, 0.3);
  --colour-connected:       #3DAA7A;

  /* Sleep quality — poor */
  --colour-poor:            #D0566C;
  --colour-poor-accent:     #E8834A;
  --colour-poor-deep:       #6B3FA0;
  --colour-poor-bg:         rgba(208, 86, 108, 0.08);

  /* Sleep quality — fair */
  --colour-fair:            #D4A84B;
  --colour-fair-accent:     #7BAFAA;
  --colour-fair-bg:         rgba(212, 168, 75, 0.08);

  /* Sleep quality — good */
  --colour-good:            #3DAA7A;
  --colour-good-accent:     #44AEC6;
  --colour-good-light:      #E8DCC8;
  --colour-good-bg:         rgba(61, 170, 122, 0.08);

  /* Sleep quality — excellent */
  --colour-excellent:       #2E8B6E;
  --colour-excellent-accent:#38A3B8;
  --colour-excellent-bg:    rgba(46, 139, 110, 0.08);

  /* Sleep stages */
  --colour-stage-light:     #6B9BD2;
  --colour-stage-deep:      #2D4A7A;
  --colour-stage-rem:       #E8834A;
  --colour-stage-awake:     #D0566C;

  /* Log category dots */
  --colour-log-photo:       #6B3FA0;
  --colour-log-food:        #D0566C;
  --colour-log-sleep:       #44AEC6;
  --colour-log-trigger:     #E8834A;

  /* ── TYPOGRAPHY ── */
  /* Inter — clean, geometric, premium when paired with generous tracking */
  --font-heading:           'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:              'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:              'JetBrains Mono', 'SF Mono', monospace;

  --text-xs:                0.6875rem;  /* 11px — legend, meta */
  --text-sm:                0.8125rem;  /* 13px — secondary */
  --text-base:              0.9375rem;  /* 15px — body (slightly under 16 for elegance) */
  --text-lg:                1.0625rem;  /* 17px — subheadings */
  --text-xl:                1.25rem;    /* 20px — page titles */
  --text-2xl:               1.5rem;     /* 24px — hero text */
  --text-3xl:               2rem;       /* 32px — display */

  /* Weights skew light — the design is airy and restrained */
  --weight-regular:         400;
  --weight-medium:          500;        /* Primary heading weight */
  --weight-semibold:        600;        /* Sparingly — scores, emphasis only */

  --leading-tight:          1.2;
  --leading-normal:         1.5;
  --leading-relaxed:        1.65;

  /* Tracking — slightly open for the premium feel */
  --tracking-tight:         -0.01em;
  --tracking-normal:        0;
  --tracking-wide:          0.02em;
  --tracking-caps:          0.06em;     /* Uppercase labels */

  /* ── SPACING ── */
  --space-xs:               0.25rem;    /* 4px */
  --space-sm:               0.5rem;     /* 8px */
  --space-md:               1rem;       /* 16px */
  --space-lg:               1.5rem;     /* 24px */
  --space-xl:               2rem;       /* 32px */
  --space-2xl:              3rem;       /* 48px */
  --space-3xl:              4rem;       /* 64px */

  /* ── RADII ── */
  --radius-sm:              0.375rem;   /* 6px */
  --radius-md:              0.5rem;     /* 8px */
  --radius-lg:              0.75rem;    /* 12px */
  --radius-xl:              1rem;       /* 16px */
  --radius-card:            1.25rem;    /* 20px */
  --radius-full:            9999px;

  /* ── SHADOWS ── */
  /* Whisper-soft — present but never the first thing you notice */
  --shadow-card:            0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-sheet:           0 -2px 16px rgba(0, 0, 0, 0.10);
  --shadow-nav:             none;       /* Dark nav separates via contrast */
  --shadow-frame:           0 2px 24px rgba(0, 0, 0, 0.06); /* Desktop frame only */

  /* ── TRANSITIONS ── */
  --transition-fast:        150ms ease;
  --transition-base:        250ms ease;
  --transition-slow:        400ms ease;
  --transition-spring:      500ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── LAYOUT ── */
  --max-width-mobile:       100%;
  --max-width-desktop:      540px;
  --max-height-desktop:     min(100vh, 1000px);
  --bottom-nav-height:      64px;
  --header-height:          56px;
  --orb-size-mobile:        280px;
  --orb-size-desktop:       320px;
  --content-padding:        var(--space-md);

  /* ── SAFE AREAS (notch support) ── */
  --safe-top:               env(safe-area-inset-top, 0px);
  --safe-bottom:            env(safe-area-inset-bottom, 0px);
  --safe-left:              env(safe-area-inset-left, 0px);
  --safe-right:             env(safe-area-inset-right, 0px);

  /* ── Z-INDEX LAYERS ── */
  --z-base:                 0;
  --z-cards:                10;
  --z-header:               100;
  --z-nav:                  200;
  --z-sheet:                300;
  --z-overlay:              400;
  --z-orb-controls:         50;
}
```

### 11.2 Base Reset & Global Styles

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--colour-text);
  background: var(--colour-bg);
  overflow: hidden;  /* Scroll managed by #root */
}

#root {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: var(--colour-bg);
}

img, video, canvas, svg {
  display: block;
  max-width: 100%;
}

button {
  font: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Scrollbar — thin and subtle */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--colour-border);
  border-radius: var(--radius-full);
}
```

### 11.3 Mobile-First Responsive Layout

```css
/* ── MOBILE (default) ── */

#root {
  height: 100dvh;
  overflow-y: auto;
}

.page {
  min-height: 100dvh;
  padding-bottom: calc(var(--bottom-nav-height) + var(--safe-bottom) + var(--space-lg));
  padding-top: var(--safe-top);
}

.page-content {
  padding: var(--content-padding);
}

/* ── DESKTOP: phone-frame layout ── */

@media (min-width: 768px) {
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #F0F0F2;  /* Slightly darker than app bg */
  }

  #root {
    max-width: var(--max-width-desktop);
    height: var(--max-height-desktop);
    margin: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-frame);
    overflow: hidden;
    position: relative;
  }

  /* Decorative keyline border around the frame */
  #root::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: calc(var(--radius-lg) + 1px);
    border: 1px solid var(--colour-border);
    pointer-events: none;
    z-index: var(--z-overlay);
  }
}

/* ── LARGE DESKTOP: more breathing room ── */

@media (min-width: 1200px) {
  body {
    background: #E8E8EC;
  }
}
```

### 11.4 Bottom Navigation

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--bottom-nav-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: var(--colour-nav-bg);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: var(--z-nav);
  /* No shadow — the dark nav separates via contrast, not depth */
}

/* Desktop: contained within frame */
@media (min-width: 768px) {
  .bottom-nav {
    position: absolute;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  color: var(--colour-nav-icon);
  font-size: var(--text-xs);
  transition: color var(--transition-fast);
}

.nav-item.active {
  color: var(--colour-nav-icon-active);
}

/* Orange centre Add button */
.nav-add-button {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--colour-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px var(--colour-accent-glow);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.nav-add-button:active {
  transform: scale(0.92);
}
```

### 11.5 Add Sheet Overlay

```css
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: var(--colour-overlay);
  z-index: var(--z-overlay);
  /* Framer Motion handles opacity animation */
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--colour-nav-bg);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  padding: var(--space-lg) var(--space-md) calc(var(--bottom-nav-height) + var(--safe-bottom) + var(--space-md));
  z-index: var(--z-sheet);
  box-shadow: var(--shadow-sheet);
  /* Framer Motion handles slide-up animation */
}

/* Desktop: contained within frame */
@media (min-width: 768px) {
  .sheet-overlay,
  .sheet {
    position: absolute;
  }
}

.sheet-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--colour-nav-text);
  margin-bottom: var(--space-lg);
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  color: var(--colour-nav-text);
  font-size: var(--text-base);
}

.sheet-item-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.sheet-close {
  display: flex;
  justify-content: center;
  margin-top: var(--space-lg);
  color: var(--colour-text-muted);
}
```

### 11.6 Cards & Surfaces

```css
.card {
  background: var(--colour-surface);
  border-radius: var(--radius-card);
  padding: var(--space-md);
  box-shadow: var(--shadow-card);        /* Whisper-soft lift */
  border: 1px solid var(--colour-border-subtle);
}

.card-row {
  display: flex;
  gap: var(--space-sm);
}

.card-row > * {
  flex: 1;
}

/* Quality-tinted card backgrounds */
.card--poor    { background: var(--colour-poor-bg); }
.card--fair    { background: var(--colour-fair-bg); }
.card--good    { background: var(--colour-good-bg); }
.card--excellent { background: var(--colour-excellent-bg); }
```

### 11.7 Circular Progress Rings

```css
.progress-ring {
  width: 56px;
  height: 56px;
  position: relative;
}

.progress-ring svg {
  transform: rotate(-90deg);
}

.progress-ring-track {
  fill: none;
  stroke: var(--colour-border);
  stroke-width: 4;
}

.progress-ring-fill {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--transition-slow);
}

.progress-ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}

.metrics-row {
  display: flex;
  justify-content: space-around;
  padding: var(--space-md) 0;
  gap: var(--space-sm);
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.metric-label {
  font-size: var(--text-xs);
  color: var(--colour-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 11.8 Sleep Stages Hypnogram

```css
.hypnogram {
  width: 100%;
  padding: var(--space-md) 0;
}

.hypnogram-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--colour-text);
  margin-bottom: var(--space-sm);
  letter-spacing: var(--tracking-wide);
}

/* The chart itself is rendered via canvas or SVG — these styles wrap it */
.hypnogram-chart {
  width: 100%;
  height: 100px;
  position: relative;
}

/* Y-axis stage labels (Awake, REM, Light, Deep) */
.hypnogram-y-labels {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--colour-text-muted);
  padding-right: var(--space-sm);
}

/* X-axis time labels */
.hypnogram-x-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-xs);
  font-size: var(--text-xs);
  color: var(--colour-text-muted);
}

.hypnogram-legend {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-sm);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--colour-text-secondary);
  letter-spacing: var(--tracking-wide);
}

.legend-swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;  /* Squares with slight rounding, matching the design */
}
```

### 11.9 Header & Connected Badge

```css
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--content-padding);
  padding-top: calc(var(--safe-top) + var(--space-md));
  min-height: var(--header-height);
}

.results-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);   /* Light touch — not heavy */
  letter-spacing: var(--tracking-tight);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.badge--connected {
  background: rgba(61, 170, 122, 0.12);
  color: var(--colour-connected);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}
```

### 11.10 Expandable Sections

```css
.expandable {
  border-top: 1px solid var(--colour-border-subtle);
}

.expandable-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-md) 0;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--colour-text);
}

.expandable-icon {
  transition: transform var(--transition-base);
  color: var(--colour-text-secondary);
}

.expandable-icon.open {
  transform: rotate(180deg);
}

.expandable-content {
  /* Framer Motion AnimatePresence handles open/close */
  padding-bottom: var(--space-md);
}
```

### 11.11 History Cards

```css
.history-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--colour-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--colour-border-subtle);
  cursor: pointer;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.history-card:active {
  transform: scale(0.98);
  box-shadow: none;  /* Press removes the subtle lift */
}

.history-mini-orb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  overflow: hidden;
}

.history-meta {
  flex: 1;
}

.history-date {
  font-size: var(--text-sm);
  color: var(--colour-text-secondary);
}

.history-quality {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
}

.history-stats {
  font-size: var(--text-sm);
  color: var(--colour-text-muted);
}
```

### 11.12 Orb Container

```css
.orb-container {
  width: var(--orb-size-mobile);
  height: var(--orb-size-mobile);
  margin: var(--space-lg) auto;
  position: relative;
  touch-action: none;  /* Prevent browser gestures on orb */
}

@media (min-width: 768px) {
  .orb-container {
    width: var(--orb-size-desktop);
    height: var(--orb-size-desktop);
  }
}

.orb-canvas {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
}

/* WebGL fallback */
.orb-fallback {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  background: radial-gradient(circle, var(--colour-good) 0%, var(--colour-good-accent) 100%);
  animation: orb-pulse 3s ease-in-out infinite;
}

@keyframes orb-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
```

### 11.13 Shared Animations (animations.css)

```css
/* ── PAGE TRANSITIONS (Framer Motion config, not CSS) ── */
/* These are defined here for reference — actual config lives in components */

/* pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.15 } }
} */

/* ── SHARED KEYFRAMES ── */

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.02); opacity: 0.9; }
}

@keyframes pulse-ring {
  0%   { transform: scale(0.95); opacity: 0.7; }
  50%  { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Sync spinner */
@keyframes sync-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.sync-spinner {
  animation: sync-spin 1s linear infinite;
}

/* ── UTILITY CLASSES ── */

.animate-fade-in {
  animation: fade-in var(--transition-base) both;
}

.animate-breathe {
  animation: breathe 3s ease-in-out infinite;
}
```

### 11.14 Profile & Wearable Card

```css
.wearable-card {
  background: var(--colour-surface);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--colour-border-subtle);
}

.wearable-name {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.wearable-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--colour-connected);
}

.wearable-last-sync {
  font-size: var(--text-xs);
  color: var(--colour-text-muted);
  margin-top: var(--space-xs);
}

.sync-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  margin-top: var(--space-md);
  background: var(--colour-accent);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.sync-button:active {
  transform: scale(0.97);
  background: var(--colour-accent-hover);
}

.sync-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 11.15 CSU Insight Cards

```css
.insight-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md) 0;
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--colour-text);
}

/* Tinted backgrounds per quality */
.insight-card--poor      { background: var(--colour-poor-bg); }
.insight-card--fair      { background: var(--colour-fair-bg); }
.insight-card--good      { background: var(--colour-good-bg); }
.insight-card--excellent { background: var(--colour-excellent-bg); }

.insight-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 1px;
}
```

### 11.16 History Mini-Orbs (CSS Animated)

```css
.mini-orb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  position: relative;
  overflow: hidden;
}

/* Base gradient — colour set inline via style prop based on quality */
.mini-orb-core {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-full);
  animation: mini-orb-breathe 3s ease-in-out infinite;
}

/* Distortion layer — opacity increases with worse quality */
.mini-orb-noise {
  position: absolute;
  inset: -25%;
  border-radius: var(--radius-full);
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 50%,
    rgba(0, 0, 0, 0.08) 75%,
    transparent 100%
  );
  animation: mini-orb-rotate 6s linear infinite;
}

@keyframes mini-orb-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}

@keyframes mini-orb-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Poor quality — more distortion */
.mini-orb--poor .mini-orb-noise {
  opacity: 0.8;
  animation-duration: 2s;
}

/* Good quality — minimal distortion */
.mini-orb--good .mini-orb-noise {
  opacity: 0.2;
  animation-duration: 10s;
}

/* Excellent — nearly invisible distortion */
.mini-orb--excellent .mini-orb-noise {
  opacity: 0.05;
  animation-duration: 15s;
}
```

### 11.17 Home Screen Ambient Animation

```css
.home-ambient {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: var(--z-base);
}

/*
 * Orbital arcs — thick, filled, rounded petal/segment shapes.
 * NOT thin border strokes. Each is a solid coloured shape with
 * rounded ends, like a segment of a thick ring. Positioned absolutely,
 * animated with GSAP for slow organic drift.
 *
 * Implementation: each arc is a wide/tall element with a large
 * border-radius, using background-colour (not border). Think of
 * them as fat crescent shapes clipped to arcs.
 */
.home-arc {
  position: absolute;
  border-radius: var(--radius-full);
  opacity: 0.7;       /* More opaque than a stroke — these are solid fills */
  will-change: transform;
}

.home-arc--purple { background: var(--colour-poor-deep); }
.home-arc--teal   { background: #2D5A4E; }  /* Dark forest teal, not the bright accent */
.home-arc--orange { background: var(--colour-accent); }
.home-arc--coral  { background: var(--colour-poor); }

/* Radial spirograph lines */
.home-radial {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.06;
}

/* Central logo/breathing element */
.home-logo {
  position: relative;
  z-index: var(--z-cards);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: breathe 4s ease-in-out infinite;
}

.home-summary {
  position: relative;
  z-index: var(--z-cards);
  text-align: center;
  padding: var(--space-xl) var(--content-padding);
}
```

---

## 12. Fake Data & POC Scope

### What IS in scope:
- Pre-seeded sleep records (10-14 nights) with realistic CSU-correlated data
- Simulated wearable sync flow (client-side fake connection + sync animation)
- Interactive 3D orb — smooth sphere (good) to chaotic form (poor) + tendrils
- Ambient sound that morphs with sleep quality (Web Audio API)
- CSU trigger logging with severity/itch scales
- CSU insight cards surfacing correlations from the fake dataset
- Sleep stage charts and circular metric indicators
- Manual log entry (food, photo, sleep note, CSU trigger)
- History view with animated CSS mini-orbs per card
- Mobile-first layout with desktop phone-frame
- All client-side — no backend, no database, no auth

### What is NOT in scope:
- Backend / API / database
- Authentication
- Real wearable API integration
- Real-time data collection
- Push notifications
- Social/sharing features (button present but non-functional)
- Onboarding/tutorial flow
- Admin panel
- Analytics/tracking

---

## 13. Design Decisions (Resolved)

1. **Orb complexity** — **Middle ground.** Sphere + tendrils from the start. Crystalline growths saved for a later pass. Core sphere-to-chaos morph is the foundation, tendrils add organic richness without overscoping.
2. **Sound** — **Yes, ambient audio.** Morphs with orb state — calm tones for good sleep, dissonant/scratchy textures for poor sleep (leaning into the CSU irritation metaphor). Web Audio API, always on.
3. **History mini-orbs** — **Animated CSS orbs.** No Three.js per card — use CSS animations and gradients to approximate the organic feel. Lightweight, still communicates quality at a glance.
4. **CSU insights** — **Yes, insight cards.** Results page surfaces simple correlation notes derived from the fake data (e.g., "Nights with severe flare-ups average 38% less deep sleep", "Antihistamine before bed improved your score by 12 points"). Adds clinical value to the visualisation.

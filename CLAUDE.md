# Ebb — Project Instructions

> CSU sleep wellness POC for Novartis. All data is client-side fake data. There is NO backend.

## Quick Context

- **Read before coding:** `docs/prd.md` (full spec), `docs/design.md` (CSS rules), `docs/orb-rendering-guide.md` (Three.js reference)
- **Reference project:** `/Users/creativewax/Dropbox/Work Dropbox/Velocity/Build` — same architecture, same patterns. Read its files when unsure how to structure something.

## Stack

- Vite + React 19 (JavaScript — NOT TypeScript)
- React Router 7 (lazy-loaded pages)
- Three.js (custom shaders, MeshPhysicalMaterial, vertex displacement)
- Framer Motion (page transitions, sheets, expandables)
- GSAP (orb interactions, home animation, timelines)
- Web Audio API (ambient sound morphing with sleep quality)
- Lucide React (icons)
- CSS custom properties + CSS modules (light theme, mobile-first)

## What Does NOT Exist

- No backend, no Express, no Firebase, no API routes
- No database, no Firestore, no authentication
- No TypeScript, no Tailwind, no styled-components
- No Redux, no Context API for state
- No Axios, no API client, no Zod validation

## Architecture — Event-Driven Managers

Components NEVER import managers directly. Always go through hooks.

```
User Action → Hook emits event → Manager listens, updates state
  → Manager emits result event → useManagerSubscription re-renders component
```

### Managers

| Manager | Role |
|---------|------|
| `DataManager` | Singleton fake DB wrapping `src/data/` seed JSON. CRUD interface. No events. Not a BaseManager subclass. |
| `SleepManager` | Sleep records via DataManager, record selection |
| `OrbManager` | Calculates Three.js visual params from sleep data |
| `LogManager` | Log entries, CSU trigger data |
| `SoundManager` | Web Audio API ambient sound |
| `DeviceManager` | Fake wearable sync simulation |

### Key Files (from Velocity — adapt, don't copy verbatim)

| Pattern | Velocity Reference |
|---------|--------------------|
| EventSystem | `src/lib/EventSystem.js` |
| Event names | `src/lib/events/events.js` |
| BaseManager | `src/managers/BaseManager.js` |
| useManagerSubscription | `src/hooks/useManagerSubscription.js` |
| Hook example | `src/hooks/useAuth.js` |
| AppLayout | `src/components/layout/AppLayout.jsx` |
| BottomNav | `src/components/layout/BottomNav.jsx` |
| DesktopKeyline | `src/components/layout/DesktopKeyline.jsx` |
| Global CSS | `src/styles/global.css` |

## Code Style

- **British English** everywhere — `colour`, `initialise`, `behaviour`, `organisation`
- **Font:** Inter (not DM Sans, not system fonts)
- **Theme:** Light, warm white (#FDFCFB), NOT dark mode
- **Shadows:** Whisper-soft only — `0 1px 3px rgba(0,0,0,0.04)`
- **Typography:** Weights skew light. Headers = 500 (medium). Body = 400. Semibold (600) only for scores.
- **Section separators:** 60-dash `// ----` comments in CAPS to divide files
- **Constants:** All routes, events, thresholds, colours from `src/constants/`. No magic strings.
- **Named exports** for everything
- **No comments** on code you didn't change. Short inline comments for non-obvious decisions only.

## CSS Rules

- Custom properties defined in `src/styles/global.css` (see `docs/design.md` section 11 for full list)
- Component-scoped styles via CSS modules (`.module.css`)
- Mobile-first, desktop phone-frame at 768px+ (540px max-width, centred, rounded corners)
- No utility-first CSS. No Tailwind.

## The Orb

- Three.js with MeshPhysicalMaterial (`clearcoat: 1`, `roughness: 0.14`, `metalness: 0`)
- Vertex displacement via periodic Perlin noise + `onBeforeCompile`
- **Normal recalculation after displacement** — the critical technique (see `docs/orb-rendering-guide.md` section 4)
- Real photograph environment map (equirectangular → cube render target)
- Sleep score maps to sphere-to-chaos spectrum: smooth sphere (excellent) → chaotic mass (poor)
- Post-processing: subtle bloom + mild vignette only

## Data

- All fake data in `src/data/` as static JavaScript objects
- DataManager wraps these with a DB-like interface (in-memory, session-only persistence)
- 10-14 pre-seeded sleep records, CSU-correlated
- Wearable sync is faked via client-side timer

## Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `cleanup:`, `docs:`
- Always: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- Don't commit `.env` files
- Don't push unless asked

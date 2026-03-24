// src/pages/HomePage.jsx

import { useEffect } from 'react'
import BasePage from '../components/common/BasePage'
import PixiBackground from '../components/splash/PixiBackground'
import AnimatedGradient from '../components/common/AnimatedGradient'
import SleepSummary from '../components/home/SleepSummary'
import TrendCards from '../components/home/TrendCards'
import QuickLinks from '../components/home/QuickLinks'
import ArticleCards from '../components/home/ArticleCards'

// ------------------------------------------------------------ HOME PAGE

export default function HomePage() {
  useEffect(() => { document.title = 'Ebb — Home' }, [])

  return (
    <BasePage>
      <AnimatedGradient />

      {/* ── HERO SECTION — sleep summary with pixi blob behind ── */}
      <div style={{
        position: 'relative',
        marginBottom: 'var(--space-md)',
      }}>
        {/* Pixi organic blob — 0.7 scale, no crop */}
        <div style={{
          position: 'absolute',
          width: '1200px',
          height: '650px',
          top: '-15%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.7)',
          pointerEvents: 'none',
        }}>
          <PixiBackground showCutout={false} origin={[0, 0]} scale={[1.5, 1.5]} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <SleepSummary inverted />
        </div>
      </div>

      {/* ── REST OF THE PAGE ── */}
      <div className="page-content" style={{ position: 'relative', zIndex: 'var(--z-cards)' }}>
        <TrendCards />
        <QuickLinks />
        <ArticleCards />
      </div>
    </BasePage>
  )
}

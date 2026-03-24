// src/pages/HomePage.jsx

import { useEffect } from 'react'
import BasePage from '../components/common/BasePage'
import PixiBackground from '../components/splash/PixiBackground'
import HomeAnimation from '../components/home/HomeAnimation'
import SleepSummary from '../components/home/SleepSummary'
import TrendCards from '../components/home/TrendCards'
import QuickLinks from '../components/home/QuickLinks'
import ArticleCards from '../components/home/ArticleCards'

// ------------------------------------------------------------ HOME PAGE

export default function HomePage() {
  useEffect(() => { document.title = 'Ebb — Home' }, [])

  return (
    <BasePage>
      <HomeAnimation />

      {/* ── HERO SECTION — sleep summary with pixi blob behind ── */}
      <div style={{
        position: 'relative',
        marginBottom: 'var(--space-md)',
      }}>
        {/* Pixi organic blob — 0.7 scale, no crop */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.7)',
          pointerEvents: 'none',
        }}>
          <PixiBackground />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <SleepSummary />
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

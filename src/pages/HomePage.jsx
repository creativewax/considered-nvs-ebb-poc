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
        overflow: 'hidden',
        marginBottom: 'var(--space-md)',
      }}>
        {/* Pixi organic blob — contained behind the summary */}
        <div style={{
          position: 'absolute',
          width: '100%',
          aspectRatio: '1',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.4,
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

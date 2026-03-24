// src/pages/HomePage.jsx

import HomeAnimation from '../components/home/HomeAnimation'
import SleepSummary from '../components/home/SleepSummary'
import TrendCards from '../components/home/TrendCards'

// ------------------------------------------------------------
// HOME PAGE — ambient animation layer + sleep summary + trends
// ------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="page">
      <HomeAnimation />
      <div className="page-content" style={{ position: 'relative', zIndex: 'var(--z-cards)' }}>
        <SleepSummary />
        <TrendCards />
      </div>
    </div>
  )
}

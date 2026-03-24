// src/pages/HomePage.jsx

import { useEffect } from 'react'
import BasePage from '../components/common/BasePage'
import HomeAnimation from '../components/home/HomeAnimation'
import SleepSummary from '../components/home/SleepSummary'
import TrendCards from '../components/home/TrendCards'

// ------------------------------------------------------------ HOME PAGE

export default function HomePage() {
  useEffect(() => { document.title = 'Ebb — Home' }, [])

  return (
    <BasePage>
      <HomeAnimation />
      <div className="page-content" style={{ position: 'relative', zIndex: 'var(--z-cards)' }}>
        <SleepSummary />
        <TrendCards />
      </div>
    </BasePage>
  )
}

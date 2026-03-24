// src/pages/HomePage.jsx

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BasePage from '../components/common/BasePage'
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
      <div className="page-content" style={{ position: 'relative', zIndex: 'var(--z-cards)' }}>
        <SleepSummary />
        <TrendCards />
        <QuickLinks />
        <ArticleCards />
      </div>
    </BasePage>
  )
}

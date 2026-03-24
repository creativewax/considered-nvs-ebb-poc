// src/App.jsx

import './lib/init'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import AppLayout from './components/layout/AppLayout'
import PageLoader from './components/common/PageLoader'
import { ROUTES } from './constants/routes'

// ------------------------------------------------------------ LAZY PAGES

const SplashPage  = lazy(() => import('./pages/SplashPage'))
const HomePage    = lazy(() => import('./pages/HomePage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const HealthPage  = lazy(() => import('./pages/HealthPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

// ------------------------------------------------------------ ANIMATED ROUTES
// Must live inside BrowserRouter so useLocation is available

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.SPLASH}  element={<SplashPage />} />
          <Route path={ROUTES.HOME}    element={<HomePage />} />
          <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
          <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
          <Route path={ROUTES.HEALTH}  element={<HealthPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.SPLASH} replace />} />
      </Routes>
    </AnimatePresence>
  )
}

// ------------------------------------------------------------ APP

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

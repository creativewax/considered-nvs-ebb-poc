// src/components/layout/AppLayout.jsx

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomNav from './BottomNav'
import DesktopKeyline from './DesktopKeyline'
import AddSheet from '../add/AddSheet'
import { ROUTES } from '../../constants/routes'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const location = useLocation()
  const isSplash = location.pathname === ROUTES.SPLASH

  return (
    <>
      <main className={styles.content}>
        <Outlet />
      </main>
      <BottomNav
        onAddClick={() => setSheetOpen(true)}
        splashMode={isSplash}
      />
      <DesktopKeyline />
      <AnimatePresence>
        {sheetOpen && !isSplash && (
          <AddSheet onClose={() => setSheetOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

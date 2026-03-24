// src/components/layout/AppLayout.jsx

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import DesktopKeyline from './DesktopKeyline'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <main className={styles.content}>
        <Outlet />
      </main>
      <BottomNav onAddClick={() => setSheetOpen(true)} />
      <DesktopKeyline />
    </>
  )
}

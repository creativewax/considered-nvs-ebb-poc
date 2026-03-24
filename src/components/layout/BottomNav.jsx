// src/components/layout/BottomNav.jsx

import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Clock, Plus, Heart, Settings, ArrowRight } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import styles from './BottomNav.module.css'

// ------------------------------------------------------------ NAV CONFIG

const NAV_ITEMS = [
  { icon: Home,     label: 'Home',     path: ROUTES.HOME    },
  { icon: Heart,    label: 'Health',   path: ROUTES.HEALTH  },
  { icon: null,     label: 'Add',      path: null           },
  { icon: Clock,    label: 'History',  path: ROUTES.HISTORY },
  { icon: Settings, label: 'Settings', path: ROUTES.PROFILE },
]

// ------------------------------------------------------------ COMPONENT

export default function BottomNav({ onAddClick, splashMode = false }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    if (!path) return false
    if (path === ROUTES.HOME) return location.pathname === ROUTES.HOME
    return location.pathname.startsWith(path)
  }

  // ── SPLASH MODE: only show the arrow button in the centre
  if (splashMode) {
    return (
      <div className={styles.navWrapper}>
        <div className={styles.navBlur} />
        <nav className={styles.nav}>
          <div className={styles.addButtonWrapper}>
            <button
              className={styles.addButton}
              onClick={() => navigate(ROUTES.HOME)}
              aria-label="Enter app"
            >
              <ArrowRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        </nav>
      </div>
    )
  }

  // ── STANDARD MODE: full nav
  return (
    <div className={styles.navWrapper}>
      <div className={styles.navBlur} />
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
        if (item.path === null) {
          return (
            <div key="add" className={styles.addButtonWrapper}>
              <button
                className={styles.addButton}
                onClick={onAddClick}
                aria-label="Add entry"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>
          )
        }

        const Icon = item.icon
        const active = isActive(item.path)

        return (
          <button
            key={item.label}
            className={`${styles.item}${active ? ` ${styles.active}` : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
          </button>
        )
      })}
      </nav>
    </div>
  )
}

// src/components/layout/BottomNav.jsx

import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Clock, Plus, Heart, Settings } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import styles from './BottomNav.module.css'

// ------------------------------------------------------------ NAV CONFIG

const NAV_ITEMS = [
  { icon: Home,     label: 'Home',    path: ROUTES.HOME    },
  { icon: Clock,    label: 'History', path: ROUTES.HISTORY },
  { icon: null,     label: 'Add',     path: null           }, // centre add button
  { icon: Heart,    label: 'Health',   path: ROUTES.HEALTH  },
  { icon: Settings, label: 'Settings', path: ROUTES.PROFILE },
]

// ------------------------------------------------------------ COMPONENT

export default function BottomNav({ onAddClick }) {
  const location = useLocation()
  const navigate  = useNavigate()

  const isActive = (path) => {
    if (!path) return false
    if (path === ROUTES.HOME) return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => {
        // Centre add button
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

        const Icon   = item.icon
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
  )
}

// src/components/home/QuickLinks.jsx

import { useNavigate } from 'react-router-dom'
import { Activity, Clock } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import styles from './QuickLinks.module.css'

// ------------------------------------------------------------ QUICK LINKS

const LINKS = [
  { label: "Today's Sleep", path: ROUTES.HEALTH, icon: Activity, colour: 'var(--colour-good)' },
  { label: 'View History', path: ROUTES.HISTORY, icon: Clock, colour: 'var(--colour-accent)' },
]

export default function QuickLinks() {
  const navigate = useNavigate()

  return (
    <div className={styles.wrap}>
      {LINKS.map(({ label, path, icon: Icon, colour }) => (
        <button
          key={path}
          className={styles.link}
          onClick={() => navigate(path)}
        >
          <span className={styles.iconWrap} style={{ background: colour }}>
            <Icon size={16} color="white" />
          </span>
          <span className={styles.label}>{label}</span>
          <span className={styles.arrow} aria-hidden="true">&rarr;</span>
        </button>
      ))}
    </div>
  )
}

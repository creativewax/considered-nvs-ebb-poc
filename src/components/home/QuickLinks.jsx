// src/components/home/QuickLinks.jsx

import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import styles from './QuickLinks.module.css'

// ------------------------------------------------------------ QUICK LINKS

const LINKS = [
  { label: "Today's Sleep", path: ROUTES.HEALTH },
  { label: 'View History',  path: ROUTES.HISTORY },
]

export default function QuickLinks() {
  const navigate = useNavigate()

  return (
    <div className={styles.wrap}>
      {LINKS.map(({ label, path }) => (
        <button
          key={path}
          className={styles.link}
          onClick={() => navigate(path)}
        >
          <span>{label}</span>
          <span className={styles.arrow} aria-hidden="true">&rarr;</span>
        </button>
      ))}
    </div>
  )
}

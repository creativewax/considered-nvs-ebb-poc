// src/components/results/ResultsHeader.jsx

import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, Settings } from 'lucide-react'
import { QUALITY_LABELS } from '../../constants/sleep'
import styles from './ResultsHeader.module.css'

// ------------------------------------------------------------
// RESULTS HEADER — back button, title, badge, actions
// ------------------------------------------------------------

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

export function ResultsHeader({ record }) {
  const navigate = useNavigate()
  const qualityLabel = QUALITY_LABELS[record.quality] || 'Sleep'
  const dateLabel = formatDate(record.date)

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className={styles.title}>
            {qualityLabel} Sleep, {dateLabel}
          </h1>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            Connected
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Share">
          <Share2 size={18} />
        </button>
        <button className={styles.iconBtn} aria-label="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}

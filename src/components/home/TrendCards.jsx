// src/components/home/TrendCards.jsx

import { useSleep } from '../../hooks/useSleep'
import styles from './TrendCards.module.css'

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function average(records) {
  if (!records.length) return 0
  return records.reduce((sum, r) => sum + r.score, 0) / records.length
}

function trendIndicator(records) {
  // Need at least 6 records for a meaningful 3-vs-3 comparison
  if (records.length < 6) return '–'
  const recent   = average(records.slice(0, 3))
  const previous = average(records.slice(3, 6))
  const diff     = recent - previous
  if (diff > 2)  return '↑'
  if (diff < -2) return '↓'
  return '–'
}

// ------------------------------------------------------------
// TREND CARDS — average score + directional trend
// ------------------------------------------------------------

export default function TrendCards() {
  const { records } = useSleep()

  if (!records || records.length < 2) {
    return (
      <div className={styles.wrap}>
        <p className={styles.empty}>Sync more data for trends</p>
      </div>
    )
  }

  const avgScore = Math.round(average(records))
  const trend    = trendIndicator(records)

  // Colour the trend indicator
  const trendColour =
    trend === '↑' ? 'var(--colour-good)' :
    trend === '↓' ? 'var(--colour-poor)' :
    'var(--colour-text-muted)'

  return (
    <div className={`card-row ${styles.wrap}`}>

      {/* AVERAGE SCORE */}
      <div className="card">
        <p className={styles.cardLabel}>Avg Score</p>
        <p className={styles.cardValue}>{avgScore}</p>
      </div>

      {/* TREND DIRECTION */}
      <div className="card">
        <p className={styles.cardLabel}>Trend</p>
        <p className={styles.cardValue} style={{ color: trendColour }}>
          {trend}
        </p>
      </div>

    </div>
  )
}

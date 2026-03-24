// src/components/home/TrendCards.jsx

import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { useSleep } from '../../hooks/useSleep'
import styles from './TrendCards.module.css'

// ------------------------------------------------------------ HELPERS

function average(records) {
  if (!records.length) return 0
  return records.reduce((sum, r) => sum + r.score, 0) / records.length
}

function trendData(records) {
  if (records.length < 6) return { direction: 'stable', diff: 0 }
  const recent = average(records.slice(0, 3))
  const previous = average(records.slice(3, 6))
  const diff = Math.round(recent - previous)
  if (diff > 2) return { direction: 'up', diff }
  if (diff < -2) return { direction: 'down', diff }
  return { direction: 'stable', diff: 0 }
}

// ------------------------------------------------------------ TREND CARDS

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
  const trend = trendData(records)

  const trendIcon = trend.direction === 'up'
    ? <TrendingUp size={18} />
    : trend.direction === 'down'
      ? <TrendingDown size={18} />
      : <Minus size={18} />

  const trendColour = trend.direction === 'up'
    ? 'var(--colour-good)'
    : trend.direction === 'down'
      ? 'var(--colour-poor)'
      : 'var(--colour-text-muted)'

  const trendLabel = trend.direction === 'up'
    ? `+${trend.diff} pts`
    : trend.direction === 'down'
      ? `${trend.diff} pts`
      : 'Stable'

  const trendDesc = trend.direction === 'up'
    ? 'Improving vs last week'
    : trend.direction === 'down'
      ? 'Declining vs last week'
      : 'Consistent this week'

  return (
    <div className={styles.wrap}>
      {/* ── AVERAGE SCORE ── */}
      <div className={`${styles.card} ${styles.cardAvg}`}>
        <div className={styles.cardHeader}>
          <BarChart3 size={14} className={styles.cardIcon} style={{ color: 'var(--colour-good)' }} />
          <span className={styles.cardLabel}>7-Day Average</span>
        </div>
        <p className={styles.cardValue} style={{ color: 'var(--colour-good)' }}>{avgScore}</p>
        <p className={styles.cardDesc}>out of 100</p>
      </div>

      {/* ── WEEKLY TREND ── */}
      <div className={`${styles.card} ${styles.cardTrend}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon} style={{ color: trendColour }}>{trendIcon}</span>
          <span className={styles.cardLabel}>Weekly Trend</span>
        </div>
        <p className={styles.cardValue} style={{ color: trendColour }}>{trendLabel}</p>
        <p className={styles.cardDesc}>{trendDesc}</p>
      </div>
    </div>
  )
}

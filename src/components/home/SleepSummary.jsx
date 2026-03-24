// src/components/home/SleepSummary.jsx

import { useEffect } from 'react'
import { useSleep } from '../../hooks/useSleep'
import { QUALITY_LABELS, scoreToQuality } from '../../constants/sleep'
import { QUALITY_COLOURS } from '../../constants/colours'
import { formatDuration, formatDate } from '../../lib/utils'
import styles from './SleepSummary.module.css'

// ------------------------------------------------------------
// SLEEP SUMMARY — most recent night's data, centre-aligned
// ------------------------------------------------------------

export default function SleepSummary() {
  const { records, isLoading, loadRecords } = useSleep()

  useEffect(() => {
    loadRecords()
  }, [])

  if (isLoading) {
    return (
      <div className={styles.summary}>
        <p className={styles.empty}>Loading sleep data…</p>
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className={styles.summary}>
        <p className={styles.empty}>Connect your wearable to see your sleep data</p>
      </div>
    )
  }

  const latest    = records[0]
  const quality   = scoreToQuality(latest.score)
  const colour    = QUALITY_COLOURS[quality]?.primary ?? '#6E6E73'
  const label     = QUALITY_LABELS[quality]
  const duration  = formatDuration(latest.duration)
  const date      = formatDate(latest.date)

  return (
    <div className={styles.summary}>
      <p className={styles.date}>{date}</p>

      {/* Quality label — colour-coded to match quality level */}
      <p className={styles.qualityLabel} style={{ color: colour }}>
        {label} Sleep
      </p>

      <p className={styles.score}>{latest.score}</p>

      <p className={styles.duration}>{duration}</p>
    </div>
  )
}

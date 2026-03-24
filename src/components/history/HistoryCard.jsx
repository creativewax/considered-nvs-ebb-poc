// src/components/history/HistoryCard.jsx

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MiniOrb from './MiniOrb'
import { QUALITY_LABELS } from '../../constants/sleep'
import { QUALITY_COLOURS } from '../../constants/colours'
import { buildResultsPath } from '../../constants/routes'
import { formatDate, formatDuration } from '../../lib/utils'
import styles from './HistoryCard.module.css'

// ------------------------------------------------------------ HISTORY CARD
// One row per sleep record — mini-orb, date, quality label, score, duration.
// Navigates to /results/:id on tap.

export default function HistoryCard({ record }) {
  const navigate = useNavigate()
  const colours  = QUALITY_COLOURS[record.quality] || QUALITY_COLOURS.fair
  const label    = QUALITY_LABELS[record.quality]  || 'Unknown'

  return (
    <motion.button
      className={styles.card}
      onClick={() => navigate(buildResultsPath(record.id))}
      whileTap={{ scale: 0.98, boxShadow: 'none' }}
      aria-label={`View ${label} sleep on ${formatDate(record.date)}`}
    >
      <MiniOrb quality={record.quality} />

      <div className={styles.body}>
        <span className={styles.date}>{formatDate(record.date)}</span>
        <span
          className={styles.quality}
          style={{ color: colours.primary }}
        >
          {label}
        </span>
      </div>

      <div className={styles.stats}>
        <span className={styles.score}>{record.score}</span>
        <span className={styles.duration}>{formatDuration(record.sleepDuration)}</span>
      </div>
    </motion.button>
  )
}

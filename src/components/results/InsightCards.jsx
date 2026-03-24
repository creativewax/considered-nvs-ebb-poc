// src/components/results/InsightCards.jsx

import { Lightbulb } from 'lucide-react'
import { dataManager } from '../../managers/DataManager'
import styles from './InsightCards.module.css'

// ------------------------------------------------------------
// INSIGHT CARDS — CSU correlation insights for a sleep record
// ------------------------------------------------------------

export function InsightCards({ recordId, quality }) {
  const insights = dataManager.getInsights(recordId)
  if (!insights.length) return null

  const qualityClass = styles[quality] || ''

  return (
    <div className={styles.cards}>
      {insights.map((insight, i) => (
        <div key={i} className={`${styles.card} ${qualityClass}`}>
          <Lightbulb size={20} className={styles.icon} />
          <span>{insight.text}</span>
        </div>
      ))}
    </div>
  )
}

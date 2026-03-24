// src/components/results/MetricsRow.jsx

import { QUALITY_COLOURS } from '../../constants/colours'
import { ProgressRing } from '../common/ProgressRing'
import styles from './MetricsRow.module.css'

// ------------------------------------------------------------
// METRICS ROW — 4 circular progress rings
// ------------------------------------------------------------

function formatDuration(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h${m}` : `${h}h`
}

export function MetricsRow({ record }) {
  const colour = QUALITY_COLOURS[record.quality]?.primary || '#3DAA7A'
  const totalStages = record.lightSleep + record.deepSleep + record.remSleep
  const deepPct = totalStages > 0 ? Math.round((record.deepSleep / totalStages) * 100) : 0
  const remPct  = totalStages > 0 ? Math.round((record.remSleep / totalStages) * 100) : 0

  const metrics = [
    { value: record.score, max: 100, label: String(record.score), sublabel: 'Score' },
    { value: record.sleepDuration, max: 480, label: formatDuration(record.sleepDuration), sublabel: 'Duration' },
    { value: deepPct, max: 100, label: `${deepPct}%`, sublabel: 'Deep' },
    { value: remPct, max: 100, label: `${remPct}%`, sublabel: 'REM' },
  ]

  return (
    <div className={styles.row}>
      {metrics.map((m) => (
        <div key={m.sublabel} className={styles.item}>
          <ProgressRing
            value={m.value}
            max={m.max}
            colour={colour}
            label={m.label}
          />
          <span className={styles.sublabel}>{m.sublabel}</span>
        </div>
      ))}
    </div>
  )
}

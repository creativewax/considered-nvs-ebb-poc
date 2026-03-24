// src/components/results/ExpandableStats.jsx

import { Expandable } from '../common/Expandable'
import { HeartRateChart } from '../charts/HeartRateChart'
import { QUALITY_COLOURS } from '../../constants/colours'
import styles from './ExpandableStats.module.css'

// ------------------------------------------------------------
// EXPANDABLE STATS — heart rate, HRV, logs
// ------------------------------------------------------------

export function ExpandableStats({ record, entries = [] }) {
  const colour = QUALITY_COLOURS[record.quality]?.primary || '#3DAA7A'

  return (
    <div className={styles.wrapper}>
      {/* Heart Rate */}
      {record.heartRateTimeline?.length > 0 && (
        <Expandable title="Heart Rate">
          <HeartRateChart
            timeline={record.heartRateTimeline}
            colour={colour}
          />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Avg</span>
            <span className={styles.statValue}>{record.avgHeartRate} bpm</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Min</span>
            <span className={styles.statValue}>{record.minHeartRate} bpm</span>
          </div>
        </Expandable>
      )}

      {/* HRV */}
      {record.hrv != null && (
        <Expandable title="HRV">
          <div className={styles.hrvDisplay}>
            <span className={styles.hrvValue}>{record.hrv}</span>
            <span className={styles.hrvUnit}>ms</span>
          </div>
          <p className={styles.hrvNote}>
            Heart rate variability — higher values generally indicate better recovery and autonomic balance.
          </p>
        </Expandable>
      )}

      {/* Logs */}
      {entries.length > 0 && (
        <Expandable title={`Logs (${entries.length})`}>
          <ul className={styles.logList}>
            {entries.map((entry) => (
              <li key={entry.id} className={styles.logItem}>
                <span className={styles.logType}>{entry.type.replace('_', ' ')}</span>
                <span className={styles.logContent}>{entry.content}</span>
              </li>
            ))}
          </ul>
        </Expandable>
      )}
    </div>
  )
}

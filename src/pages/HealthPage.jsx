// src/pages/HealthPage.jsx

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BasePage from '../components/common/BasePage'
import { MetricsRow } from '../components/common/MetricsRow'
import { OrbCanvas } from '../components/orb/OrbCanvas'
import { Hypnogram } from '../components/charts/Hypnogram'
import { useSleep } from '../hooks/useSleep'
import { useOrb } from '../hooks/useOrb'
import { QUALITY_LABELS, scoreToQuality } from '../constants/sleep'
import { QUALITY_COLOURS } from '../constants/colours'
import { buildResultsPath } from '../constants/routes'
import { formatDuration } from '../lib/utils'
import styles from './HealthPage.module.css'

// ------------------------------------------------------------ HEALTH PAGE

export default function HealthPage() {
  useEffect(() => { document.title = 'Ebb — Health' }, [])

  const navigate = useNavigate()
  const { records, loadRecords, selectRecord } = useSleep()
  const { config } = useOrb()

  useEffect(() => { loadRecords() }, [])

  const latest = records && records.length > 0 ? records[0] : null

  // Trigger orb config calculation for the latest record
  useEffect(() => {
    if (latest?.id) selectRecord(latest.id)
  }, [latest?.id])

  if (!latest) {
    return (
      <BasePage>
        <div className="page-content">
          <h1 className="page-title">Health</h1>
          <p className="empty-state">No sleep data recorded today</p>
        </div>
      </BasePage>
    )
  }

  const quality = scoreToQuality(latest.score)
  const colour = QUALITY_COLOURS[quality]?.primary ?? '#6E6E73'
  const label = QUALITY_LABELS[quality]

  return (
    <BasePage>
      <div className="page-content">
        <h1 className="page-title">Health</h1>

        {/* ---- ORB ---- */}
        <OrbCanvas config={config} quality={quality} />

        {/* ---- QUALITY HEADER ---- */}
        <div className={`card ${styles.qualityHeader}`}>
          <p className={styles.qualityLabel} style={{ color: colour }}>
            {label} Sleep
          </p>
          <p className={styles.qualityScore}>{latest.score}</p>
          <p className={styles.qualitySub}>
            {formatDuration(latest.sleepDuration)} &middot; {latest.bedtime} – {latest.wakeTime}
          </p>
        </div>

        {/* ---- METRICS RINGS ---- */}
        <div className="card">
          <MetricsRow record={latest} />
        </div>

        {/* ---- HYPNOGRAM ---- */}
        <Hypnogram
          timeline={latest.stageTimeline}
          bedtime={latest.bedtime}
          wakeTime={latest.wakeTime}
        />

        {/* ---- VIEW FULL REPORT ---- */}
        <button
          className={styles.reportLink}
          onClick={() => navigate(buildResultsPath(latest.id))}
          style={{ color: colour }}
        >
          View full report &rarr;
        </button>
      </div>
    </BasePage>
  )
}

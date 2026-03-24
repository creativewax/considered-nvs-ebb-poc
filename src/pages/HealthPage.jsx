// src/pages/HealthPage.jsx

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BasePage from '../components/common/BasePage'
import { MetricsRow } from '../components/results/MetricsRow'
import { useSleep } from '../hooks/useSleep'
import { QUALITY_LABELS, scoreToQuality, STAGE_NAMES } from '../constants/sleep'
import { QUALITY_COLOURS, STAGE_COLOURS } from '../constants/colours'
import { buildResultsPath } from '../constants/routes'
import { formatDuration } from '../lib/utils'

// ------------------------------------------------------------ HEALTH PAGE

export default function HealthPage() {
  useEffect(() => { document.title = 'Ebb — Health' }, [])

  const navigate = useNavigate()
  const { records, loadRecords } = useSleep()

  useEffect(() => { loadRecords() }, [])

  const latest = records && records.length > 0 ? records[0] : null

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

  // Stage percentages for simplified display
  const totalStages = latest.lightSleep + latest.deepSleep + latest.remSleep + latest.awakeTime
  const stages = [
    { key: 'light', mins: latest.lightSleep },
    { key: 'deep',  mins: latest.deepSleep },
    { key: 'rem',   mins: latest.remSleep },
    { key: 'awake', mins: latest.awakeTime },
  ]

  return (
    <BasePage>
      <div className="page-content">
        <h1 className="page-title">Health</h1>

        {/* ---- QUALITY HEADER ---- */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <p style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--weight-medium)',
            color: colour,
            letterSpacing: 'var(--tracking-tight)',
          }}>
            {label} Sleep
          </p>
          <p style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--colour-text)',
            lineHeight: 'var(--leading-tight)',
          }}>
            {latest.score}
          </p>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--colour-text-secondary)',
            marginTop: 'var(--space-xs)',
          }}>
            {formatDuration(latest.sleepDuration)} &middot; {latest.bedtime} – {latest.wakeTime}
          </p>
        </div>

        {/* ---- METRICS RINGS ---- */}
        <div className="card" style={{ marginBottom: 'var(--space-sm)' }}>
          <MetricsRow record={latest} />
        </div>

        {/* ---- SLEEP STAGES ---- */}
        <div className="card" style={{ marginBottom: 'var(--space-sm)' }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-medium)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--colour-text-muted)',
            marginBottom: 'var(--space-md)',
          }}>
            Sleep Stages
          </p>

          {/* Stacked bar */}
          <div style={{
            display: 'flex',
            height: 8,
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: 'var(--space-md)',
          }}>
            {stages.map(({ key, mins }) => (
              <div
                key={key}
                style={{
                  width: `${totalStages > 0 ? (mins / totalStages) * 100 : 0}%`,
                  background: STAGE_COLOURS[key],
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-xs) var(--space-md)',
          }}>
            {stages.map(({ key, mins }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: STAGE_COLOURS[key],
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--colour-text)' }}>
                  {STAGE_NAMES[key]}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--colour-text-muted)', marginLeft: 'auto' }}>
                  {formatDuration(mins)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ---- VIEW FULL REPORT ---- */}
        <button
          onClick={() => navigate(buildResultsPath(latest.id))}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: 'var(--space-md)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--weight-medium)',
            color: colour,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          View full report &rarr;
        </button>
      </div>
    </BasePage>
  )
}

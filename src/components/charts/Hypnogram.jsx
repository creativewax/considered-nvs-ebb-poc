// src/components/charts/Hypnogram.jsx

import { useRef, useEffect } from 'react'
import { STAGE_COLOURS } from '../../constants/colours'
import { STAGE_NAMES } from '../../constants/sleep'
import styles from './Hypnogram.module.css'

// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------

const STAGES = ['awake', 'rem', 'light', 'deep']
const STAGE_Y = { awake: 0, rem: 1, light: 2, deep: 3 }
const PADDING_LEFT = 0
const PADDING_TOP = 4
const PADDING_BOTTOM = 4

// ------------------------------------------------------------
// TIME HELPERS
// ------------------------------------------------------------

function timeToMins(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function normaliseMins(mins, bedMins) {
  let val = mins - bedMins
  if (val < 0) val += 1440
  return val
}

function formatHour(mins) {
  const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60)
  const suffix = h >= 12 ? 'pm' : 'am'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}${suffix}`
}

// ------------------------------------------------------------
// HYPNOGRAM — canvas-based stepped line chart
// ------------------------------------------------------------

export function Hypnogram({ timeline, bedtime, wakeTime }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!timeline?.length || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio, 2)
    const w = rect.width
    const h = 100

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const bedMins = timeToMins(bedtime)
    const wakeMins = timeToMins(wakeTime)
    const totalSpan = normaliseMins(wakeMins, bedMins)

    const chartH = h - PADDING_TOP - PADDING_BOTTOM
    const stageHeight = chartH / (STAGES.length - 1)

    const yForStage = (stage) => PADDING_TOP + STAGE_Y[stage] * stageHeight

    // Draw each segment
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'

    for (let i = 0; i < timeline.length; i++) {
      const seg = timeline[i]
      const startNorm = normaliseMins(timeToMins(seg.start), bedMins)
      const endNorm = normaliseMins(timeToMins(seg.end), bedMins)

      const x1 = PADDING_LEFT + (startNorm / totalSpan) * (w - PADDING_LEFT)
      const x2 = PADDING_LEFT + (endNorm / totalSpan) * (w - PADDING_LEFT)
      const y = yForStage(seg.stage)

      ctx.strokeStyle = STAGE_COLOURS[seg.stage]
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y)
      ctx.stroke()

      // Vertical connector to next segment
      if (i < timeline.length - 1) {
        const nextY = yForStage(timeline[i + 1].stage)
        if (nextY !== y) {
          ctx.strokeStyle = 'rgba(174, 174, 178, 0.3)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(x2, y)
          ctx.lineTo(x2, nextY)
          ctx.stroke()
          ctx.lineWidth = 2.5
        }
      }
    }
  }, [timeline, bedtime, wakeTime])

  if (!timeline?.length) return null

  // Build x-axis labels
  const bedMins = timeToMins(bedtime)
  const wakeMins = timeToMins(wakeTime)
  const labels = [formatHour(bedMins)]
  const totalSpan = normaliseMins(wakeMins, bedMins)
  const midMins = (bedMins + Math.floor(totalSpan / 2)) % 1440
  labels.push(formatHour(midMins))
  labels.push(formatHour(wakeMins))

  return (
    <div className={styles.hypnogram}>
      <h3 className={styles.title}>Sleep Stages</h3>
      <div className={styles.chartWrapper}>
        <div className={styles.yLabels}>
          {STAGES.map((s) => (
            <span key={s}>{STAGE_NAMES[s]}</span>
          ))}
        </div>
        <div className={styles.chartArea} ref={containerRef}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
      </div>
      <div className={styles.xLabels}>
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <div className={styles.legend}>
        {STAGES.map((s) => (
          <div key={s} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ background: STAGE_COLOURS[s] }}
            />
            {STAGE_NAMES[s]}
          </div>
        ))}
      </div>
    </div>
  )
}

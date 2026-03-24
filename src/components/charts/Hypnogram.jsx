// src/components/charts/Hypnogram.jsx

import { useRef, useEffect, useCallback } from 'react'
import { STAGE_COLOURS } from '../../constants/colours'
import { STAGE_NAMES } from '../../constants/sleep'
import styles from './Hypnogram.module.css'

// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------

const STAGES = ['awake', 'rem', 'light', 'deep']
const STAGE_Y = { awake: 0, rem: 1, light: 2, deep: 3 }
const PADDING_LEFT = 6
const PADDING_RIGHT = 6
const PADDING_TOP = 8
const PADDING_BOTTOM = 8
const LINE_WIDTH = 6
const CONNECTOR_COLOUR = 'rgba(174, 174, 178, 0.3)'
const REVEAL_DURATION = 1500

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

  // ------------------------------------------------------------ DRAWING
  const drawSegments = useCallback((ctx, w, h, tl, bedMins, totalSpan) => {
    const chartH = h - PADDING_TOP - PADDING_BOTTOM
    const stageHeight = chartH / (STAGES.length - 1)
    const yForStage = (stage) => PADDING_TOP + STAGE_Y[stage] * stageHeight

    ctx.lineWidth = LINE_WIDTH
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const chartW = w - PADDING_LEFT - PADDING_RIGHT
    const CURVE_WIDTH = 3  // Thinner vertical/bezier transitions
    const CURVE_SPREAD = 7  // How far the S-curve extends horizontally

    // Pre-compute all segment positions
    const segs = tl.map((seg) => {
      const startNorm = normaliseMins(timeToMins(seg.start), bedMins)
      const endNorm = normaliseMins(timeToMins(seg.end), bedMins)
      return {
        x1: PADDING_LEFT + (startNorm / totalSpan) * chartW,
        x2: PADDING_LEFT + (endNorm / totalSpan) * chartW,
        y: yForStage(seg.stage),
        stage: seg.stage,
      }
    })

    for (let i = 0; i < segs.length; i++) {
      const { x1, x2, y, stage } = segs[i]
      const hasNext = i < segs.length - 1
      const nextSeg = hasNext ? segs[i + 1] : null
      const stageChanges = hasNext && nextSeg.y !== y

      // ── HORIZONTAL LINE (chunky) ──
      // Start after the previous S-curve ends, stop before the next one begins
      const hStart = (i > 0 && segs[i - 1].y !== y) ? x1 + CURVE_SPREAD : x1
      const hEnd = stageChanges ? x2 - CURVE_SPREAD : x2

      ctx.strokeStyle = STAGE_COLOURS[stage]
      ctx.lineWidth = LINE_WIDTH
      ctx.beginPath()
      ctx.moveTo(hStart, y)
      ctx.lineTo(hEnd, y)
      ctx.stroke()

      // ── S-CURVE TRANSITION (thinner, bezier) ──
      if (stageChanges) {
        const nextY = nextSeg.y
        const grad = ctx.createLinearGradient(x2, y, x2, nextY)
        grad.addColorStop(0, STAGE_COLOURS[stage])
        grad.addColorStop(1, STAGE_COLOURS[nextSeg.stage])

        ctx.strokeStyle = grad
        ctx.lineWidth = CURVE_WIDTH
        ctx.beginPath()
        ctx.moveTo(hEnd, y)
        ctx.bezierCurveTo(
          x2, y,
          x2, nextY,
          x2 + CURVE_SPREAD, nextY
        )
        ctx.stroke()
      }
    }
  }, [])

  // ------------------------------------------------------------ ANIMATED RENDER
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

    const bedMins = timeToMins(bedtime)
    const wakeMins = timeToMins(wakeTime)
    const totalSpan = normaliseMins(wakeMins, bedMins)

    // Animate: left-to-right reveal over REVEAL_DURATION
    let startTime = null
    let frameId = null

    function animateFrame(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / REVEAL_DURATION, 1)

      ctx.clearRect(0, 0, w, h)

      // Clip region reveals chart progressively
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, w * progress, h)
      ctx.clip()

      drawSegments(ctx, w, h, timeline, bedMins, totalSpan)

      ctx.restore()

      if (progress < 1) {
        frameId = requestAnimationFrame(animateFrame)
      }
    }

    frameId = requestAnimationFrame(animateFrame)

    return () => { if (frameId) cancelAnimationFrame(frameId) }
  }, [timeline, bedtime, wakeTime, drawSegments])

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

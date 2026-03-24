// src/components/charts/HeartRateChart.jsx

import { useRef, useEffect } from 'react'
import styles from './HeartRateChart.module.css'

// ------------------------------------------------------------
// HEART RATE CHART — canvas line chart for HR over time
// ------------------------------------------------------------

export function HeartRateChart({ timeline, colour = '#D0566C' }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!timeline?.length || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio, 2)
    const w = rect.width
    const h = 80

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const bpms = timeline.map((d) => d.bpm)
    const minBpm = Math.min(...bpms) - 4
    const maxBpm = Math.max(...bpms) + 4
    const range = maxBpm - minBpm || 1

    const padding = { top: 8, bottom: 16, left: 0, right: 0 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    // Draw line
    ctx.strokeStyle = colour
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()

    timeline.forEach((point, i) => {
      const x = padding.left + (i / (timeline.length - 1)) * chartW
      const y = padding.top + (1 - (point.bpm - minBpm) / range) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Fill gradient beneath
    const lastX = padding.left + chartW
    const lastY = padding.top + (1 - (timeline[timeline.length - 1].bpm - minBpm) / range) * chartH
    ctx.lineTo(lastX, h)
    ctx.lineTo(padding.left, h)
    ctx.closePath()

    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, colour + '30')
    grad.addColorStop(1, colour + '05')
    ctx.fillStyle = grad
    ctx.fill()

    // Min/max labels
    ctx.fillStyle = '#AEAEB2'
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(maxBpm)} bpm`, w, padding.top + 10)
    ctx.fillText(`${Math.round(minBpm)} bpm`, w, h - 2)
  }, [timeline, colour])

  if (!timeline?.length) return null

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} />
    </div>
  )
}

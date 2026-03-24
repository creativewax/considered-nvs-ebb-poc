// src/components/history/MiniOrb.jsx

import { useMemo } from 'react'
import { QUALITY_COLOURS } from '../../constants/colours'
import styles from './MiniOrb.module.css'

// ------------------------------------------------------------ HELPERS

// Simple hash from string to get consistent pseudo-random seed
function hashSeed(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Generate a deformed circle path as smooth cubic bezier curves
function generateBlobPath(cx, cy, baseRadius, deformation, points = 8, seed = 0) {
  const pts = []
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const noise = Math.sin(angle * 3 + seed) * deformation
    const r = baseRadius + noise
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    })
  }
  return pointsToSmoothPath(pts)
}

// Convert points to a smooth closed bezier path using Catmull-Rom-style control points
function pointsToSmoothPath(pts) {
  const n = pts.length
  if (n < 3) return ''

  const commands = []
  const tension = 0.3

  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n]
    const curr = pts[i]
    const next = pts[(i + 1) % n]
    const next2 = pts[(i + 2) % n]

    // Control point 1: based on prev -> next direction
    const cp1x = curr.x + (next.x - prev.x) * tension
    const cp1y = curr.y + (next.y - prev.y) * tension

    // Control point 2: based on curr -> next2 direction
    const cp2x = next.x - (next2.x - curr.x) * tension
    const cp2y = next.y - (next2.y - curr.y) * tension

    if (i === 0) {
      commands.push(`M ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`)
    }

    commands.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`)
  }

  commands.push('Z')
  return commands.join(' ')
}

// ------------------------------------------------------------ BLOB LAYERS CONFIG

const LAYERS = [
  { radiusFactor: 0.85, deformFactor: 0.15, opacityKey: 'bg',   points: 8 },
  { radiusFactor: 0.65, deformFactor: 0.12, opacityKey: 'mid',  points: 7 },
  { radiusFactor: 0.45, deformFactor: 0.10, opacityKey: 'front', points: 6 },
]

// Map quality to three fill colours + opacities
function getLayerFills(quality) {
  const colours = QUALITY_COLOURS[quality] || QUALITY_COLOURS.fair
  return [
    { colour: colours.primary, opacity: 0.3 },
    { colour: colours.accent || colours.primary, opacity: 0.6 },
    { colour: colours.primary, opacity: 1.0 },
  ]
}

// ------------------------------------------------------------ MINI ORB
// SVG-based organic blob shapes representing sleep quality.
// Each orb has 3 layered deformed-circle paths with quality-driven colours.

export default function MiniOrb({ quality, recordId = '' }) {
  const seed = hashSeed(recordId || quality)
  const fills = getLayerFills(quality)

  const paths = useMemo(() => {
    const cx = 24
    const cy = 24
    const baseRadius = 20

    return LAYERS.map((layer, i) => {
      const layerSeed = seed + i * 17
      const r = baseRadius * layer.radiusFactor
      const deform = r * layer.deformFactor
      const rotation = ((layerSeed % 360) * 0.7).toFixed(1)

      return {
        d: generateBlobPath(cx, cy, r, deform, layer.points, layerSeed * 0.1),
        fill: fills[i].colour,
        opacity: fills[i].opacity,
        rotation,
      }
    })
  }, [quality, seed])

  // Animation duration varies by quality — calmer for better sleep
  const duration = quality === 'poor' ? '4s'
    : quality === 'fair' ? '8s'
    : quality === 'good' ? '14s'
    : '20s'

  return (
    <div className={styles.orb} aria-hidden="true">
      <svg
        viewBox="0 0 48 48"
        width="48"
        height="48"
        className={styles.svg}
        style={{ animationDuration: duration }}
      >
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.fill}
            opacity={p.opacity}
            transform={`rotate(${p.rotation} 24 24)`}
          />
        ))}
      </svg>
    </div>
  )
}

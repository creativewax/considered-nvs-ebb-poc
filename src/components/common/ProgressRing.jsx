// src/components/common/ProgressRing.jsx

import { useEffect, useState } from 'react'
import styles from './ProgressRing.module.css'

// ------------------------------------------------------------
// PROGRESS RING — SVG circular progress indicator
// ------------------------------------------------------------

export function ProgressRing({
  value,
  max,
  colour,
  label,
  sublabel,
  size = 56,
}) {
  const [offset, setOffset] = useState(0)
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)

  // Animate dash offset on mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setOffset(circumference * (1 - pct))
    })
    return () => cancelAnimationFrame(timer)
  }, [circumference, pct])

  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.fill}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={colour}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.label}>
        <span className={styles.value}>{label}</span>
      </div>
    </div>
  )
}

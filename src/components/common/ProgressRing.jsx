// src/components/common/ProgressRing.jsx

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './ProgressRing.module.css'

// ------------------------------------------------------------ PROGRESS RING
// SVG circular progress with GSAP draw-in animation on the stroke.

export function ProgressRing({
  value,
  max,
  colour,
  label,
  size = 56,
}) {
  const fillRef = useRef(null)
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)
  const targetOffset = circumference * (1 - pct)

  useEffect(() => {
    if (!fillRef.current) return

    // Start fully hidden (full offset = no visible stroke)
    gsap.set(fillRef.current, { attr: { 'stroke-dashoffset': circumference } })

    // Animate the arc drawing in
    gsap.to(fillRef.current, {
      attr: { 'stroke-dashoffset': targetOffset },
      duration: 1.2,
      delay: 0.3,
      ease: 'power2.out',
    })
  }, [circumference, targetOffset])

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
          ref={fillRef}
          className={styles.fill}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={colour}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className={styles.label}>
        <span className={styles.value}>{label}</span>
      </div>
    </div>
  )
}

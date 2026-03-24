// src/components/home/HomeAnimation.jsx

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './HomeAnimation.module.css'

// ------------------------------------------------------------
// SPIROGRAPH SVG — concentric radial lines at low opacity
// ------------------------------------------------------------

function Spirograph() {
  const circles = [40, 80, 120, 160, 200, 240, 280]
  const diagonals = Array.from({ length: 12 }, (_, i) => i * 30)

  return (
    <svg
      className={styles.radial}
      width="600"
      height="600"
      viewBox="-300 -300 600 600"
      aria-hidden="true"
    >
      {circles.map((r) => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#2D2D35" strokeWidth="0.5" />
      ))}
      {diagonals.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 280
        const y = Math.sin(rad) * 280
        return (
          <line key={angle} x1={-x} y1={-y} x2={x} y2={y} stroke="#2D2D35" strokeWidth="0.5" />
        )
      })}
    </svg>
  )
}

// ------------------------------------------------------------
// HOME ANIMATION — ambient background layer
// ------------------------------------------------------------

export default function HomeAnimation() {
  const arc1Ref = useRef(null)
  const arc2Ref = useRef(null)
  const arc3Ref = useRef(null)
  const arc4Ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Each arc rotates at a different speed for organic feel
      gsap.to(arc1Ref.current, { rotation: 360, duration: 14, ease: 'none', repeat: -1 })
      gsap.to(arc2Ref.current, { rotation: -360, duration: 10, ease: 'none', repeat: -1 })
      gsap.to(arc3Ref.current, { rotation: 360, duration: 12, ease: 'none', repeat: -1 })
      gsap.to(arc4Ref.current, { rotation: -360, duration: 15, ease: 'none', repeat: -1 })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className={styles.ambient} aria-hidden="true">
      {/* THICK FILLED ARCS — solid coloured crescent/petal shapes */}
      <div ref={arc1Ref} className={`${styles.arc} ${styles.arcPurple}`} />
      <div ref={arc2Ref} className={`${styles.arc} ${styles.arcTeal}`} />
      <div ref={arc3Ref} className={`${styles.arc} ${styles.arcOrange}`} />
      <div ref={arc4Ref} className={`${styles.arc} ${styles.arcCoral}`} />

      {/* RADIAL SPIROGRAPH — concentric lines at very low opacity */}
      <Spirograph />

      {/* CENTRAL LOGO — breathing animation */}
      <div className={styles.logoWrap}>
        <span className={`${styles.logo} animate-breathe`}>ebb</span>
      </div>
    </div>
  )
}

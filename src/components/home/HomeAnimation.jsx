// src/components/home/HomeAnimation.jsx

import styles from './HomeAnimation.module.css'

// ------------------------------------------------------------ SPIROGRAPH
// Fine concentric rings + radial spokes at very low opacity

function Spirograph() {
  const rings = [50, 85, 120, 155, 190, 225]
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15)

  return (
    <svg
      className={styles.radial}
      viewBox="-250 -250 500 500"
      aria-hidden="true"
    >
      {rings.map((r) => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#1C1C1E" strokeWidth="0.4" />
      ))}
      {spokes.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 225
        const y = Math.sin(rad) * 225
        return (
          <line key={angle} x1="0" y1="0" x2={x} y2={y} stroke="#1C1C1E" strokeWidth="0.25" />
        )
      })}
    </svg>
  )
}

// ------------------------------------------------------------ HOME ANIMATION
// Arcs placeholder — will be replaced with Figma-exported SVG assets

export default function HomeAnimation() {
  return (
    <div className={styles.ambient} aria-hidden="true">
      {/* ARCS — awaiting Figma export, will be dropped in as SVG */}

      {/* SPIROGRAPH */}
      <Spirograph />
    </div>
  )
}

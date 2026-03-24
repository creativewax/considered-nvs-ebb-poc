// src/components/orb/OrbFallback.jsx

import { QUALITY_COLOURS } from '../../constants/colours'
import styles from './OrbFallback.module.css'

// ------------------------------------------------------------
// ORB FALLBACK — CSS-only radial gradient for no WebGL
// ------------------------------------------------------------

export function OrbFallback({ quality = 'good' }) {
  const colours = QUALITY_COLOURS[quality] || QUALITY_COLOURS.good
  const gradient = `radial-gradient(circle, ${colours.primary} 0%, ${colours.accent} 100%)`

  return (
    <div
      className={styles.fallback}
      style={{ background: gradient }}
    />
  )
}

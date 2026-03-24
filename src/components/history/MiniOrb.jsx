// src/components/history/MiniOrb.jsx

import { QUALITY_COLOURS } from '../../constants/colours'
import styles from './MiniOrb.module.css'

// ------------------------------------------------------------ MINI ORB
// Animated CSS orb representing sleep quality.
// Uses a radial gradient base + rotating conic-gradient noise layer.
// Noise speed and opacity vary by quality — poor is agitated, excellent is serene.

const NOISE_CONFIG = {
  poor:      { duration: '2s',  opacity: 0.8 },
  fair:      { duration: '5s',  opacity: 0.5 },
  good:      { duration: '10s', opacity: 0.2 },
  excellent: { duration: '15s', opacity: 0.05 },
}

export default function MiniOrb({ quality }) {
  const colours = QUALITY_COLOURS[quality] || QUALITY_COLOURS.fair
  const noise   = NOISE_CONFIG[quality]   || NOISE_CONFIG.fair

  const gradient = quality === 'poor'
    ? `radial-gradient(circle at 35% 35%, ${colours.deep}, ${colours.primary}, ${colours.accent})`
    : `radial-gradient(circle at 35% 35%, ${colours.accent ?? colours.primary}, ${colours.primary})`

  return (
    <div
      className={styles.orb}
      style={{ background: gradient }}
      aria-hidden="true"
    >
      <div
        className={styles.noise}
        style={{
          opacity:          noise.opacity,
          animationDuration: noise.duration,
        }}
      />
    </div>
  )
}

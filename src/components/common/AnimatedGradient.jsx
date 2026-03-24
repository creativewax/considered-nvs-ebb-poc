// src/components/common/AnimatedGradient.jsx

import styles from './AnimatedGradient.module.css'

// ------------------------------------------------------------ ANIMATED GRADIENT
// Subtle angled gradient that slowly shifts. Use as a background
// layer on pages that don't have a 3D orb or pixi element.

export default function AnimatedGradient({ fadeToWhite = true }) {
  return <div className={`${fadeToWhite ? styles.gradientFade : styles.gradient}`} aria-hidden="true" />
}

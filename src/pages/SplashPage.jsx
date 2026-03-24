// src/pages/SplashPage.jsx

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '../constants/routes'
import PixiBackground from '../components/splash/PixiBackground'
import logoSvg from '../assets/Logo.svg'
import dotsSvg from '../assets/Dots.svg'
import dotsBkgdSvg from '../assets/DotsBkgd.svg'
import styles from './SplashPage.module.css'

// ------------------------------------------------------------ ANIMATION CONFIG

const FADE_VARIANTS = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  }),
}

// ------------------------------------------------------------ SPIROGRAPH SVG

function SpirographDecoration() {
  const circles = [60, 80, 100, 120, 140, 160]
  const lines = Array.from({ length: 24 }, (_, i) => i * 15)

  return (
    <svg viewBox="0 0 380 380" className={styles.spirograph}>
      {circles.map((r) => (
        <circle
          key={r}
          cx="190"
          cy="190"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      ))}
      {lines.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x2 = 190 + 170 * Math.cos(rad)
        const y2 = 190 + 170 * Math.sin(rad)
        return (
          <line
            key={angle}
            x1="190"
            y1="190"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.3"
          />
        )
      })}
    </svg>
  )
}

// ------------------------------------------------------------ COMPONENT

export default function SplashPage() {
  const navigate = useNavigate()

  const handleEnter = () => navigate(ROUTES.HOME)

  return (
    <div className={styles.splash}>
      <PixiBackground />

      <div className={styles.svgStack}>
        <SpirographDecoration />

        <motion.img
          src={dotsBkgdSvg}
          alt=""
          className={styles.dotsBkgd}
          variants={FADE_VARIANTS}
          initial="hidden"
          animate="visible"
          custom={0.7}
        />

        <motion.img
          src={dotsSvg}
          alt=""
          className={styles.dots}
          variants={FADE_VARIANTS}
          initial="hidden"
          animate="visible"
          custom={0.5}
        />

        <motion.img
          src={logoSvg}
          alt="Ebb"
          className={styles.logo}
          variants={FADE_VARIANTS}
          initial="hidden"
          animate="visible"
          custom={0.3}
        />
      </div>

      <motion.div
        className={styles.bottomBar}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0, ease: 'easeOut' }}
      >
        <button
          className={styles.arrowButton}
          onClick={handleEnter}
          aria-label="Enter app"
        >
          <ArrowRight size={22} strokeWidth={2.5} />
        </button>
      </motion.div>
    </div>
  )
}

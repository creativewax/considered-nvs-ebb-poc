// src/pages/SplashPage.jsx

import { motion } from 'framer-motion'
import BasePage from '../components/common/BasePage'
import PixiBackground from '../components/splash/PixiBackground'
import logoSvg from '../assets/Logo.svg'
import dotsSvg from '../assets/Dots.svg'
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

const SLIDE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: 'easeOut' },
  }),
}

// ------------------------------------------------------------ SPIROGRAPH

function Spirograph() {
  const rings = [50, 80, 110, 140, 170]
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15)

  return (
    <svg viewBox="0 0 380 380" className={styles.spirograph}>
      {rings.map((r) => (
        <circle key={r} cx="190" cy="190" r={r} fill="none" stroke="currentColor" strokeWidth="0.5" />
      ))}
      {spokes.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x2 = 190 + 170 * Math.cos(rad)
        const y2 = 190 + 170 * Math.sin(rad)
        return (
          <line key={angle} x1="190" y1="190" x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.3" />
        )
      })}
    </svg>
  )
}

// ------------------------------------------------------------ COMPONENT

export default function SplashPage() {
  return (
    <BasePage className={styles.splash}>
      {/* ── HEADING ── */}
      <motion.h1
        className={styles.heading}
        variants={SLIDE_UP}
        initial="hidden"
        animate="visible"
        custom={0.2}
      >
        <strong>Ebb:</strong> Living Between Waves
      </motion.h1>

      {/* ── ORB STACK ── */}
      <div className={styles.svgStack}>
        {/* PixiJS organic blob — centred on the orb, sized via vw */}
        <div className={styles.pixiLayer}>
          <PixiBackground />
        </div>

        <Spirograph />

        {/* <motion.div
          className={styles.whiteCircle}
          variants={FADE_VARIANTS}
          initial="hidden"
          animate="visible"
          custom={0.6}
        /> */}

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

      {/* ── BODY COPY ── */}
      <motion.div
        className={styles.bodyCopy}
        variants={SLIDE_UP}
        initial="hidden"
        animate="visible"
        custom={0.9}
      >
        <p className={styles.bodyPrimary}>
          Every itch has its ebb. Track the flow, visualise the patterns, find peace in the spaces between flares. Your journey from hives to rest, rendered as living art.
        </p>
      </motion.div>
    </BasePage>
  )
}

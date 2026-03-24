// src/components/common/BasePage.jsx

import { motion } from 'framer-motion'
import styles from './BasePage.module.css'

// ------------------------------------------------------------ BASE PAGE
// Wraps every page with consistent background, padding, and fade-in.
// Individual pages can add their own animations on top of this.

const PAGE_VARIANTS = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:     { opacity: 0, transition: { duration: 0.15 } },
}

export default function BasePage({ children, className = '' }) {
  return (
    <motion.div
      className={`${styles.page} ${className}`}
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

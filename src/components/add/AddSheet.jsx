// src/components/add/AddSheet.jsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import LogForm from './LogForm'
import CsuTriggerForm from './CsuTriggerForm'
import { LOG_COLOURS } from '../../constants/colours'
import styles from './AddSheet.module.css'

// ------------------------------------------------------------ CONSTANTS

const CATEGORIES = [
  { type: 'photo',       label: 'Photo of Place' },
  { type: 'food',        label: 'Food' },
  { type: 'sleep_note',  label: 'Sleep Note' },
  { type: 'csu_trigger', label: 'CSU Trigger' },
]

const SHEET_VARIANTS = {
  initial: { y: '100%' },
  animate: { y: 0,      transition: { type: 'spring', damping: 28, stiffness: 280 } },
  exit:    { y: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
}

// ------------------------------------------------------------ ADD SHEET
// Slides up from the nav bar. Shows category list; tapping a category
// replaces the list with the relevant form inline.

export default function AddSheet({ onClose }) {
  const [activeType, setActiveType] = useState(null)

  const handleClose = () => {
    setActiveType(null)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <motion.div
        className={styles.sheet}
        variants={SHEET_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-label="Add log entry"
      >
        <div className={styles.handle} aria-hidden="true" />

        <h2 className={styles.heading}>Add</h2>

        {/* ---- FORM OR CATEGORY LIST ---- */}
        {activeType === 'csu_trigger' ? (
          <CsuTriggerForm
            onBack={() => setActiveType(null)}
            onClose={handleClose}
          />
        ) : activeType ? (
          <LogForm
            type={activeType}
            onBack={() => setActiveType(null)}
            onClose={handleClose}
          />
        ) : (
          <>
            <ul className={styles.list}>
              {CATEGORIES.map(({ type, label }) => (
                <li key={type}>
                  <button
                    className={styles.categoryBtn}
                    onClick={() => setActiveType(type)}
                  >
                    <span
                      className={styles.dot}
                      style={{ background: LOG_COLOURS[type] }}
                      aria-hidden="true"
                    />
                    <span className={styles.categoryLabel}>{label}</span>
                    <span className={styles.chevron} aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Close button */}
            <button
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close"
            >
              ✕
            </button>
          </>
        )}
      </motion.div>
    </>
  )
}

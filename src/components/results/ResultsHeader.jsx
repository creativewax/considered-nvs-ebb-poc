// src/components/results/ResultsHeader.jsx

import { useRef, useCallback, useNavigate } from 'react'
import { useNavigate as useNav } from 'react-router-dom'
import { ChevronLeft, Share2, Volume2, VolumeX } from 'lucide-react'
import { QUALITY_LABELS } from '../../constants/sleep'
import { formatDuration } from '../../lib/utils'
import { unlockIOSAudio } from '../../lib/audio/iosUnlock'
import styles from './ResultsHeader.module.css'

// ------------------------------------------------------------
// RESULTS HEADER — back button, title, badge, actions
// ------------------------------------------------------------

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

export function ResultsHeader({ record, playing, onToggleSound }) {
  const navigate = useNav()
  const qualityLabel = QUALITY_LABELS[record.quality] || 'Sleep'
  const dateLabel = formatDate(record.date)

  // iOS requires audio unlock from a synchronous native event handler.
  // React's synthetic onClick can lose the user gesture context.
  const soundBtnRef = useRef(null)
  const attachedRef = useRef(false)
  const soundRef = useCallback((node) => {
    soundBtnRef.current = node
    if (node && !attachedRef.current) {
      attachedRef.current = true
      node.addEventListener('touchend', (e) => {
        e.preventDefault()
        unlockIOSAudio()
        onToggleSound()
      }, { passive: false })
    }
  }, [onToggleSound])

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className={styles.title}>
            {qualityLabel} Sleep, {dateLabel}
          </h1>
          <p className={styles.qualitySub}>
            {formatDuration(record.sleepDuration)} &middot; {record.bedtime} – {record.wakeTime}
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          Connected
        </span>
        <button className={styles.iconBtn} aria-label="Share">
          <Share2 size={18} />
        </button>
        <button
          ref={soundRef}
          className={styles.iconBtn}
          onClick={onToggleSound}
          aria-label={playing ? 'Mute sound' : 'Play sound'}
        >
          {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </header>
  )
}

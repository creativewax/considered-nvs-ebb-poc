// src/components/add/LogForm.jsx

import { useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import { generateId } from '../../lib/utils'
import { LOG_COLOURS } from '../../constants/colours'
import styles from './LogForm.module.css'

// ------------------------------------------------------------ LOG FORM
// Simple text form for photo / food / sleep_note log types.
// Back arrow returns to the category list.

const TYPE_LABELS = {
  photo:      'Photo of Place',
  food:       'Food',
  sleep_note: 'Sleep Note',
}

const TYPE_PLACEHOLDERS = {
  photo:      'Describe the place you slept or upload a photo…',
  food:       'What did you eat today? Note anything unusual…',
  sleep_note: 'Any observations about how you slept…',
}

export default function LogForm({ type, onBack, onClose }) {
  const [content, setContent] = useState('')
  const { addEntry } = useLogs()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return

    addEntry({
      id:            generateId(),
      sleepRecordId: null,
      type,
      content:       content.trim(),
      imageUrl:      null,
      createdAt:     new Date(),
    })

    onClose()
  }

  const dotColour = LOG_COLOURS[type]

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      {/* ---- HEADER ---- */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Back to categories"
        >
          ←
        </button>
        <span
          className={styles.dot}
          style={{ background: dotColour }}
          aria-hidden="true"
        />
        <span className={styles.title}>{TYPE_LABELS[type]}</span>
      </div>

      {/* ---- TEXTAREA ---- */}
      <textarea
        className={styles.textarea}
        placeholder={TYPE_PLACEHOLDERS[type]}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        autoFocus
      />

      {/* ---- SUBMIT ---- */}
      <button
        type="submit"
        className={styles.submit}
        disabled={!content.trim()}
      >
        Save
      </button>

    </form>
  )
}

// src/components/add/CsuTriggerForm.jsx

import { useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import { generateId } from '../../lib/utils'
import { LOG_COLOURS } from '../../constants/colours'
import styles from './CsuTriggerForm.module.css'

// ------------------------------------------------------------ CSU TRIGGER FORM
// Extended form for logging a CSU flare event.
// Captures severity, intensity, hives, antihistamine, stress, and notes.

const DEFAULT_STATE = {
  flareSeverity:     5,
  itchIntensity:     5,
  hivesPresent:      false,
  antihistamineTaken: false,
  stressLevel:       3,
  notes:             '',
}

export default function CsuTriggerForm({ onBack, onClose }) {
  const [form, setForm] = useState(DEFAULT_STATE)
  const { addEntry } = useLogs()

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()

    addEntry({
      id:            generateId(),
      sleepRecordId: null,
      type:          'csu_trigger',
      content:       form.notes.trim() || 'CSU trigger logged',
      imageUrl:      null,
      createdAt:     new Date(),
      triggerData: {
        flareSeverity:      form.flareSeverity,
        itchIntensity:      form.itchIntensity,
        hivesPresent:       form.hivesPresent,
        antihistamineTaken: form.antihistamineTaken,
        antihistamineTime:  null,
        stressLevel:        form.stressLevel,
        notes:              form.notes.trim(),
      },
    })

    onClose()
  }

  const dotColour = LOG_COLOURS.csu_trigger

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
        <span className={styles.title}>CSU Trigger</span>
      </div>

      <div className={styles.fields}>

        {/* ---- FLARE SEVERITY ---- */}
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.fieldLabel} htmlFor="flareSeverity">
              Flare Severity
            </label>
            <span className={styles.fieldValue}>{form.flareSeverity}</span>
          </div>
          <input
            id="flareSeverity"
            type="range"
            min={1}
            max={10}
            value={form.flareSeverity}
            onChange={(e) => set('flareSeverity', Number(e.target.value))}
            className={styles.range}
            style={{ '--pct': `${(form.flareSeverity - 1) / 9 * 100}%` }}
          />
          <div className={styles.rangeLabels}>
            <span>Mild</span><span>Severe</span>
          </div>
        </div>

        {/* ---- ITCH INTENSITY ---- */}
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.fieldLabel} htmlFor="itchIntensity">
              Itch Intensity
            </label>
            <span className={styles.fieldValue}>{form.itchIntensity}</span>
          </div>
          <input
            id="itchIntensity"
            type="range"
            min={1}
            max={10}
            value={form.itchIntensity}
            onChange={(e) => set('itchIntensity', Number(e.target.value))}
            className={styles.range}
            style={{ '--pct': `${(form.itchIntensity - 1) / 9 * 100}%` }}
          />
          <div className={styles.rangeLabels}>
            <span>None</span><span>Intense</span>
          </div>
        </div>

        {/* ---- STRESS LEVEL ---- */}
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.fieldLabel} htmlFor="stressLevel">
              Stress Level
            </label>
            <span className={styles.fieldValue}>{form.stressLevel}</span>
          </div>
          <input
            id="stressLevel"
            type="range"
            min={1}
            max={5}
            value={form.stressLevel}
            onChange={(e) => set('stressLevel', Number(e.target.value))}
            className={styles.range}
            style={{ '--pct': `${(form.stressLevel - 1) / 4 * 100}%` }}
          />
          <div className={styles.rangeLabels}>
            <span>Low</span><span>High</span>
          </div>
        </div>

        {/* ---- TOGGLES ---- */}
        <div className={styles.toggleRow}>
          <span className={styles.fieldLabel}>Hives Present</span>
          <button
            type="button"
            className={`${styles.toggle} ${form.hivesPresent ? styles.toggleOn : ''}`}
            onClick={() => set('hivesPresent', !form.hivesPresent)}
            aria-pressed={form.hivesPresent}
          >
            {form.hivesPresent ? 'Yes' : 'No'}
          </button>
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.fieldLabel}>Antihistamine Taken</span>
          <button
            type="button"
            className={`${styles.toggle} ${form.antihistamineTaken ? styles.toggleOn : ''}`}
            onClick={() => set('antihistamineTaken', !form.antihistamineTaken)}
            aria-pressed={form.antihistamineTaken}
          >
            {form.antihistamineTaken ? 'Yes' : 'No'}
          </button>
        </div>

        {/* ---- NOTES ---- */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="csuNotes">Notes</label>
          <textarea
            id="csuNotes"
            className={styles.textarea}
            placeholder="Any additional observations…"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
          />
        </div>

      </div>

      {/* ---- SUBMIT ---- */}
      <button type="submit" className={styles.submit}>
        Save Trigger
      </button>

    </form>
  )
}

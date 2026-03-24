// src/components/profile/Settings.jsx

import styles from './Settings.module.css'

// ------------------------------------------------------------ SETTINGS
// Static settings display — sleep target + about section.

export default function Settings() {
  return (
    <div className={styles.settings}>

      {/* ---- SLEEP TARGET ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <div className={styles.row}>
          <span className={styles.label}>Sleep Target</span>
          <span className={styles.value}>8h</span>
        </div>
      </section>

      {/* ---- ABOUT ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <div className={styles.row}>
          <span className={styles.label}>Ebb</span>
          <span className={styles.value}>Version 0.1.0 (POC)</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Built for</span>
          <span className={styles.value}>Novartis</span>
        </div>
      </section>

    </div>
  )
}

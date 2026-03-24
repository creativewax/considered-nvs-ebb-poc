// src/components/profile/Settings.jsx

import styles from './Settings.module.css'

// ------------------------------------------------------------ SETTINGS
// Static settings display — sleep target, stats, and about section.

export default function Settings({ stats = {} }) {
  const { avgScore = 0, totalNights = 0, csuCount = 0 } = stats

  return (
    <div className={styles.settings}>

      {/* ---- SLEEP TARGET ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <div className={styles.row}>
          <span className={styles.label}>Sleep Goal</span>
          <span className={styles.value}>8 hours</span>
        </div>
      </section>

      {/* ---- STATS ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Statistics</h2>
        <div className={styles.row}>
          <span className={styles.label}>Average Score (last 7 days)</span>
          <span className={styles.value}>{avgScore}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Total Nights Tracked</span>
          <span className={styles.value}>{totalNights}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>CSU Triggers Logged</span>
          <span className={styles.value}>{csuCount}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Streak</span>
          <span className={styles.value}>4 nights tracked</span>
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

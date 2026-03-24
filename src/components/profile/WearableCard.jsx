// src/components/profile/WearableCard.jsx

import { useDevice } from '../../hooks/useDevice'
import styles from './WearableCard.module.css'

// ------------------------------------------------------------ WEARABLE CARD
// Shows the Apple Watch connection status and last sync time.

const formatLastSync = (syncedAt) => {
  if (!syncedAt) return 'Never'

  const diff = Math.floor((Date.now() - new Date(syncedAt).getTime()) / 1000)

  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function WearableCard() {
  const { connected, lastSync } = useDevice()

  return (
    <div className={styles.card}>
      <div className={styles.icon} aria-hidden="true">
        ⌚
      </div>

      <div className={styles.body}>
        <span className={styles.name}>Apple Watch</span>
        <span className={styles.sync}>Last sync: {formatLastSync(lastSync)}</span>
      </div>

      <div className={styles.status}>
        <span
          className={styles.dot}
          style={{ background: connected ? 'var(--colour-connected)' : 'var(--colour-text-muted)' }}
          aria-hidden="true"
        />
        <span
          className={styles.statusLabel}
          style={{ color: connected ? 'var(--colour-connected)' : 'var(--colour-text-muted)' }}
        >
          {connected ? 'Connected' : 'Not Connected'}
        </span>
      </div>
    </div>
  )
}

// src/components/profile/SyncButton.jsx

import { useDevice } from '../../hooks/useDevice'
import styles from './SyncButton.module.css'

// ------------------------------------------------------------ SYNC BUTTON
// Triggers fake wearable sync via DeviceManager.
// Shows spinner + progress while syncing, disabled until complete.

export default function SyncButton() {
  const { syncing, syncProgress, requestSync } = useDevice()

  return (
    <button
      className={styles.button}
      onClick={requestSync}
      disabled={syncing}
      aria-label={syncing ? `Syncing — ${syncProgress ?? 0}%` : 'Sync Now'}
    >
      {syncing ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span>{syncProgress ?? 0}%</span>
        </>
      ) : (
        'Sync Now'
      )}
    </button>
  )
}

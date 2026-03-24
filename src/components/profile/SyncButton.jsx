// src/components/profile/SyncButton.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Clock } from 'lucide-react'
import { useDevice } from '../../hooks/useDevice'
import { useSleep } from '../../hooks/useSleep'
import { ROUTES, buildResultsPath } from '../../constants/routes'
import styles from './SyncButton.module.css'

// ------------------------------------------------------------ SYNC BUTTON

export default function SyncButton() {
  const { syncing, syncProgress, requestSync } = useDevice()
  const { records } = useSleep()
  const navigate = useNavigate()
  const [syncComplete, setSyncComplete] = useState(false)

  const handleSync = () => {
    setSyncComplete(false)
    requestSync()

    // Show nav buttons after sync completes (~3s)
    setTimeout(() => setSyncComplete(true), 3200)
  }

  const latestRecord = records?.[0]

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        onClick={handleSync}
        disabled={syncing}
        aria-label={syncing ? `Syncing — ${Math.ceil(syncProgress ?? 0)}%` : 'Sync Now'}
      >
        {syncing ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span>{Math.ceil(syncProgress ?? 0)}%</span>
          </>
        ) : syncComplete ? (
          'Sync Complete'
        ) : (
          'Sync Now'
        )}
      </button>

      <AnimatePresence>
        {syncComplete && (
          <motion.div
            className={styles.navButtons}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {latestRecord && (
              <button
                className={styles.navButton}
                onClick={() => navigate(buildResultsPath(latestRecord.id))}
              >
                <Activity size={16} />
                Today's Score
              </button>
            )}
            <button
              className={styles.navButton}
              onClick={() => navigate(ROUTES.HISTORY)}
            >
              <Clock size={16} />
              View History
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

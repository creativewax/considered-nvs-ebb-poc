// src/pages/HistoryPage.jsx

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import BasePage from '../components/common/BasePage'
import AnimatedGradient from '../components/common/AnimatedGradient'
import HistoryCard from '../components/history/HistoryCard'
import { useSleep } from '../hooks/useSleep'
import { useDevice } from '../hooks/useDevice'
import { ROUTES } from '../constants/routes'

// ------------------------------------------------------------ HISTORY PAGE

const LIST_VARIANTS = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
}

const ITEM_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

export default function HistoryPage() {
  useEffect(() => { document.title = 'Ebb — History' }, [])

  const navigate = useNavigate()
  const { records } = useSleep()
  const { lastSync } = useDevice()

  const sorted = records
    ? [...records].sort((a, b) => new Date(b.date) - new Date(a.date))
    : []

  const hasNotSynced = !lastSync

  return (
    <BasePage>
      <AnimatedGradient fadeToWhite={true} />
      <div className="page-content" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="page-title"><strong>Your</strong> Sleep History</h1>

        {hasNotSynced && (
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
              width: '100%',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-md)',
              background: 'var(--colour-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-medium)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            Sync Your Wearable for More Data
          </button>
        )}

        {sorted.length === 0 ? (
          <p className="empty-state">Connect your wearable to see sleep history</p>
        ) : (
          <motion.ul
            className="card-list"
            variants={LIST_VARIANTS}
            initial="initial"
            animate="animate"
          >
            {sorted.map((record) => (
              <motion.li key={record.id} variants={ITEM_VARIANTS}>
                <HistoryCard record={record} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </BasePage>
  )
}

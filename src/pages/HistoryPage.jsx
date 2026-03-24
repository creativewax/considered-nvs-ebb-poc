// src/pages/HistoryPage.jsx

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import BasePage from '../components/common/BasePage'
import AnimatedGradient from '../components/common/AnimatedGradient'
import HistoryCard from '../components/history/HistoryCard'
import { useSleep } from '../hooks/useSleep'

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

  const { records } = useSleep()

  const sorted = records
    ? [...records].sort((a, b) => new Date(b.date) - new Date(a.date))
    : []

  return (
    <BasePage>
      <AnimatedGradient fadeToWhite={true} />
      <div className="page-content" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="page-title"><strong>Your</strong> Sleep History</h1>
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

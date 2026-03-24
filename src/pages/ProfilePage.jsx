// src/pages/ProfilePage.jsx

import { useEffect } from 'react'
import BasePage from '../components/common/BasePage'
import WearableCard from '../components/profile/WearableCard'
import SyncButton from '../components/profile/SyncButton'
import Settings from '../components/profile/Settings'
import { useSleep } from '../hooks/useSleep'
import { allEntries } from '../data/logEntries'

// ------------------------------------------------------------ HELPERS

const computeStats = (records) => {
  if (!records || records.length === 0) return { avgScore: 0, totalNights: 0, csuCount: 0 }

  const last7 = records.slice(0, 7)
  const avgScore = Math.round(last7.reduce((sum, r) => sum + r.score, 0) / last7.length)
  const totalNights = records.length
  const csuCount = allEntries.filter(e => e.type === 'csu_trigger').length

  return { avgScore, totalNights, csuCount }
}

// ------------------------------------------------------------ PROFILE PAGE

export default function ProfilePage() {
  useEffect(() => { document.title = 'Ebb — Profile' }, [])

  const { records } = useSleep()
  const stats = computeStats(records)

  return (
    <BasePage>
      <div className="page-content">
        <h1 className="page-title">Profile</h1>

        {/* ---- USER DETAILS ---- */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--colour-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--colour-text-secondary)',
            flexShrink: 0,
          }}>
            JD
          </div>
          <div>
            <p style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--colour-text)',
              lineHeight: 'var(--leading-tight)',
            }}>
              Jane Doe
            </p>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--colour-text-secondary)',
            }}>
              jane.doe@example.com
            </p>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--colour-text-muted)',
              marginTop: 2,
            }}>
              Member since January 2026
            </p>
          </div>
        </div>

        <div className="card-list">
          <WearableCard />
          <SyncButton />
          <Settings stats={stats} />
        </div>
      </div>
    </BasePage>
  )
}

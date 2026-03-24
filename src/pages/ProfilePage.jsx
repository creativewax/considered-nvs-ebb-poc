// src/pages/ProfilePage.jsx

import { useEffect } from 'react'
import BasePage from '../components/common/BasePage'
import WearableCard from '../components/profile/WearableCard'
import SyncButton from '../components/profile/SyncButton'
import Settings from '../components/profile/Settings'

// ------------------------------------------------------------ PROFILE PAGE

export default function ProfilePage() {
  useEffect(() => { document.title = 'Ebb — Profile' }, [])
  return (
    <BasePage>
      <div className="page-content">
        <h1 className="page-title">Profile</h1>

        <div className="card-list">
          <WearableCard />
          <SyncButton />
          <Settings />
        </div>
      </div>
    </BasePage>
  )
}

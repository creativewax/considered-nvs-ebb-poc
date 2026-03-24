// src/pages/HealthPage.jsx

import { useEffect } from 'react'
import BasePage from '../components/common/BasePage'

export default function HealthPage() {
  useEffect(() => { document.title = 'Ebb — Health' }, [])
  return (
    <BasePage>
      <div className="page-content">
        <h1>Health</h1>
        <p>Today's synced health metrics</p>
      </div>
    </BasePage>
  )
}

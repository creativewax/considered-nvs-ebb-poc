// src/pages/ResultsPage.jsx

import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSleep } from '../hooks/useSleep'
import { useOrb } from '../hooks/useOrb'
import { useLogs } from '../hooks/useLogs'
import { useSound } from '../hooks/useSound'
import BasePage from '../components/common/BasePage'
import PageLoader from '../components/common/PageLoader'
import { ResultsHeader } from '../components/results/ResultsHeader'
import { OrbCanvas } from '../components/orb/OrbCanvas'
import { MetricsRow } from '../components/results/MetricsRow'
import { Hypnogram } from '../components/charts/Hypnogram'
import { InsightCards } from '../components/results/InsightCards'
import { ExpandableStats } from '../components/results/ExpandableStats'

// ------------------------------------------------------------
// RESULTS PAGE — hero orb + metrics + charts + insights
// ------------------------------------------------------------

export default function ResultsPage() {
  const { id } = useParams()
  const { selectedRecord, selectRecord } = useSleep()
  const { config } = useOrb()
  const { entries, loadEntries } = useLogs()
  const { play, stop } = useSound()

  useEffect(() => { selectRecord(id) }, [id])
  useEffect(() => { if (id) loadEntries(id) }, [id])

  // Ambient sound — start on mount, stop on unmount
  useEffect(() => {
    play()
    return () => stop()
  }, [])

  // Browser tab title
  useEffect(() => {
    const quality = selectedRecord?.quality
    document.title = quality ? `Ebb — ${quality.charAt(0).toUpperCase() + quality.slice(1)} Sleep` : 'Ebb — Results'
  }, [selectedRecord?.quality])

  if (!selectedRecord) return <PageLoader />

  return (
    <BasePage>
      <ResultsHeader record={selectedRecord} />
      <OrbCanvas config={config} quality={selectedRecord.quality} />
      <MetricsRow record={selectedRecord} />
      <div className="page-content">
        <Hypnogram
          timeline={selectedRecord.stageTimeline}
          bedtime={selectedRecord.bedtime}
          wakeTime={selectedRecord.wakeTime}
        />
        <InsightCards recordId={id} quality={selectedRecord.quality} />
        <ExpandableStats record={selectedRecord} entries={entries} />
      </div>
    </BasePage>
  )
}

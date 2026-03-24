// src/data/insights.js

// ------------------------------------------------------------
// PRE-COMPUTED INSIGHTS
// Keyed by sleep record ID — only records with CSU trigger entries have insights
// ------------------------------------------------------------

const INSIGHTS = {
  'sleep-003': [
    { text: 'Nights with severe flare-ups average 38% less deep sleep', type: 'correlation' },
    { text: 'Antihistamine taken before bed improved your score by 12 points', type: 'positive' },
  ],
  'sleep-005': [
    { text: 'Your worst sleep nights coincide with high stress and active hives', type: 'correlation' },
    { text: '3 of your last 5 poor nights had flare severity above 7', type: 'warning' },
  ],
  'sleep-007': [
    { text: 'Late-night antihistamine appears to reduce awake time by ~20 minutes', type: 'positive' },
    { text: 'Hive activity before midnight correlated with fragmented REM cycles', type: 'correlation' },
  ],
  'sleep-009': [
    { text: 'Stress level 7+ nights show 45% more awake time on average', type: 'warning' },
    { text: 'This was your worst sleep of the tracked period', type: 'warning' },
  ],
  'sleep-011': [
    { text: 'Mild flare with early antihistamine — sleep quality remained good', type: 'positive' },
    { text: 'Early intervention (before 10pm) is associated with better sleep scores', type: 'correlation' },
  ],
}

export const getInsightsForRecord = (recordId) => INSIGHTS[recordId] || []

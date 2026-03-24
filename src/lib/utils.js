// src/lib/utils.js

// ------------------------------------------------------------
// UTILITY FUNCTIONS
// ------------------------------------------------------------

export const generateId = () => Math.random().toString(36).substring(2, 10)

export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

export const minutesToHours = (mins) => (mins / 60).toFixed(1)

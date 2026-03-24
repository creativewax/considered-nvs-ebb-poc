// src/constants/sleep.js

export const QUALITY_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD:      70,
  FAIR:      40,
  POOR:      0,
}

export const QUALITY_LABELS = {
  excellent: 'Excellent',
  good:      'Good',
  fair:      'Fair',
  poor:      'Poor',
}

export const STAGE_NAMES = {
  light: 'Light',
  deep:  'Deep',
  rem:   'REM',
  awake: 'Awake',
}

export const scoreToQuality = (score) => {
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) return 'excellent'
  if (score >= QUALITY_THRESHOLDS.GOOD)      return 'good'
  if (score >= QUALITY_THRESHOLDS.FAIR)      return 'fair'
  return 'poor'
}

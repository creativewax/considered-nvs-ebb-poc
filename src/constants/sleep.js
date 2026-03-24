// src/constants/sleep.js

export const QUALITY_THRESHOLDS = {
  EXCELLENT: 90,
  VERY_GOOD: 80,
  GOOD:      70,
  MODERATE:  60,
  FAIR:      50,
  RESTLESS:  40,
  POOR:      25,
  VERY_POOR: 10,
  DISRUPTED: 0,
}

export const QUALITY_LABELS = {
  excellent: 'Excellent',
  very_good: 'Very Good',
  good:      'Good',
  moderate:  'Moderate',
  fair:      'Fair',
  restless:  'Restless',
  poor:      'Poor',
  very_poor: 'Very Poor',
  disrupted: 'Disrupted',
}

export const STAGE_NAMES = {
  light: 'Light',
  deep:  'Deep',
  rem:   'REM',
  awake: 'Awake',
}

export const scoreToQuality = (score) => {
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) return 'excellent'
  if (score >= QUALITY_THRESHOLDS.VERY_GOOD) return 'very_good'
  if (score >= QUALITY_THRESHOLDS.GOOD)      return 'good'
  if (score >= QUALITY_THRESHOLDS.MODERATE)   return 'moderate'
  if (score >= QUALITY_THRESHOLDS.FAIR)       return 'fair'
  if (score >= QUALITY_THRESHOLDS.RESTLESS)   return 'restless'
  if (score >= QUALITY_THRESHOLDS.POOR)       return 'poor'
  if (score >= QUALITY_THRESHOLDS.VERY_POOR)  return 'very_poor'
  return 'disrupted'
}

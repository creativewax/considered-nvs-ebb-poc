// src/data/sleepRecords.js

import { scoreToQuality } from '../constants/sleep.js'

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

// Build a heart rate timeline at 5-minute intervals between two HH:MM times
// bpmStart and bpmEnd are approximate — values gently drift between them
const buildHrTimeline = (startTime, endTime, bpmStart, bpmEnd) => {
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const toTime = (mins) => {
    const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60)
    const m = ((mins % 1440) + 1440) % 1440 % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const startMins = toMins(startTime)
  let endMins = toMins(endTime)
  if (endMins <= startMins) endMins += 1440 // crosses midnight

  const steps = Math.floor((endMins - startMins) / 5)
  const result = []
  for (let i = 0; i <= steps; i++) {
    const t = startMins + i * 5
    const progress = steps > 0 ? i / steps : 0
    // Slight natural variation via a small sine wobble
    const wobble = Math.round(Math.sin(i * 0.7) * 2)
    const bpm = Math.round(bpmStart + (bpmEnd - bpmStart) * progress + wobble)
    result.push({ time: toTime(t), bpm })
  }
  return result
}

// Flatten stage timeline segments into a single heart-rate timeline
// Each stage gets a characteristic BPM range
const buildHrTimelineFromStages = (stages) => {
  const stageBpm = { light: [58, 62], deep: [48, 54], rem: [62, 68], awake: [72, 80] }
  const timeline = []
  const seen = new Set()

  stages.forEach((seg) => {
    const [lo, hi] = stageBpm[seg.stage] || [60, 65]
    const segTimeline = buildHrTimeline(seg.start, seg.end, hi, lo)
    segTimeline.forEach((entry) => {
      if (!seen.has(entry.time)) {
        seen.add(entry.time)
        timeline.push(entry)
      }
    })
  })

  return timeline
}

// ------------------------------------------------------------
// SEED RECORDS — 12 nights, Jan 15–28 2026
// Distribution: 2 poor, 3 fair, 5 good, 2 excellent
// ------------------------------------------------------------

const makeRecord = (fields) => ({
  ...fields,
  quality: scoreToQuality(fields.score),
  heartRateTimeline: buildHrTimelineFromStages(fields.stageTimeline),
})

export const allRecords = [

  // ----------------------------------------------------------
  // sleep-001 | Jan 15 | VERY GOOD (score 82)
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-001',
    date: '2026-01-15',
    source: 'wearable',
    syncedAt: new Date('2026-01-16T07:30:00'),
    bedtime: '23:15',
    wakeTime: '06:45',
    totalDuration: 450,
    sleepDuration: 415,
    lightSleep: 200,
    deepSleep: 100,
    remSleep: 95,
    awakeTime: 20,
    stageTimeline: [
      { start: '23:15', end: '23:45', stage: 'light' },
      { start: '23:45', end: '00:30', stage: 'deep' },
      { start: '00:30', end: '01:15', stage: 'rem' },
      { start: '01:15', end: '02:00', stage: 'light' },
      { start: '02:00', end: '02:45', stage: 'deep' },
      { start: '02:45', end: '03:30', stage: 'rem' },
      { start: '03:30', end: '04:15', stage: 'light' },
      { start: '04:15', end: '04:45', stage: 'deep' },
      { start: '04:45', end: '05:45', stage: 'rem' },
      { start: '05:45', end: '06:30', stage: 'light' },
      { start: '06:30', end: '06:45', stage: 'awake' },
    ],
    avgHeartRate: 58,
    minHeartRate: 48,
    hrv: 46,
    respiratoryRate: 14,
    score: 82,
  }),

  // ----------------------------------------------------------
  // sleep-002 | Jan 16 | RESTLESS (score 45)
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-002',
    date: '2026-01-16',
    source: 'wearable',
    syncedAt: new Date('2026-01-17T07:15:00'),
    bedtime: '22:45',
    wakeTime: '06:30',
    totalDuration: 465,
    sleepDuration: 440,
    lightSleep: 210,
    deepSleep: 110,
    remSleep: 100,
    awakeTime: 25,
    stageTimeline: [
      { start: '22:45', end: '23:20', stage: 'light' },
      { start: '23:20', end: '00:10', stage: 'deep' },
      { start: '00:10', end: '01:00', stage: 'rem' },
      { start: '01:00', end: '01:45', stage: 'light' },
      { start: '01:45', end: '02:30', stage: 'deep' },
      { start: '02:30', end: '03:20', stage: 'rem' },
      { start: '03:20', end: '04:05', stage: 'light' },
      { start: '04:05', end: '04:40', stage: 'deep' },
      { start: '04:40', end: '05:40', stage: 'rem' },
      { start: '05:40', end: '06:15', stage: 'light' },
      { start: '06:15', end: '06:30', stage: 'awake' },
    ],
    avgHeartRate: 57,
    minHeartRate: 47,
    hrv: 49,
    respiratoryRate: 14,
    score: 45,
  }),

  // ----------------------------------------------------------
  // sleep-003 | Jan 17 | GOOD (score 72) | POOR (score 32)
  // Has CSU trigger — severe flare
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-003',
    date: '2026-01-17',
    source: 'wearable',
    syncedAt: new Date('2026-01-18T08:00:00'),
    bedtime: '23:45',
    wakeTime: '05:30',
    totalDuration: 345,
    sleepDuration: 285,
    lightSleep: 185,
    deepSleep: 40,
    remSleep: 35,
    awakeTime: 85,
    stageTimeline: [
      { start: '23:45', end: '00:20', stage: 'light' },
      { start: '00:20', end: '00:50', stage: 'awake' },
      { start: '00:50', end: '01:20', stage: 'light' },
      { start: '01:20', end: '01:50', stage: 'deep' },
      { start: '01:50', end: '02:20', stage: 'awake' },
      { start: '02:20', end: '02:55', stage: 'light' },
      { start: '02:55', end: '03:25', stage: 'rem' },
      { start: '03:25', end: '04:00', stage: 'awake' },
      { start: '04:00', end: '04:45', stage: 'light' },
      { start: '04:45', end: '05:05', stage: 'deep' },
      { start: '05:05', end: '05:30', stage: 'awake' },
    ],
    avgHeartRate: 68,
    minHeartRate: 55,
    hrv: 28,
    respiratoryRate: 16,
    score: 72,
  }),

  // ----------------------------------------------------------
  // sleep-004 | Jan 18 | DISRUPTED (score 5) — today's terrible night | FAIR (score 58)
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-004',
    date: '2026-01-18',
    source: 'wearable',
    syncedAt: new Date('2026-01-19T07:45:00'),
    bedtime: '23:30',
    wakeTime: '06:45',
    totalDuration: 435,
    sleepDuration: 390,
    lightSleep: 215,
    deepSleep: 80,
    remSleep: 70,
    awakeTime: 70,
    stageTimeline: [
      { start: '23:30', end: '00:10', stage: 'light' },
      { start: '00:10', end: '00:50', stage: 'deep' },
      { start: '00:50', end: '01:30', stage: 'rem' },
      { start: '01:30', end: '01:55', stage: 'awake' },
      { start: '01:55', end: '02:40', stage: 'light' },
      { start: '02:40', end: '03:15', stage: 'deep' },
      { start: '03:15', end: '03:50', stage: 'awake' },
      { start: '03:50', end: '04:35', stage: 'light' },
      { start: '04:35', end: '05:20', stage: 'rem' },
      { start: '05:20', end: '06:10', stage: 'light' },
      { start: '06:10', end: '06:45', stage: 'awake' },
    ],
    avgHeartRate: 63,
    minHeartRate: 51,
    hrv: 36,
    respiratoryRate: 15,
    score: 5,
  }),

  // ----------------------------------------------------------
  // sleep-005 | Jan 19 | POOR (score 28)
  // Has CSU trigger — worst night
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-005',
    date: '2026-01-19',
    source: 'wearable',
    syncedAt: new Date('2026-01-20T08:30:00'),
    bedtime: '00:15',
    wakeTime: '05:45',
    totalDuration: 330,
    sleepDuration: 255,
    lightSleep: 170,
    deepSleep: 30,
    remSleep: 30,
    awakeTime: 100,
    stageTimeline: [
      { start: '00:15', end: '00:50', stage: 'light' },
      { start: '00:50', end: '01:30', stage: 'awake' },
      { start: '01:30', end: '02:05', stage: 'light' },
      { start: '02:05', end: '02:35', stage: 'deep' },
      { start: '02:35', end: '03:10', stage: 'awake' },
      { start: '03:10', end: '03:45', stage: 'light' },
      { start: '03:45', end: '04:15', stage: 'rem' },
      { start: '04:15', end: '04:55', stage: 'awake' },
      { start: '04:55', end: '05:25', stage: 'light' },
      { start: '05:25', end: '05:45', stage: 'awake' },
    ],
    avgHeartRate: 71,
    minHeartRate: 58,
    hrv: 22,
    respiratoryRate: 17,
    score: 15,
  }),

  // ----------------------------------------------------------
  // sleep-006 | Jan 20 | FAIR (score 62)
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-006',
    date: '2026-01-20',
    source: 'wearable',
    syncedAt: new Date('2026-01-21T07:00:00'),
    bedtime: '23:00',
    wakeTime: '06:30',
    totalDuration: 450,
    sleepDuration: 405,
    lightSleep: 210,
    deepSleep: 90,
    remSleep: 85,
    awakeTime: 65,
    stageTimeline: [
      { start: '23:00', end: '23:40', stage: 'light' },
      { start: '23:40', end: '00:30', stage: 'deep' },
      { start: '00:30', end: '01:10', stage: 'rem' },
      { start: '01:10', end: '01:40', stage: 'awake' },
      { start: '01:40', end: '02:25', stage: 'light' },
      { start: '02:25', end: '03:05', stage: 'deep' },
      { start: '03:05', end: '03:50', stage: 'rem' },
      { start: '03:50', end: '04:30', stage: 'light' },
      { start: '04:30', end: '05:00', stage: 'awake' },
      { start: '05:00', end: '06:00', stage: 'light' },
      { start: '06:00', end: '06:30', stage: 'awake' },
    ],
    avgHeartRate: 61,
    minHeartRate: 50,
    hrv: 38,
    respiratoryRate: 15,
    score: 30,
  }),

  // ----------------------------------------------------------
  // sleep-007 | Jan 21 | GOOD (score 74)
  // Has CSU trigger — mild flare, early antihistamine
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-007',
    date: '2026-01-21',
    source: 'wearable',
    syncedAt: new Date('2026-01-22T07:20:00'),
    bedtime: '23:20',
    wakeTime: '06:50',
    totalDuration: 450,
    sleepDuration: 415,
    lightSleep: 205,
    deepSleep: 100,
    remSleep: 90,
    awakeTime: 30,
    stageTimeline: [
      { start: '23:20', end: '23:55', stage: 'light' },
      { start: '23:55', end: '00:40', stage: 'deep' },
      { start: '00:40', end: '01:25', stage: 'rem' },
      { start: '01:25', end: '02:10', stage: 'light' },
      { start: '02:10', end: '02:55', stage: 'deep' },
      { start: '02:55', end: '03:35', stage: 'awake' },
      { start: '03:35', end: '04:20', stage: 'light' },
      { start: '04:20', end: '04:55', stage: 'deep' },
      { start: '04:55', end: '05:55', stage: 'rem' },
      { start: '05:55', end: '06:50', stage: 'light' },
    ],
    avgHeartRate: 60,
    minHeartRate: 49,
    hrv: 43,
    respiratoryRate: 14,
    score: 52,
  }),

  // ----------------------------------------------------------
  // sleep-008 | Jan 22 | EXCELLENT (score 88)
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-008',
    date: '2026-01-22',
    source: 'wearable',
    syncedAt: new Date('2026-01-23T07:00:00'),
    bedtime: '22:30',
    wakeTime: '06:45',
    totalDuration: 495,
    sleepDuration: 475,
    lightSleep: 215,
    deepSleep: 130,
    remSleep: 120,
    awakeTime: 10,
    stageTimeline: [
      { start: '22:30', end: '23:05', stage: 'light' },
      { start: '23:05', end: '00:00', stage: 'deep' },
      { start: '00:00', end: '00:50', stage: 'rem' },
      { start: '00:50', end: '01:35', stage: 'light' },
      { start: '01:35', end: '02:25', stage: 'deep' },
      { start: '02:25', end: '03:20', stage: 'rem' },
      { start: '03:20', end: '04:05', stage: 'light' },
      { start: '04:05', end: '04:45', stage: 'deep' },
      { start: '04:45', end: '05:55', stage: 'rem' },
      { start: '05:55', end: '06:35', stage: 'light' },
      { start: '06:35', end: '06:45', stage: 'awake' },
    ],
    avgHeartRate: 54,
    minHeartRate: 44,
    hrv: 62,
    respiratoryRate: 13,
    score: 95,
  }),

  // ----------------------------------------------------------
  // sleep-009 | Jan 23 | FAIR (score 48)
  // Has CSU trigger — stress + hives
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-009',
    date: '2026-01-23',
    source: 'wearable',
    syncedAt: new Date('2026-01-24T08:00:00'),
    bedtime: '23:50',
    wakeTime: '06:30',
    totalDuration: 400,
    sleepDuration: 345,
    lightSleep: 200,
    deepSleep: 65,
    remSleep: 55,
    awakeTime: 80,
    stageTimeline: [
      { start: '23:50', end: '00:25', stage: 'light' },
      { start: '00:25', end: '01:00', stage: 'deep' },
      { start: '01:00', end: '01:40', stage: 'awake' },
      { start: '01:40', end: '02:20', stage: 'light' },
      { start: '02:20', end: '02:50', stage: 'rem' },
      { start: '02:50', end: '03:30', stage: 'awake' },
      { start: '03:30', end: '04:15', stage: 'light' },
      { start: '04:15', end: '04:50', stage: 'deep' },
      { start: '04:50', end: '05:20', stage: 'awake' },
      { start: '05:20', end: '06:10', stage: 'light' },
      { start: '06:10', end: '06:30', stage: 'awake' },
    ],
    avgHeartRate: 65,
    minHeartRate: 52,
    hrv: 33,
    respiratoryRate: 15,
    score: 38,
  }),

  // ----------------------------------------------------------
  // sleep-010 | Jan 24 | GOOD (score 79)
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-010',
    date: '2026-01-24',
    source: 'wearable',
    syncedAt: new Date('2026-01-25T07:10:00'),
    bedtime: '23:00',
    wakeTime: '06:45',
    totalDuration: 465,
    sleepDuration: 435,
    lightSleep: 205,
    deepSleep: 115,
    remSleep: 100,
    awakeTime: 30,
    stageTimeline: [
      { start: '23:00', end: '23:35', stage: 'light' },
      { start: '23:35', end: '00:25', stage: 'deep' },
      { start: '00:25', end: '01:10', stage: 'rem' },
      { start: '01:10', end: '01:55', stage: 'light' },
      { start: '01:55', end: '02:40', stage: 'deep' },
      { start: '02:40', end: '03:25', stage: 'rem' },
      { start: '03:25', end: '04:10', stage: 'light' },
      { start: '04:10', end: '04:35', stage: 'awake' },
      { start: '04:35', end: '05:20', stage: 'deep' },
      { start: '05:20', end: '06:10', stage: 'rem' },
      { start: '06:10', end: '06:45', stage: 'light' },
    ],
    avgHeartRate: 57,
    minHeartRate: 47,
    hrv: 48,
    respiratoryRate: 14,
    score: 65,
  }),

  // ----------------------------------------------------------
  // sleep-011 | Jan 25 | GOOD (score 72)
  // Has CSU trigger — mild flare logged early
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-011',
    date: '2026-01-25',
    source: 'wearable',
    syncedAt: new Date('2026-01-26T07:30:00'),
    bedtime: '23:30',
    wakeTime: '06:45',
    totalDuration: 435,
    sleepDuration: 400,
    lightSleep: 200,
    deepSleep: 95,
    remSleep: 85,
    awakeTime: 55,
    stageTimeline: [
      { start: '23:30', end: '00:05', stage: 'light' },
      { start: '00:05', end: '00:50', stage: 'deep' },
      { start: '00:50', end: '01:35', stage: 'rem' },
      { start: '01:35', end: '02:00', stage: 'awake' },
      { start: '02:00', end: '02:45', stage: 'light' },
      { start: '02:45', end: '03:25', stage: 'deep' },
      { start: '03:25', end: '04:10', stage: 'rem' },
      { start: '04:10', end: '04:45', stage: 'light' },
      { start: '04:45', end: '05:15', stage: 'awake' },
      { start: '05:15', end: '06:10', stage: 'light' },
      { start: '06:10', end: '06:45', stage: 'awake' },
    ],
    avgHeartRate: 60,
    minHeartRate: 50,
    hrv: 41,
    respiratoryRate: 14,
    score: 85,
  }),

  // ----------------------------------------------------------
  // sleep-012 | Jan 26 | EXCELLENT (score 91)
  // ----------------------------------------------------------
  makeRecord({
    id: 'sleep-012',
    date: '2026-01-26',
    source: 'wearable',
    syncedAt: new Date('2026-01-27T07:00:00'),
    bedtime: '22:15',
    wakeTime: '06:45',
    totalDuration: 510,
    sleepDuration: 495,
    lightSleep: 210,
    deepSleep: 145,
    remSleep: 130,
    awakeTime: 10,
    stageTimeline: [
      { start: '22:15', end: '22:50', stage: 'light' },
      { start: '22:50', end: '23:50', stage: 'deep' },
      { start: '23:50', end: '00:45', stage: 'rem' },
      { start: '00:45', end: '01:30', stage: 'light' },
      { start: '01:30', end: '02:25', stage: 'deep' },
      { start: '02:25', end: '03:20', stage: 'rem' },
      { start: '03:20', end: '04:05', stage: 'light' },
      { start: '04:05', end: '04:50', stage: 'deep' },
      { start: '04:50', end: '06:00', stage: 'rem' },
      { start: '06:00', end: '06:40', stage: 'light' },
      { start: '06:40', end: '06:45', stage: 'awake' },
    ],
    avgHeartRate: 52,
    minHeartRate: 42,
    hrv: 68,
    respiratoryRate: 13,
    score: 55,
  }),
]

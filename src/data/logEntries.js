// src/data/logEntries.js

// ------------------------------------------------------------
// SEED LOG ENTRIES — ~18 entries across the sleep records
// Distribution: 4 food, 3 photo, 4 sleep_note, 6 csu_trigger
// Poor nights (sleep-003, sleep-005, sleep-009) have high-severity CSU triggers
// Good/excellent nights (sleep-001, sleep-002, sleep-008, sleep-010, sleep-012) have mild or no triggers
// ------------------------------------------------------------

export const allEntries = [

  // ----------------------------------------------------------
  // FOOD LOGS
  // ----------------------------------------------------------
  {
    id: 'log-001',
    sleepRecordId: 'sleep-001',
    type: 'food',
    content: 'Light dinner — grilled chicken and salad around 7pm',
    imageUrl: null,
    createdAt: new Date('2026-01-15T19:10:00'),
  },
  {
    id: 'log-002',
    sleepRecordId: 'sleep-003',
    type: 'food',
    content: 'Had spicy takeaway at 9pm — felt unsettled afterwards',
    imageUrl: null,
    createdAt: new Date('2026-01-17T21:10:00'),
  },
  {
    id: 'log-003',
    sleepRecordId: 'sleep-006',
    type: 'food',
    content: 'Late dinner at 9:30pm, heavier than usual',
    imageUrl: null,
    createdAt: new Date('2026-01-20T21:35:00'),
  },
  {
    id: 'log-004',
    sleepRecordId: 'sleep-010',
    type: 'food',
    content: 'Early dinner at 6:30pm, light meal — felt good going to bed',
    imageUrl: null,
    createdAt: new Date('2026-01-24T18:35:00'),
  },

  // ----------------------------------------------------------
  // PHOTO LOGS
  // ----------------------------------------------------------
  {
    id: 'log-005',
    sleepRecordId: 'sleep-003',
    type: 'photo',
    content: 'Hives on forearms — appeared around 10pm',
    imageUrl: null,
    createdAt: new Date('2026-01-17T22:05:00'),
  },
  {
    id: 'log-006',
    sleepRecordId: 'sleep-005',
    type: 'photo',
    content: 'Torso and arm hives — very widespread tonight',
    imageUrl: null,
    createdAt: new Date('2026-01-19T21:45:00'),
  },
  {
    id: 'log-007',
    sleepRecordId: 'sleep-009',
    type: 'photo',
    content: 'Hives on neck — less severe than last week',
    imageUrl: null,
    createdAt: new Date('2026-01-23T22:20:00'),
  },

  // ----------------------------------------------------------
  // SLEEP NOTES
  // ----------------------------------------------------------
  {
    id: 'log-008',
    sleepRecordId: 'sleep-002',
    type: 'sleep_note',
    content: 'Felt well-rested going to bed, no itching overnight',
    imageUrl: null,
    createdAt: new Date('2026-01-16T22:40:00'),
  },
  {
    id: 'log-009',
    sleepRecordId: 'sleep-004',
    type: 'sleep_note',
    content: 'Woke around 2am with mild itch — managed to get back to sleep',
    imageUrl: null,
    createdAt: new Date('2026-01-18T23:30:00'),
  },
  {
    id: 'log-010',
    sleepRecordId: 'sleep-008',
    type: 'sleep_note',
    content: 'Best night in a while — no disruptions, skin calm all evening',
    imageUrl: null,
    createdAt: new Date('2026-01-22T22:25:00'),
  },
  {
    id: 'log-011',
    sleepRecordId: 'sleep-012',
    type: 'sleep_note',
    content: 'Went to bed relaxed after a quiet day — skin completely clear',
    imageUrl: null,
    createdAt: new Date('2026-01-26T22:10:00'),
  },

  // ----------------------------------------------------------
  // CSU TRIGGERS
  // ----------------------------------------------------------

  // Poor night — sleep-003 | flareSeverity 8
  {
    id: 'log-012',
    sleepRecordId: 'sleep-003',
    type: 'csu_trigger',
    content: 'Severe flare-up before bed — intense itching on arms and torso',
    imageUrl: null,
    createdAt: new Date('2026-01-17T22:00:00'),
    triggerData: {
      flareSeverity: 8,
      itchIntensity: 9,
      hivesPresent: true,
      antihistamineTaken: true,
      antihistamineTime: '22:15',
      stressLevel: 4,
      notes: 'Took antihistamine late — hives appeared around 9pm',
    },
  },

  // Poor night — sleep-005 | flareSeverity 9 (worst)
  {
    id: 'log-013',
    sleepRecordId: 'sleep-005',
    type: 'csu_trigger',
    content: 'Severe flare-up — widespread hives across torso, arms, and neck',
    imageUrl: null,
    createdAt: new Date('2026-01-19T22:00:00'),
    triggerData: {
      flareSeverity: 9,
      itchIntensity: 10,
      hivesPresent: true,
      antihistamineTaken: true,
      antihistamineTime: '22:30',
      stressLevel: 7,
      notes: 'Very stressed day at work — flare started around 8pm, took antihistamine too late',
    },
  },

  // Fair night — sleep-006 | moderate flare
  {
    id: 'log-014',
    sleepRecordId: 'sleep-006',
    type: 'csu_trigger',
    content: 'Mild-moderate flare — itching on arms before bed',
    imageUrl: null,
    createdAt: new Date('2026-01-20T21:45:00'),
    triggerData: {
      flareSeverity: 5,
      itchIntensity: 5,
      hivesPresent: true,
      antihistamineTaken: true,
      antihistamineTime: '21:50',
      stressLevel: 3,
      notes: 'Caught it early — antihistamine seemed to help within 40 minutes',
    },
  },

  // Good night — sleep-007 | mild flare, early intervention
  {
    id: 'log-015',
    sleepRecordId: 'sleep-007',
    type: 'csu_trigger',
    content: 'Mild flare — slight itching on wrists, caught early',
    imageUrl: null,
    createdAt: new Date('2026-01-21T20:30:00'),
    triggerData: {
      flareSeverity: 3,
      itchIntensity: 3,
      hivesPresent: false,
      antihistamineTaken: true,
      antihistamineTime: '20:35',
      stressLevel: 2,
      notes: 'Took antihistamine as soon as I noticed itching — no hives developed',
    },
  },

  // Fair night — sleep-009 | moderate flare + high stress
  {
    id: 'log-016',
    sleepRecordId: 'sleep-009',
    type: 'csu_trigger',
    content: 'Moderate flare — hives on neck and upper back, stress high today',
    imageUrl: null,
    createdAt: new Date('2026-01-23T21:55:00'),
    triggerData: {
      flareSeverity: 7,
      itchIntensity: 7,
      hivesPresent: true,
      antihistamineTaken: true,
      antihistamineTime: '22:10',
      stressLevel: 7,
      notes: 'Stressful week overall — hives appeared around 9:30pm',
    },
  },

  // Good night — sleep-011 | mild flare logged early
  {
    id: 'log-017',
    sleepRecordId: 'sleep-011',
    type: 'csu_trigger',
    content: 'Slight itching on forearms — took antihistamine early as a precaution',
    imageUrl: null,
    createdAt: new Date('2026-01-25T19:50:00'),
    triggerData: {
      flareSeverity: 2,
      itchIntensity: 2,
      hivesPresent: false,
      antihistamineTaken: true,
      antihistamineTime: '19:55',
      stressLevel: 2,
      notes: 'Very early intervention — skin settled within an hour',
    },
  },

  // Sleep note for sleep-011 to complement mild trigger
  {
    id: 'log-018',
    sleepRecordId: 'sleep-011',
    type: 'sleep_note',
    content: 'Mild itch before bed but felt okay once antihistamine kicked in',
    imageUrl: null,
    createdAt: new Date('2026-01-25T23:25:00'),
  },
]

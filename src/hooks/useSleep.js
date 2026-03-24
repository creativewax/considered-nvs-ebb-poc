// src/hooks/useSleep.js

import { useManagerSubscription } from './useManagerSubscription'
import { sleepManager } from '../managers/SleepManager'

// ------------------------------------------------------------
// USE SLEEP — subscribe to SleepManager state
// ------------------------------------------------------------

export function useSleep() {
  const state = useManagerSubscription(sleepManager)

  return {
    ...state,
    loadRecords:   () => sleepManager.loadRecords(),
    selectRecord:  (id) => sleepManager.selectRecord(id),
    getLatestRecord: () => sleepManager.getLatestRecord(),
  }
}

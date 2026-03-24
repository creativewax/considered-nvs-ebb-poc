// src/hooks/useDevice.js

import { useManagerSubscription } from './useManagerSubscription'
import { deviceManager } from '../managers/DeviceManager'
import { eventSystem } from '../lib/events/EventSystem'
import { EVENTS } from '../constants/events'

// ------------------------------------------------------------
// USE DEVICE — subscribe to DeviceManager state
// ------------------------------------------------------------

export function useDevice() {
  const state = useManagerSubscription(deviceManager)

  return {
    ...state,
    connect:     () => deviceManager.connect(),
    // Emit the event — DeviceManager listens and handles the sync
    requestSync: () => eventSystem.emit(EVENTS.DEVICE_SYNC_REQUESTED),
  }
}

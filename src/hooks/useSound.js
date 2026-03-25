// src/hooks/useSound.js

import { useManagerSubscription } from './useManagerSubscription'
import { soundManager } from '../managers/SoundManager'

// ------------------------------------------------------------
// USE SOUND — subscribe to SoundManager state
// ------------------------------------------------------------

export function useSound() {
  const state = useManagerSubscription(soundManager)

  return {
    ...state,
    toggle:  () => soundManager.toggle(),
    claim:   () => soundManager.claim(),
    release: () => soundManager.release(),
  }
}

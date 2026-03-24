// src/hooks/useOrb.js

import { useManagerSubscription } from './useManagerSubscription'
import { orbManager } from '../managers/OrbManager'

// ------------------------------------------------------------
// USE ORB — subscribe to OrbManager config state
// ------------------------------------------------------------

export function useOrb() {
  const state = useManagerSubscription(orbManager)

  return { config: state.config }
}

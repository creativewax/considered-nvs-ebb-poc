// src/hooks/useManagerSubscription.js

import { useState, useEffect, useRef } from 'react'

// ------------------------------------------------------------
// USE MANAGER SUBSCRIPTION
// Subscribes a component to a manager's state. Unsubscribes on unmount.
// Optional selector narrows which slice of state is returned.
// ------------------------------------------------------------

export function useManagerSubscription(manager, selector = null) {
  const selectorRef = useRef(selector)
  selectorRef.current = selector

  const [state, setState] = useState(() => {
    const s = manager.getState()
    return selectorRef.current ? selectorRef.current(s) : s
  })

  useEffect(() => {
    return manager.subscribe(newState => {
      setState(selectorRef.current ? selectorRef.current(newState) : newState)
    })
  }, [manager])

  return state
}

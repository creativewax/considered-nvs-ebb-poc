// src/managers/BaseManager.js

import { eventSystem } from '../lib/events/EventSystem.js'

// ------------------------------------------------------------
// BASE MANAGER — abstract base for all state managers
// ------------------------------------------------------------

class BaseManager {
  constructor() {
    if (new.target === BaseManager) {
      throw new Error('BaseManager is abstract and cannot be instantiated directly')
    }
    this._state = {}
    this._listeners = new Set()
    this._eventCleanups = []
  }

  // ------------------------------------------------------------
  // SUBSCRIPTION
  // ------------------------------------------------------------

  subscribe(listener) {
    this._listeners.add(listener)
    // Immediately call with current state snapshot
    listener(this.getState())
    return () => this._listeners.delete(listener)
  }

  getState() {
    return { ...this._state }
  }

  // ------------------------------------------------------------
  // STATE MUTATION
  // ------------------------------------------------------------

  _setState(partial) {
    this._state = { ...this._state, ...partial }
    this._notify()
  }

  _notify() {
    const snapshot = this.getState()
    this._listeners.forEach(listener => {
      try {
        listener(snapshot)
      } catch (e) {
        console.error('BaseManager listener error:', e)
      }
    })
  }

  // ------------------------------------------------------------
  // EVENT HELPERS
  // ------------------------------------------------------------

  // Register an event listener and track it for HMR cleanup
  _onEvent(eventName, callback) {
    const unsub = eventSystem.on(eventName, callback)
    this._eventCleanups.push(unsub)
    return unsub
  }

  _emit(eventName, data) {
    eventSystem.emit(eventName, data)
  }

  // Remove all registered event listeners — call in HMR dispose
  _cleanupEvents() {
    this._eventCleanups.forEach(unsub => unsub())
    this._eventCleanups = []
  }
}

export default BaseManager

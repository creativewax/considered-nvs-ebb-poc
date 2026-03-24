// src/lib/events/EventSystem.js

// ------------------------------------------------------------
// EVENT SYSTEM
// ------------------------------------------------------------

class EventSystem {
  constructor() {
    this._events = {}
  }

  on(eventName, callback) {
    if (!this._events[eventName]) this._events[eventName] = []
    this._events[eventName].push(callback)
    return () => this.off(eventName, callback)
  }

  off(eventName, callback) {
    if (!this._events[eventName]) return
    this._events[eventName] = this._events[eventName].filter(cb => cb !== callback)
    if (this._events[eventName].length === 0) delete this._events[eventName]
  }

  emit(eventName, data) {
    if (!this._events[eventName]) return
    this._events[eventName].forEach(cb => {
      try {
        cb(data)
      } catch (e) {
        console.error(`Event handler error [${eventName}]:`, e)
      }
    })
  }
}

export const eventSystem = new EventSystem()

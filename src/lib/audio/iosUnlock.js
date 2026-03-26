// src/lib/audio/iosUnlock.js
// Unlock iOS audio session from a synchronous native event handler.
// Must be called from touchend/click — NOT from an async function.

let _unlocked = false
let _ctx = null

// Shared AudioContext — reused by Tone.js via setContext
export function getSharedContext() { return _ctx }

export function unlockIOSAudio() {
  if (_unlocked) return

  try {
    // 1. Create AudioContext synchronously from user gesture
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    _ctx = new AC()

    // 2. Play a silent buffer — this activates the context on iOS
    const buf = _ctx.createBuffer(1, 1, _ctx.sampleRate)
    const src = _ctx.createBufferSource()
    src.buffer = buf
    src.connect(_ctx.destination)
    src.start(0)

    // 3. Resume (in case it started suspended)
    if (_ctx.state !== 'running') {
      _ctx.resume()
    }

    _unlocked = true
  } catch (_) {}
}

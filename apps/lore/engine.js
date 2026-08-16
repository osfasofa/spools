/* The tape motor — filled in by T-153 (record), T-154 (playback), T-155
   (transport feel). The scaffold ships the interface so the shell can wire
   its controls once. */
/* exported LoreEngine */
const LoreEngine = (() => {
  let ctx = null
  // creating a context is allowed before any gesture; only *running* needs
  // one — decode/peaks work on a suspended context, so the store can use it
  const ensureCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    return ctx
  }
  return {
    ensureCtx,
    ready: false,
    pos: () => 0,
    rate: () => 0,
    speed: () => 1,
    playing: () => false,
    recording: () => null, // { track, from } while the head writes
    play: () => {},
    stop: () => {},
    seek: () => {},
    setSpeed: () => {},
    scrubTo: () => {},
    scrubEnd: () => {},
  }
})()

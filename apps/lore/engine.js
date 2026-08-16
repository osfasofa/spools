/* The tape motor. One position, one rate, one physics rule: every speed
   change — play, stop, varispeed, spooling — is a target chased by an
   exponential one-pole. Sources glide via setTargetAtTime with the same τ
   the playhead integrates analytically, so what you hear and where the head
   says it is cannot drift apart (DESIGN §6; the slew is tape-vibes' stop
   decay, generalized).

   Buffers live on the main thread (the reel store decodes and caches);
   scheduling is just-in-time over a ~250 ms horizon; there is no worklet —
   nothing v1 does needs one. Recording is real time regardless of tape
   speed; the take is end-anchored at punch-out and placed with rate = 1/S,
   which is what makes the four-track tape trick physics instead of a
   feature. */
/* global LoreStore */
/* exported LoreEngine */
const LoreEngine = (() => {
  let ctx = null
  let master = null
  let trackGains = null

  // ---- transport state (tape-seconds; rate = tape-sec per real-sec) ----
  let pos = 0
  let rate = 0
  let target = 0
  let tau = 0.08
  let lastT = 0
  let playing = false
  let speed = 1

  // ---- wiring ----
  let opts = null // { getReel, onTake, onError }

  // ---- playback bookkeeping ----
  const active = new Map() // take.id → { src, gain, until }
  const buffers = new Map() // sha256 → AudioBuffer (strong refs while the reel is open)
  const decodeFailed = new Map() // sha256 → last attempt ms (ghosts; retried lazily)

  // ---- recording ----
  let mic = null // { stream, analyser, data }
  let recording = null // { track, from, speed, rec, chunks, wallIn }

  // ---- scrub/spool ----
  let lastGrainAt = 0
  let winding = 0 // -1 | 0 | 1 while rew/ff is held

  const ensureCtx = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      master = ctx.createGain()
      master.gain.value = 0.9
      master.connect(ctx.destination)
      trackGains = [0, 1, 2, 3].map(() => {
        const g = ctx.createGain()
        g.connect(master)
        return g
      })
      lastT = ctx.currentTime
    }
    return ctx
  }

  // closed-form integration of the one-pole between ticks — the analytic
  // twin of setTargetAtTime, which is what keeps ears and eyes in agreement
  const integrate = () => {
    if (!ctx) return
    const now = ctx.currentTime
    const dt = now - lastT
    if (dt <= 0) return
    const k = Math.exp(-dt / tau)
    pos = Math.max(0, pos + target * dt + (rate - target) * tau * (1 - k))
    rate = target + (rate - target) * k
    if (Math.abs(rate - target) < 0.002) rate = target
    lastT = now
  }

  const rateAt = (whenFromNow) => target + (rate - target) * Math.exp(-whenFromNow / tau)

  const setRate = (t, newTau) => {
    integrate()
    target = t
    tau = newTau
    const now = ctx.currentTime
    for (const [id, a] of active) {
      const p = a.take.tape.rate
      a.src.playbackRate.cancelScheduledValues(now)
      a.src.playbackRate.setValueAtTime(Math.max(0.001, rate * p), now)
      a.src.playbackRate.setTargetAtTime(Math.max(0.001, t * p), now, newTau)
    }
  }

  const hardStop = () => {
    for (const [, a] of active) {
      try { a.src.onended = null; a.src.stop() } catch { /* already ended */ }
      a.gain.disconnect()
    }
    active.clear()
  }

  // ---- buffer readiness (prefetch around the head; ghosts retried gently) ----
  const wantBuffer = (audio) => {
    const sha = audio.sha256
    if (buffers.has(sha)) return buffers.get(sha)
    const failedAt = decodeFailed.get(sha)
    if (failedAt && performance.now() - failedAt < 5000) return null
    decodeFailed.set(sha, performance.now()) // parked until it resolves
    LoreStore.decode(audio, ensureCtx()).then((buf) => {
      buffers.set(sha, buf)
      decodeFailed.delete(sha)
    }).catch(() => decodeFailed.set(sha, performance.now()))
    return null
  }

  const prefetch = () => {
    const reel = opts.getReel()
    for (const take of reel.takes) {
      if (take.tape.at + take.tape.dur < pos - 5 || take.tape.at > pos + 20) continue
      wantBuffer(take.audio)
    }
  }

  // ---- the just-in-time scheduler ----
  const HORIZON = 0.25 // real seconds
  const schedule = () => {
    const reel = opts.getReel()
    const now = ctx.currentTime
    const r = Math.max(rate, 0.01)
    const horizonTape = pos + r * HORIZON
    for (const take of reel.takes) {
      if (active.has(take.id)) continue
      const t0 = take.tape.at
      const t1 = t0 + take.tape.dur
      if (t1 <= pos + 0.005 || t0 >= horizonTape) continue
      const buf = wantBuffer(take.audio)
      if (!buf) continue
      const p = take.tape.rate
      const startsNow = t0 <= pos
      const delay = startsNow ? 0 : (t0 - pos) / r
      const when = now + delay
      const srcOffset = take.tape.offset + (startsNow ? (pos - t0) * p : 0)
      const srcRemain = (t1 - Math.max(pos, t0)) * p
      if (srcRemain <= 0.001) continue
      const src = ctx.createBufferSource()
      src.buffer = buf
      const rAtStart = Math.max(0.001, rateAt(delay) * p)
      src.playbackRate.setValueAtTime(rAtStart, when)
      src.playbackRate.setTargetAtTime(Math.max(0.001, target * p), when, tau)
      const g = ctx.createGain()
      g.gain.value = take.tape.gain
      src.connect(g)
      g.connect(trackGains[take.tape.track])
      try {
        src.start(when, Math.max(0, srcOffset), srcRemain)
      } catch { continue }
      const entry = { src, gain: g, take }
      src.onended = () => {
        active.delete(take.id)
        g.disconnect()
      }
      active.set(take.id, entry)
    }
    // stop anything the head has passed (seeks leave these behind)
    for (const [id, a] of active) {
      if (a.take.tape.at + a.take.tape.dur <= pos - 0.02) {
        try { a.src.onended = null; a.src.stop() } catch { /* fine */ }
        a.gain.disconnect()
        active.delete(id)
      }
    }
  }

  // ---- grains: the sound of tape moving under a hand (scrub, rew/ff) ----
  const grain = (vel) => {
    const now = performance.now()
    if (now - lastGrainAt < 40) return
    lastGrainAt = now
    const reel = opts.getReel()
    const speedAbs = Math.min(4, Math.max(0.3, Math.abs(vel)))
    for (const take of reel.takes) {
      const t0 = take.tape.at
      const t1 = t0 + take.tape.dur
      if (pos < t0 || pos > t1) continue
      const p = take.tape.rate
      const fwd = vel >= 0
      const buf = fwd ? buffers.get(take.audio.sha256) : buffers.get(`rev:${take.audio.sha256}`)
      if (!buf) {
        if (fwd) wantBuffer(take.audio)
        else {
          LoreStore.reversed(take.audio, ensureCtx()).then((b) => buffers.set(`rev:${take.audio.sha256}`, b)).catch(() => {})
        }
        continue
      }
      const srcOff = take.tape.offset + (pos - t0) * p
      const grainSrc = 0.09 * p * speedAbs
      const off = fwd ? srcOff : Math.max(0, buf.duration - srcOff)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.playbackRate.value = speedAbs * p
      const g = ctx.createGain()
      const t = ctx.currentTime
      const outDur = grainSrc / (speedAbs * p)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(take.tape.gain, t + 0.006)
      g.gain.setValueAtTime(take.tape.gain, t + Math.max(0.006, outDur - 0.012))
      g.gain.linearRampToValueAtTime(0, t + outDur)
      src.connect(g)
      g.connect(trackGains[take.tape.track])
      try { src.start(t, Math.max(0, off), grainSrc) } catch { continue }
      src.onended = () => g.disconnect()
    }
  }

  // ---- the tick (engine-owned rAF; cheap when idle) ----
  const tick = () => {
    requestAnimationFrame(tick)
    if (!ctx) return
    integrate()
    if (winding) grain(winding * 8)
    if (playing || rate > 0.002) {
      prefetch()
      schedule()
    } else if (!playing && target === 0 && active.size) {
      hardStop()
    }
  }
  requestAnimationFrame(tick)

  // ---- transport ----
  const play = () => {
    ensureCtx().resume()
    if (playing) return
    playing = true
    winding = 0
    setRate(speed, 0.08)
  }

  const stop = () => {
    if (recording) punchOut()
    if (!ctx) return
    playing = false
    winding = 0
    setRate(0, 0.22) // the sag
  }

  const seek = (p) => {
    if (!ctx) { pos = Math.max(0, p); return }
    integrate()
    pos = Math.max(0, p)
    hardStop() // scheduling refills on the next tick
  }

  const setSpeed = (s) => {
    speed = Math.min(2, Math.max(0.5, s))
    if (recording) return // the knob locks while the head writes
    if (playing) setRate(speed, 0.08)
  }

  // scrub: the hand owns the tape — transport lets go instantly (no sag
  // while grabbed), grains speak the motion
  const scrubTo = (p, vel) => {
    if (recording) punchOut() // grabbing the tape is a punch-out, honestly
    ensureCtx().resume()
    playing = false
    winding = 0
    integrate()
    target = 0
    rate = 0
    pos = Math.max(0, p)
    hardStop()
    grain(vel)
  }
  const scrubEnd = () => {}

  const windHold = (dir) => {
    ensureCtx().resume()
    if (recording) punchOut()
    playing = false
    winding = dir
    setRate(dir * 8, 0.06)
  }
  const windRelease = () => {
    winding = 0
    setRate(0, 0.15)
  }

  // ---- recording ----
  const pickMime = () => {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
    for (const m of candidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) return m
    }
    return ''
  }

  const ensureMic = async () => {
    if (mic) return mic
    const stream = await navigator.mediaDevices.getUserMedia({
      // tape character: no browser "help" between the voice and the reel
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    })
    const src = ensureCtx().createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    src.connect(analyser) // meter only — never routed to output (feedback)
    mic = { stream, analyser, data: new Uint8Array(analyser.fftSize) }
    return mic
  }

  const level = () => {
    if (!mic || !recording) return 0
    mic.analyser.getByteTimeDomainData(mic.data)
    let sum = 0
    for (let i = 0; i < mic.data.length; i++) {
      const v = (mic.data[i] - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / mic.data.length) * 3)
  }

  const punchIn = async (track) => {
    if (recording) return
    await ensureMic()
    await ctx.resume()
    const mime = pickMime()
    const rec = mime ? new MediaRecorder(mic.stream, { mimeType: mime }) : new MediaRecorder(mic.stream)
    const chunks = []
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size) chunks.push(e.data)
    }
    if (!playing) play()
    integrate()
    recording = { track, from: pos, speed, rec, chunks, wallIn: Date.now() }
    rec.onerror = () => {
      recording = null
      if (opts.onError) opts.onError('the recorder failed — nothing was wound')
    }
    rec.start(250)
  }

  const punchOut = () => {
    if (!recording) return
    const r = recording
    recording = null
    integrate()
    const posOut = pos
    const wallOut = Date.now()
    r.rec.onstop = async () => {
      try {
        const mime = r.rec.mimeType || 'audio/webm'
        const blob = new Blob(r.chunks, { type: mime })
        if (!blob.size) throw new Error('empty capture')
        const buf = await blob.arrayBuffer()
        const decodedBuf = await ensureCtx().decodeAudioData(buf.slice(0))
        const audio = await LoreStore.put(blob, { dur: decodedBuf.duration, mime })
        buffers.set(audio.sha256, decodedBuf)
        const S = r.speed
        const tapeSpan = decodedBuf.duration * S
        // end-anchored at punch-out: capture-start latency shortens the
        // clip, never smears its tail (DESIGN §6's asterisk, minimized)
        const at = Math.max(0, posOut - tapeSpan)
        opts.onTake({
          audio: { sha256: audio.sha256, size: audio.size, mime: audio.mime, dur: audio.dur },
          tape: { track: r.track, at, offset: 0, dur: tapeSpan, gain: 1, rate: 1 / S },
          punch: { in: r.wallIn, out: wallOut, speed: S },
          source: { type: 'mic' },
        })
      } catch (err) {
        if (opts.onError) opts.onError(`that take was lost before it was wound (${err.message})`)
      }
    }
    try { r.rec.stop() } catch { /* already stopped */ }
  }

  const applyMix = (gains) => {
    if (!ctx) return
    gains.forEach((g, i) => trackGains[i].gain.setTargetAtTime(g, ctx.currentTime, 0.03))
  }

  const init = (o) => {
    opts = o
  }

  return {
    ready: true,
    init,
    ensureCtx,
    pos: () => {
      integrate()
      return pos
    },
    rate: () => rate,
    speed: () => speed,
    playing: () => playing,
    recording: () => (recording ? { track: recording.track, from: recording.from } : null),
    level,
    play,
    stop,
    seek,
    setSpeed,
    scrubTo,
    scrubEnd,
    windHold,
    windRelease,
    punchIn,
    punchOut,
    applyMix,
    // T-157 reaches in for the bake: same take math, offline context
    _buffers: buffers,
  }
})()

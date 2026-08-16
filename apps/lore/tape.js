/* The tape — canvas timeline. The head is fixed; you pull the tape past it
   (dragging scrubs, and the engine makes it audible). One source of truth for
   position: the app's playhead — the view is derived, never a second state.
   Rendering is deliberately cheap (bucketed peaks, one mirrored path per
   take, no shadows, no per-frame gradients): a phone must hold 60fps. */
/* global LoreTheme, LoreReel */
/* exported LoreTape */
const LoreTape = (() => {
  const RULER_H = 16
  const WORDS_H = 20
  const HEAD_X = 0.38 // the head sits at 38% width, OP-style

  let canvas = null
  let ctx = null
  let opts = null // { getPos, getReel, isPlaying, getRecording, hasBlob, peaksFor, scrubTo, scrubEnd, onTakeTap, onSayingTap, getSelected }
  let dpr = 1
  let w = 0
  let h = 0
  let pxPerSec = 40
  const peaksCache = new Map() // sha256 → Float32Array | 'pending'

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    dpr = window.devicePixelRatio || 1
    w = Math.max(1, Math.round(rect.width))
    h = Math.max(1, Math.round(rect.height))
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const laneGeom = () => {
    const top = RULER_H + WORDS_H
    const laneH = (h - top) / LoreReel.TRACKS
    return { top, laneH }
  }

  const xOf = (t, pos) => (t - pos) * pxPerSec + w * HEAD_X
  const tOf = (x, pos) => (x - w * HEAD_X) / pxPerSec + pos

  const peaksOf = (take) => {
    const sha = take.audio.sha256
    const hit = peaksCache.get(sha)
    if (hit && hit !== 'pending') return hit
    if (!hit && opts.peaksFor) {
      peaksCache.set(sha, 'pending')
      opts.peaksFor(take.audio).then((p) => {
        if (p) peaksCache.set(sha, p)
        else peaksCache.delete(sha)
      }).catch(() => peaksCache.delete(sha))
    }
    return null
  }

  // ---- drawing ----

  const drawRuler = (tk, pos) => {
    const steps = [0.1, 0.5, 1, 5, 10, 30, 60, 300]
    const step = steps.find((s) => s * pxPerSec >= 56) || 600
    ctx.font = "9px 'JetBrains Mono', ui-monospace, monospace"
    ctx.fillStyle = tk.dim
    ctx.strokeStyle = tk.ln
    ctx.lineWidth = 1
    const t0 = Math.max(0, Math.floor(tOf(0, pos) / step) * step)
    const t1 = tOf(w, pos)
    for (let t = t0; t <= t1; t += step) {
      const x = Math.round(xOf(t, pos)) + 0.5
      ctx.beginPath()
      ctx.moveTo(x, RULER_H - 5)
      ctx.lineTo(x, RULER_H)
      ctx.stroke()
      const m = Math.floor(t / 60)
      const s = t % 60
      const label = step < 1 ? t.toFixed(1) : `${m}:${String(Math.floor(s)).padStart(2, '0')}`
      ctx.fillText(label, x + 3, 9)
    }
  }

  const drawWave = (take, x, y, bw, bh, color) => {
    const peaks = peaksOf(take)
    ctx.fillStyle = color
    if (!peaks) {
      // no peaks yet: a quiet center line says "sound lives here"
      ctx.globalAlpha = 0.5
      ctx.fillRect(x + 2, y + bh / 2 - 0.5, bw - 4, 1)
      ctx.globalAlpha = 1
      return
    }
    // the take shows its window [offset, offset+dur·rate) of the source
    const srcDur = take.audio.dur || (take.tape.dur * take.tape.rate)
    const srcFrom = take.tape.offset / srcDur
    const srcSpan = (take.tape.dur * take.tape.rate) / srcDur
    const mid = y + bh / 2
    const amp = bh / 2 - 2
    const n = Math.max(1, Math.floor(bw / 2)) // one bucket per 2px
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const p = Math.min(peaks.length - 1, Math.floor((srcFrom + (i / n) * srcSpan) * peaks.length))
      const v = Math.min(1, peaks[Math.max(0, p)] || 0)
      ctx.lineTo(x + (i / n) * bw, mid - v * amp)
    }
    for (let i = n; i >= 0; i--) {
      const p = Math.min(peaks.length - 1, Math.floor((srcFrom + (i / n) * srcSpan) * peaks.length))
      const v = Math.min(1, peaks[Math.max(0, p)] || 0)
      ctx.lineTo(x + (i / n) * bw, mid + v * amp + 1)
    }
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  const draw = () => {
    if (!ctx) return
    const tk = LoreTheme.tokens()
    const pos = opts.getPos()
    const reel = opts.getReel()
    const selected = opts.getSelected ? opts.getSelected() : null
    const { top, laneH } = laneGeom()

    ctx.fillStyle = tk.bg
    ctx.fillRect(0, 0, w, h)

    // lanes
    for (let i = 0; i < LoreReel.TRACKS; i++) {
      const y = top + i * laneH
      if (i % 2 === 1) {
        ctx.fillStyle = tk.sf
        ctx.globalAlpha = 0.5
        ctx.fillRect(0, y, w, laneH)
        ctx.globalAlpha = 1
      }
      ctx.strokeStyle = tk.ln
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, Math.round(y) + 0.5)
      ctx.lineTo(w, Math.round(y) + 0.5)
      ctx.stroke()
      // lane number, parked at the left edge
      ctx.font = "9px 'JetBrains Mono', ui-monospace, monospace"
      ctx.fillStyle = tk.tracks[i]
      ctx.globalAlpha = 0.7
      ctx.fillText(String(i + 1), 4, y + 11)
      ctx.globalAlpha = 1
    }
    ctx.strokeStyle = tk.ln
    ctx.beginPath()
    ctx.moveTo(0, RULER_H + 0.5)
    ctx.lineTo(w, RULER_H + 0.5)
    ctx.stroke()

    drawRuler(tk, pos)

    // zero mark: the tape starts somewhere
    const zx = xOf(0, pos)
    if (zx > -1 && zx < w + 1) {
      ctx.strokeStyle = tk.dim
      ctx.globalAlpha = 0.6
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      ctx.moveTo(Math.round(zx) + 0.5, RULER_H)
      ctx.lineTo(Math.round(zx) + 0.5, h)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }

    // takes
    for (const take of reel.takes) {
      const x = xOf(take.tape.at, pos)
      const bw = take.tape.dur * pxPerSec
      if (x + bw < -20 || x > w + 20) continue
      const y = top + take.tape.track * laneH + 3
      const bh = laneH - 6
      const color = tk.tracks[take.tape.track]
      const ghost = !opts.hasBlob(take.audio.sha256)
      const r = 3
      ctx.beginPath()
      ctx.roundRect(x, y, Math.max(bw, 2), bh, r)
      if (ghost) {
        ctx.setLineDash([4, 3])
        ctx.strokeStyle = tk.dim
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])
        ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace"
        ctx.fillStyle = tk.dim
        if (bw > 18) ctx.fillText('∅', x + bw / 2 - 3, y + bh / 2 + 3)
      } else {
        ctx.globalAlpha = 0.16
        ctx.fillStyle = color
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = selected === take.id ? tk.ac : color
        ctx.lineWidth = selected === take.id ? 2 : 1
        ctx.stroke()
        if (bw > 8) drawWave(take, x, y, bw, bh, color)
      }
      if (take.caption && bw > 14) {
        ctx.fillStyle = tk.tx
        ctx.fillRect(x + 4, y + 4, 3, 3)
      }
    }

    // live recording block: the head writes rightward from the punch
    const rec = opts.getRecording()
    if (rec) {
      const x = xOf(rec.from, pos)
      const y = top + rec.track * laneH + 3
      const bw = Math.max(2, (pos - rec.from) * pxPerSec)
      ctx.fillStyle = tk.ac
      ctx.globalAlpha = 0.25 + 0.1 * Math.sin(performance.now() / 180)
      ctx.fillRect(x, y, bw, laneH - 6)
      ctx.globalAlpha = 1
      ctx.strokeStyle = tk.ac
      ctx.strokeRect(x, y, bw, laneH - 6)
    }

    // a lifted take rides above the tape until it lands
    if (lift) {
      const x = xOf(lift.at, pos)
      const bw = lift.take.tape.dur * pxPerSec
      const y = top + lift.track * laneH + 3
      ctx.setLineDash([5, 4])
      ctx.strokeStyle = tk.ac
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.roundRect(x, y, Math.max(bw, 2), laneH - 6, 3)
      ctx.stroke()
      ctx.globalAlpha = 0.12
      ctx.fillStyle = tk.ac
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.setLineDash([])
    }

    // sayings ride above the tracks
    ctx.font = "9px 'JetBrains Mono', ui-monospace, monospace"
    for (const s of reel.sayings) {
      const x = xOf(s.at, pos)
      if (x < -80 || x > w + 10) continue
      ctx.strokeStyle = tk.ac
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.moveTo(Math.round(x) + 0.5, RULER_H + 3)
      ctx.lineTo(Math.round(x) + 0.5, RULER_H + WORDS_H - 3)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.fillStyle = selected === s.id ? tk.ac : tk.dim
      const label = s.body.length > 18 ? `${s.body.slice(0, 17)}…` : s.body
      ctx.fillText(label, x + 4, RULER_H + 13)
    }

    // the head, fixed
    const hx = Math.round(w * HEAD_X) + 0.5
    ctx.strokeStyle = tk.ac
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(hx, RULER_H)
    ctx.lineTo(hx, h)
    ctx.stroke()
    ctx.fillStyle = tk.ac
    ctx.beginPath()
    ctx.moveTo(hx - 5, RULER_H)
    ctx.lineTo(hx + 5, RULER_H)
    ctx.lineTo(hx, RULER_H + 6)
    ctx.closePath()
    ctx.fill()
  }

  // ---- gestures: drag scrubs the tape past the head; pinch/wheel zooms;
  // a still tap on a take or saying opens it ----

  const pointers = new Map()
  let drag = null // { x0, t0, moved, lastX, lastT, pinch0 }
  let lift = null // { take, grab, at, track } — a held take being moved
  let liftTimer = null

  const hitTest = (px, py) => {
    const pos = opts.getPos()
    const reel = opts.getReel()
    const { top, laneH } = laneGeom()
    if (py >= top) {
      const lane = Math.min(LoreReel.TRACKS - 1, Math.floor((py - top) / laneH))
      const t = tOf(px, pos)
      // newest wins the tap when takes overlap
      for (let i = reel.takes.length - 1; i >= 0; i--) {
        const take = reel.takes[i]
        if (take.tape.track === lane && t >= take.tape.at && t <= take.tape.at + take.tape.dur) return { take }
      }
    } else if (py > RULER_H) {
      for (let i = reel.sayings.length - 1; i >= 0; i--) {
        const s = reel.sayings[i]
        const x = xOf(s.at, pos)
        if (px >= x - 6 && px <= x + 80) return { saying: s }
      }
    }
    return null
  }

  const onDown = (e) => {
    canvas.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY })
    if (pointers.size === 1) {
      drag = { x0: e.offsetX, y0: e.offsetY, t0: performance.now(), moved: false, lastX: e.offsetX, lastT: performance.now() }
      // a held-still press on a take lifts it off the tape (move gesture)
      const hit = hitTest(e.offsetX, e.offsetY)
      clearTimeout(liftTimer)
      if (hit && hit.take && opts.onTakeMove) {
        liftTimer = setTimeout(() => {
          if (drag && !drag.moved && pointers.size === 1 && !opts.isMemory?.()) {
            lift = { take: hit.take, grab: tOf(drag.x0, opts.getPos()) - hit.take.tape.at, at: hit.take.tape.at, track: hit.take.tape.track }
            if (navigator.vibrate) navigator.vibrate(12)
          }
        }, 450)
      }
    } else if (pointers.size === 2) {
      clearTimeout(liftTimer)
      lift = null
      const [a, b] = [...pointers.values()]
      drag = { pinch0: Math.abs(a.x - b.x) || 1, ppsAtPinch: pxPerSec, moved: true }
    }
  }

  const onMove = (e) => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY })
    if (!drag) return
    if (drag.pinch0) {
      const [a, b] = [...pointers.values()]
      const d = Math.abs(a.x - b.x) || 1
      pxPerSec = Math.min(400, Math.max(4, drag.ppsAtPinch * (d / drag.pinch0)))
      return
    }
    if (lift) {
      const t = tOf(e.offsetX, opts.getPos())
      lift.at = Math.max(0, t - lift.grab)
      const { top, laneH } = laneGeom()
      if (e.offsetY >= top) {
        lift.track = Math.min(LoreReel.TRACKS - 1, Math.max(0, Math.floor((e.offsetY - top) / laneH)))
      }
      return
    }
    const now = performance.now()
    const dx = e.offsetX - drag.lastX
    if (Math.abs(e.offsetX - drag.x0) > 8) {
      if (!drag.moved) clearTimeout(liftTimer)
      drag.moved = true
    }
    if (drag.moved && dx !== 0) {
      const dPos = -dx / pxPerSec
      const dt = Math.max(1, now - drag.lastT) / 1000
      opts.scrubTo(opts.getPos() + dPos, dPos / dt)
    }
    drag.lastX = e.offsetX
    drag.lastT = now
  }

  const onUp = (e) => {
    pointers.delete(e.pointerId)
    clearTimeout(liftTimer)
    if (lift) {
      const l = lift
      lift = null
      drag = null
      if (Math.abs(l.at - l.take.tape.at) > 0.01 || l.track !== l.take.tape.track) {
        opts.onTakeMove(l.take, l.at, l.track)
      }
      return
    }
    if (drag && !drag.pinch0 && !drag.moved && performance.now() - drag.t0 < 450) {
      const hit = hitTest(e.offsetX, e.offsetY)
      if (hit && hit.take && opts.onTakeTap) opts.onTakeTap(hit.take)
      else if (hit && hit.saying && opts.onSayingTap) opts.onSayingTap(hit.saying)
    }
    if (drag && drag.moved && !drag.pinch0 && opts.scrubEnd) opts.scrubEnd()
    drag = pointers.size ? drag : null
    if (pointers.size === 1) {
      const [p] = [...pointers.values()]
      drag = { x0: p.x, y0: p.y, t0: performance.now(), moved: true, lastX: p.x, lastT: performance.now() }
    }
  }

  const onWheel = (e) => {
    e.preventDefault()
    pxPerSec = Math.min(400, Math.max(4, pxPerSec * Math.exp(-e.deltaY * 0.002)))
  }

  const init = (canvasEl, o) => {
    canvas = canvasEl
    ctx = canvas.getContext('2d')
    opts = o
    resize()
    new ResizeObserver(resize).observe(canvas)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
  }

  const invalidatePeaks = (sha) => {
    if (sha) peaksCache.delete(sha)
    else peaksCache.clear()
  }

  return { init, draw, invalidatePeaks, get pxPerSec() { return pxPerSec } }
})()

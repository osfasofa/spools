/* lore utilities: seat identity (the room's convention, copied as prose per
   the ecosystem rule — conventions travel as prose, not code dependencies),
   time formatting, and small DOM helpers. */
/* exported LoreUtil */
const LoreUtil = (() => {
  const $ = (id) => document.getElementById(id)

  // ---- seat identity (design: a seat is a device, not a person; the id is
  // opaque + variable-length, stored beside spool-author) ----
  const SEAT_KEY = 'spool-seat'

  const mySeat = () => {
    let seat = localStorage.getItem(SEAT_KEY)
    if (!seat) {
      const bytes = crypto.getRandomValues(new Uint8Array(16))
      seat = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      localStorage.setItem(SEAT_KEY, seat)
    }
    return seat
  }

  const PALETTE = ['#00E653', '#FF6A2B', '#4DC4FF', '#C79BFF', '#FFD43B', '#FF8FB3']

  const hash = (s) => {
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  const seatColor = (seat) => PALETTE[hash(seat) % PALETTE.length]
  const seatSuffix = (seat) => `#${String(seat).slice(-4).toLowerCase()}`

  // ---- time ----

  // tape counter: mm:ss.t (tenths — the LCD's rhythm)
  const tapeTime = (sec) => {
    const s = Math.max(0, sec)
    const m = Math.floor(s / 60)
    const whole = Math.floor(s % 60)
    const tenths = Math.floor((s * 10) % 10)
    return { main: `${String(m).padStart(2, '0')}:${String(whole).padStart(2, '0')}`, tenths: `.${tenths}` }
  }

  const clock = (ms) => {
    const d = new Date(ms)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const day = (ms) => new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' })

  const bytesLabel = (n) => {
    if (n < 1024) return `${n} B`
    if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`
    return `${(n / 1048576).toFixed(1)} MB`
  }

  // ---- toast (one at a time, self-clearing) ----
  let toastEl = null
  let toastTimer = null
  const toast = (msg, ms = 3200) => {
    if (toastEl) toastEl.remove()
    clearTimeout(toastTimer)
    toastEl = document.createElement('div')
    toastEl.className = 'toast'
    toastEl.setAttribute('role', 'status')
    toastEl.textContent = msg
    document.body.appendChild(toastEl)
    toastTimer = setTimeout(() => {
      toastEl.remove()
      toastEl = null
    }, ms)
  }

  // ---- sheets: one open at a time; builder returns a close function ----
  let openSheetEl = null
  const closeSheet = () => {
    if (openSheetEl) openSheetEl.remove()
    openSheetEl = null
  }
  const sheet = (build) => {
    closeSheet()
    const backdrop = document.createElement('div')
    backdrop.className = 'sheetBackdrop'
    const panel = document.createElement('div')
    panel.className = 'sheet'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'true')
    backdrop.appendChild(panel)
    backdrop.addEventListener('pointerdown', (e) => {
      if (e.target === backdrop) closeSheet()
    })
    document.body.appendChild(backdrop)
    openSheetEl = backdrop
    build(panel, closeSheet)
    return closeSheet
  }

  const el = (tag, className, text) => {
    const n = document.createElement(tag)
    if (className) n.className = className
    if (text !== undefined) n.textContent = text
    return n
  }

  // ---- WAV (16-bit stereo PCM) — adapted from tape-vibes app.ts:299,
  // with the revoke race fixed by deferring it past the click ----
  const wavEncode = (buffer) => {
    const n = buffer.length
    const left = buffer.getChannelData(0)
    const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left
    const dataSize = n * 4 // 2 channels × int16
    const out = new ArrayBuffer(44 + dataSize)
    const v = new DataView(out)
    const ws = (o, s) => {
      for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i))
    }
    ws(0, 'RIFF')
    v.setUint32(4, 36 + dataSize, true)
    ws(8, 'WAVE')
    ws(12, 'fmt ')
    v.setUint32(16, 16, true)
    v.setUint16(20, 1, true) // PCM
    v.setUint16(22, 2, true)
    v.setUint32(24, buffer.sampleRate, true)
    v.setUint32(28, buffer.sampleRate * 4, true)
    v.setUint16(32, 4, true)
    v.setUint16(34, 16, true)
    ws(36, 'data')
    v.setUint32(40, dataSize, true)
    let o = 44
    for (let i = 0; i < n; i++) {
      const l = Math.max(-1, Math.min(1, left[i]))
      const r = Math.max(-1, Math.min(1, right[i]))
      v.setInt16(o, l * 0x7fff, true)
      v.setInt16(o + 2, r * 0x7fff, true)
      o += 4
    }
    return new Blob([out], { type: 'audio/wav' })
  }

  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const fileStamp = () => {
    const d = new Date()
    const p = (x) => String(x).padStart(2, '0')
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
  }

  return { $, mySeat, seatColor, seatSuffix, tapeTime, clock, day, bytesLabel, toast, sheet, closeSheet, el, wavEncode, download, fileStamp }
})()

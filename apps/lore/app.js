/* lore — the shell. Opens or starts a reel, wires the machine's controls to
   the engine, and rerenders from the reel model on every entry event (diff
   ignored on purpose: repainting from spool.entries can never drift — the
   naive-client guarantee, chosen deliberately for the thing that must not
   lie about where sound sits). */
/* global spools, LoreTheme, LoreUtil, LoreReel, LoreEngine, LoreTape, LoreStore */
const { $, toast, sheet, el } = LoreUtil

const author = localStorage.getItem('spool-author') || 'anonymous'
const seat = LoreUtil.mySeat()

let spool = null
let reel = LoreReel.derive({ entries: [] })
let selectedTrack = 0
let selectedId = null // take/saying picked on the tape (T-156 gives it a sheet)

// wind with the seat stamped into data — the profile-table convention
const wind = (input) => {
  const data = Object.assign({ seat }, input.data)
  return spool.wind(Object.assign({}, input, { data }))
}

const refresh = () => {
  reel = LoreReel.derive(spool)
  $('reelTitle').textContent = reel.title || spool.code
  document.title = reel.title ? `${reel.title} — lore` : 'lore'
  LoreEngine.applyMix(reel.mixGains)
  LoreEngine.reschedule()
  renderGain()
}

// ---- the LCD + tape paint loop ----
const paint = () => {
  const t = LoreUtil.tapeTime(LoreEngine.pos())
  $('counterMain').textContent = t.main
  $('counterTenths').textContent = t.tenths
  $('speedReadout').textContent = `×${LoreEngine.speed().toFixed(2)}`
  const rec = LoreEngine.recording()
  const mode = rec ? 'rec' : LoreEngine.playing() ? 'play' : 'stopped'
  const modeEl = $('lcdMode')
  modeEl.textContent = mode
  modeEl.classList.toggle('rec', !!rec)
  $('playBtn').setAttribute('aria-pressed', String(LoreEngine.playing() && !rec))
  $('recLed').classList.toggle('on', !!rec)
  LoreTape.draw()
  requestAnimationFrame(paint)
}

// ---- tracks ----
const renderTracks = () => {
  const row = $('trackRow')
  row.textContent = ''
  for (let i = 0; i < LoreReel.TRACKS; i++) {
    const b = el('button', 'trackBtn')
    b.setAttribute('aria-pressed', String(i === selectedTrack))
    b.setAttribute('aria-label', `track ${i + 1}${i === selectedTrack ? ', armed' : ''}`)
    const sw = el('span', 'swatch')
    sw.style.background = `var(--t${i})`
    b.append(sw, document.createTextNode(String(i + 1)))
    b.onclick = () => {
      selectedTrack = i
      renderTracks()
      renderGain()
    }
    row.appendChild(b)
  }
}

const renderGain = () => {
  $('gainLabel').textContent = `track ${selectedTrack + 1} level`
  $('gainSlider').value = String(reel.mixGains[selectedTrack])
}

// ---- the blade and the pen (T-156) ----

// placement edits are append-only: a full replacement block, newest wins
const mendTake = (take, patch) => {
  wind({ kind: 'mend', parent: take.id, data: { tape: Object.assign({}, take.tape, patch) } })
}

const cutTake = (take) => {
  const pos = LoreEngine.pos()
  const t = take.tape
  if (pos < t.at + 0.05 || pos > t.at + t.dur - 0.05) {
    toast('park the head inside the take to cut it')
    return false
  }
  const leftDur = pos - t.at
  // two winds sharing the blob, adjacent windows; the original becomes memory
  wind({
    kind: 'take',
    body: take.caption || undefined,
    data: {
      audio: take.audio,
      tape: { track: t.track, at: t.at, offset: t.offset, dur: leftDur, gain: t.gain, rate: t.rate },
      origin: { take: take.id },
      source: take.source,
    },
  })
  wind({
    kind: 'take',
    data: {
      audio: take.audio,
      tape: { track: t.track, at: pos, offset: t.offset + leftDur * t.rate, dur: t.dur - leftDur, gain: t.gain, rate: t.rate },
      origin: { take: take.id },
      source: take.source,
    },
  })
  take.entry.delete()
  return true
}

const glossSection = (entry, glosses, close) => {
  const s = el('div', 'sheetSection')
  s.appendChild(el('div', 'sectionLabel', 'glosses — said by those who were there'))
  for (const g of glosses) {
    const line = el('div', 'caption')
    line.textContent = `${LoreReel.tellerName(reel, g)} ${LoreUtil.seatSuffix((g.data && g.data.seat) || '')}: ${g.body}`
    s.appendChild(line)
  }
  const row = el('div', 'sheetRow')
  const input = el('input', 'sheetInput')
  input.placeholder = 'add a gloss — context, correction, dispute'
  input.maxLength = 400
  const btn = el('button', 'sheetBtn', 'gloss')
  btn.onclick = () => {
    const v = input.value.trim()
    if (!v) return
    wind({ kind: 'gloss', parent: entry.id, body: v })
    close()
  }
  row.append(input, btn)
  s.appendChild(row)
  return s
}

const takeSheet = (take) => {
  selectedId = take.id
  sheet((panel, close) => {
    const closeAnd = () => {
      selectedId = null
      close()
    }
    // who and when, as testimony
    const s0 = el('div', 'sheetSection')
    const teller = LoreReel.tellerName(reel, take.entry)
    const src = take.source ? take.source.type : 'unknown'
    const meta = take.punch
      ? `punched ${LoreUtil.clock(take.punch.in)} → ${LoreUtil.clock(take.punch.out)} @ ×${take.punch.speed.toFixed(2)}`
      : `brought in (${src}${take.source && take.source.name ? `: ${take.source.name}` : ''})`
    s0.appendChild(el('div', 'sectionLabel', `take · track ${take.tape.track + 1} · ${take.tape.dur.toFixed(1)}s`))
    s0.appendChild(el('div', 'caption', `${teller} · ${meta}${take.mended ? ' · mended' : ''}${take.origin ? ' · born of a cut' : ''}`))
    panel.appendChild(s0)

    // the caption (the take's own words)
    const s1 = el('div', 'sheetSection')
    const capRow = el('div', 'sheetRow')
    const cap = el('input', 'sheetInput')
    cap.placeholder = 'caption this take'
    cap.value = take.caption
    cap.maxLength = 200
    const capBtn = el('button', 'sheetBtn', 'set')
    capBtn.onclick = () => {
      take.entry.body = cap.value.trim()
      closeAnd()
    }
    capRow.append(cap, capBtn)
    s1.appendChild(capRow)
    panel.appendChild(s1)

    // the blade and the nudge
    const s2 = el('div', 'sheetSection')
    s2.appendChild(el('div', 'sectionLabel', 'the tape'))
    const row = el('div', 'sheetRow')
    const cutBtn = el('button', 'sheetBtn', '✂ cut at head')
    cutBtn.onclick = () => {
      if (cutTake(take)) closeAnd()
    }
    const back = el('button', 'sheetBtn', '−0.1s')
    back.onclick = () => {
      mendTake(take, { at: Math.max(0, take.tape.at - 0.1) })
      closeAnd()
    }
    const fwd = el('button', 'sheetBtn', '+0.1s')
    fwd.onclick = () => {
      mendTake(take, { at: take.tape.at + 0.1 })
      closeAnd()
    }
    row.append(cutBtn, back, fwd)
    s2.appendChild(row)
    const row2 = el('div', 'sheetRow')
    const quiet = el('button', 'sheetBtn', 'quieter')
    quiet.onclick = () => {
      mendTake(take, { gain: Math.max(0, +(take.tape.gain - 0.15).toFixed(2)) })
      closeAnd()
    }
    const loud = el('button', 'sheetBtn', 'louder')
    loud.onclick = () => {
      mendTake(take, { gain: Math.min(2, +(take.tape.gain + 0.15).toFixed(2)) })
      closeAnd()
    }
    row2.append(quiet, loud, el('div', 'caption', `level ${take.tape.gain.toFixed(2)} — hold a take to move it`))
    s2.appendChild(row2)
    panel.appendChild(s2)

    panel.appendChild(glossSection(take.entry, take.glosses, closeAnd))

    // unwinding is soft — memory keeps it
    const s3 = el('div', 'sheetSection')
    const del = el('button', 'sheetBtn danger', 'unwind this take')
    del.onclick = () => {
      take.entry.delete()
      toast('unwound — the telling still remembers it')
      closeAnd()
    }
    s3.appendChild(del)
    panel.appendChild(s3)
  })
}

const sayingSheet = (s) => {
  selectedId = s.id
  sheet((panel, close) => {
    const closeAnd = () => {
      selectedId = null
      close()
    }
    const s0 = el('div', 'sheetSection')
    s0.appendChild(el('div', 'sectionLabel', `saying · ${LoreReel.tellerName(reel, s.entry)} · at ${LoreUtil.tapeTime(s.at).main}`))
    const row = el('div', 'sheetRow')
    const input = el('input', 'sheetInput')
    input.value = s.body
    input.maxLength = 400
    const set = el('button', 'sheetBtn', 'set')
    set.onclick = () => {
      const v = input.value.trim()
      if (v) s.entry.body = v
      closeAnd()
    }
    row.append(input, set)
    s0.appendChild(row)
    const row2 = el('div', 'sheetRow')
    const move = el('button', 'sheetBtn', 'move to head')
    move.onclick = () => {
      wind({ kind: 'mend', parent: s.id, data: { tape: { at: LoreEngine.pos() } } })
      closeAnd()
    }
    const del = el('button', 'sheetBtn danger', 'unwind')
    del.onclick = () => {
      s.entry.delete()
      closeAnd()
    }
    row2.append(move, del)
    s0.appendChild(row2)
    panel.appendChild(s0)
    panel.appendChild(glossSection(s.entry, s.glosses, closeAnd))
  })
}

const wordsComposer = () => {
  sheet((panel, close) => {
    const s0 = el('div', 'sheetSection')
    s0.appendChild(el('div', 'sectionLabel', `words on the tape · at ${LoreUtil.tapeTime(LoreEngine.pos()).main}`))
    const input = el('textarea', 'sheetInput')
    input.placeholder = 'a title, a toast, the rule of the house…'
    input.rows = 3
    input.maxLength = 400
    s0.appendChild(input)
    const row = el('div', 'sheetRow')
    const pin = el('button', 'sheetBtn primary', 'pin at head')
    pin.onclick = () => {
      const v = input.value.trim()
      if (!v) return
      wind({ kind: 'saying', body: v, data: { tape: { at: LoreEngine.pos() } } })
      close()
    }
    row.append(pin)
    s0.appendChild(row)
    panel.appendChild(s0)
  })
}

// ---- settings sheet ----
const settingsSheet = () => {
  sheet((panel, close) => {
    // the reel
    const s1 = el('div', 'sheetSection')
    s1.appendChild(el('div', 'sectionLabel', 'this reel'))
    const titleRow = el('div', 'sheetRow')
    const titleInput = el('input', 'sheetInput')
    titleInput.placeholder = 'name the reel'
    titleInput.value = reel.title || ''
    titleInput.maxLength = 60
    const titleBtn = el('button', 'sheetBtn', 'set')
    titleBtn.onclick = () => {
      const v = titleInput.value.trim()
      if (v && v !== reel.title) {
        wind({ kind: 'lore:reel', data: { title: v } })
        toast('the reel has a name')
      }
      close()
    }
    titleRow.append(titleInput, titleBtn)
    s1.appendChild(titleRow)
    const linkRow = el('div', 'sheetRow')
    const link = el('div', 'linkText', spool.share())
    const copy = el('button', 'sheetBtn', 'copy link')
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(spool.share())
        toast('link copied — the link is the key')
      } catch {
        toast('copy failed — the link is in the address bar')
      }
    }
    linkRow.append(link, copy)
    s1.appendChild(linkRow)
    panel.appendChild(s1)

    // you
    const s2 = el('div', 'sheetSection')
    s2.appendChild(el('div', 'sectionLabel', 'you'))
    const nameRow = el('div', 'sheetRow')
    const nameInput = el('input', 'sheetInput')
    nameInput.placeholder = 'your name'
    nameInput.value = author === 'anonymous' ? '' : author
    nameInput.maxLength = 40
    const nameBtn = el('button', 'sheetBtn', 'set (reloads)')
    nameBtn.onclick = () => {
      localStorage.setItem('spool-author', nameInput.value.trim() || 'anonymous')
      location.reload()
    }
    nameRow.append(nameInput, nameBtn)
    s2.appendChild(nameRow)
    const seatLine = el('div', 'caption', `this device signs as ${author} ${LoreUtil.seatSuffix(seat)} — testimony, not proof`)
    s2.appendChild(seatLine)
    panel.appendChild(s2)

    // skin
    const s3 = el('div', 'sheetSection')
    s3.appendChild(el('div', 'sectionLabel', 'skin'))
    const grid = el('div', 'themeGrid')
    for (const name of Object.keys(LoreTheme.THEMES)) {
      const t = LoreTheme.THEMES[name]
      const card = el('button', 'themeCard')
      if (name === LoreTheme.current()) card.classList.add('active')
      const dots = el('div', 'themeDots')
      for (const c of [t.bg, t.ac, t.tx]) {
        const d = el('span')
        d.style.background = c
        d.style.border = `1px solid ${t.ln}`
        dots.appendChild(d)
      }
      card.append(dots, document.createTextNode(name))
      card.onclick = () => {
        LoreTheme.apply(name)
        LoreTape.invalidatePeaks()
        settingsSheet() // repaint the grid's active ring
      }
      grid.appendChild(card)
    }
    s3.appendChild(grid)
    panel.appendChild(s3)

    // keepsakes — wired by T-157
    const s4 = el('div', 'sheetSection')
    s4.appendChild(el('div', 'sectionLabel', 'keepsakes'))
    s4.appendChild(el('div', 'caption', 'bake and pack land here soon — the reel ends in files, not accounts.'))
    panel.appendChild(s4)

    // the fine print
    const s5 = el('div', 'sheetSection')
    s5.appendChild(el('div', 'sectionLabel', 'the fine print'))
    const fine = el('div', 'finePrint')
    fine.textContent = 'nobody keeps this but you and the people you hand it to. the reel syncs; the sound travels by being handed — a bake, a packed reel, a link. anyone with the link can wind, mend, and name. lore lives by being retold — hold it with intent, or let it go.'
    s5.appendChild(fine)
    panel.appendChild(s5)
  })
}

// ---- arrival (first run on this device) ----
const arrival = () => {
  if (localStorage.getItem('lore-arrived')) return
  const over = el('div', 'arrival')
  const lines = el('div', 'arrivalLines')
  const LINES = [
    'this is a reel — a tape a few people hold together.',
    'wind your voice on. punch in, punch out. cut it, bake it.',
    'hand the link. it lives by being retold.',
  ]
  let i = 0
  const cursor = el('span', 'arrivalCursor')
  lines.appendChild(cursor)
  over.appendChild(lines)
  over.appendChild(el('div', 'arrivalSkip', 'tap to begin'))
  const tick = setInterval(() => {
    if (i >= LINES.length) {
      clearInterval(tick)
      return
    }
    const line = el('div', 'arrivalLine', LINES[i++])
    lines.insertBefore(line, cursor)
  }, 700)
  over.onclick = () => {
    clearInterval(tick)
    localStorage.setItem('lore-arrived', '1')
    over.remove()
  }
  document.body.appendChild(over)
}

// ---- boot ----
async function main() {
  await LoreStore.init().catch(() => toast('this browser gave lore no local storage — the reel will not survive a refresh'))
  const handed = location.hash.includes('spool=')
  try {
    spool = handed
      ? await spools.openSpool(location.href, { author })
      : await spools.newSpool({ author })
  } catch (err) {
    toast(err && err.message ? err.message : 'that link would not open')
    throw err
  }
  if (!handed) history.replaceState(null, '', spool.share())

  $('statusDot').classList.toggle('connected', spool.status === 'connected')
  spool.on('status', (s) => {
    $('statusDot').classList.toggle('connected', s === 'connected')
  })

  // the pocket beat (house sentence, T-104 lineage)
  let pocketFade = null
  const showPocket = (p) => {
    if (!p) return
    clearTimeout(pocketFade)
    const line = $('notice')
    if (p.depositError) {
      line.textContent = p.depositError === 'too-big'
        ? 'pocket: reel too big to deposit — live-only'
        : 'pocket: relay full — live-only'
      line.classList.add('warn')
    } else if (p.phase === 'checking') {
      line.textContent = 'checking the pocket…'
      line.classList.remove('warn')
    } else if (p.phase === 'applied') {
      line.textContent = `${p.applied} sealed cop${p.applied === 1 ? 'y' : 'ies'} from the pocket`
      line.classList.remove('warn')
      pocketFade = setTimeout(() => {
        line.textContent = ''
      }, 4000)
    } else {
      line.textContent = ''
    }
  }
  showPocket(spool.pocket)
  spool.on('pocket', showPocket)

  spool.on('entry', () => refresh())
  refresh()
  renderTracks()

  // the tape
  LoreTape.init($('tape'), {
    getPos: () => LoreEngine.pos(),
    getReel: () => reel,
    isPlaying: () => LoreEngine.playing(),
    getRecording: () => LoreEngine.recording(),
    getSelected: () => selectedId,
    hasBlob: (sha) => LoreStore.hasSync(sha),
    peaksFor: (audio) => LoreStore.peaks(audio, LoreEngine.ensureCtx()),
    scrubTo: (pos, vel) => LoreEngine.scrubTo(pos, vel),
    scrubEnd: () => LoreEngine.scrubEnd(),
    onTakeTap: (take) => takeSheet(take),
    onSayingTap: (s) => sayingSheet(s),
    onTakeMove: (take, at, track) => mendTake(take, { at: +at.toFixed(3), track }),
  })

  // the motor
  LoreEngine.init({
    getReel: () => reel,
    onTake: (fields) => {
      wind({ kind: 'take', data: fields })
    },
    onError: (msg) => toast(msg),
  })

  // transport
  $('playBtn').onclick = () => LoreEngine.play()
  $('stopBtn').onclick = () => LoreEngine.stop()
  $('recBtn').onclick = async () => {
    if (LoreEngine.recording()) {
      LoreEngine.punchOut()
      return
    }
    try {
      await LoreEngine.punchIn(selectedTrack)
    } catch (err) {
      toast(err && err.name === 'NotAllowedError'
        ? 'the mic stays yours — lore records nothing without permission'
        : `no way in to the mic (${err && err.message ? err.message : 'unknown'})`)
    }
  }
  const holdWind = (btn, dir) => {
    btn.addEventListener('pointerdown', (e) => {
      btn.setPointerCapture(e.pointerId)
      LoreEngine.windHold(dir)
    })
    const release = () => LoreEngine.windRelease()
    btn.addEventListener('pointerup', release)
    btn.addEventListener('pointercancel', release)
  }
  holdWind($('rewBtn'), -1)
  holdWind($('ffBtn'), 1)

  // the speed knob: 270° sweep, vertical drag, log taper, detent at 1×
  const knob = $('speedKnob')
  const knobPointer = $('knobPointer')
  const LN_HALF = Math.log(0.5)
  const LN_SPAN = Math.log(2) - Math.log(0.5)
  const tOfSpeed = (s) => (Math.log(s) - LN_HALF) / LN_SPAN
  const speedOfT = (t) => Math.exp(LN_HALF + Math.min(1, Math.max(0, t)) * LN_SPAN)
  const showKnob = () => {
    const s = LoreEngine.speed()
    knobPointer.style.transform = `rotate(${-135 + tOfSpeed(s) * 270}deg)`
    knob.setAttribute('aria-valuenow', s.toFixed(2))
  }
  const setKnob = (t) => {
    let s = speedOfT(t)
    if (Math.abs(s - 1) < 0.05) s = 1 // the detent
    if (LoreEngine.recording()) return // locked while the head writes
    LoreEngine.setSpeed(s)
    showKnob()
  }
  let knobDrag = null
  knob.addEventListener('pointerdown', (e) => {
    knob.setPointerCapture(e.pointerId)
    knobDrag = { y: e.clientY, t: tOfSpeed(LoreEngine.speed()) }
  })
  knob.addEventListener('pointermove', (e) => {
    if (!knobDrag) return
    setKnob(knobDrag.t + (knobDrag.y - e.clientY) / 150)
  })
  const knobUp = () => { knobDrag = null }
  knob.addEventListener('pointerup', knobUp)
  knob.addEventListener('pointercancel', knobUp)
  knob.addEventListener('dblclick', () => setKnob(0.5)) // t=0.5 is exactly 1×
  knob.addEventListener('wheel', (e) => {
    e.preventDefault()
    setKnob(tOfSpeed(LoreEngine.speed()) - e.deltaY * 0.0012)
  }, { passive: false })
  knob.addEventListener('keydown', (e) => {
    const t = tOfSpeed(LoreEngine.speed())
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setKnob(t + 0.04)
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setKnob(t - 0.04)
    else if (e.key === 'Home') setKnob(0.5)
    else return
    e.preventDefault()
  })
  showKnob()
  $('gainSlider').oninput = (e) => {
    // shared mix: whole-value newest-wins (lore:mix); wound on release, not per tick
  }
  $('gainSlider').onchange = (e) => {
    const gains = reel.mixGains.slice()
    gains[selectedTrack] = Number(e.target.value)
    wind({ kind: 'lore:mix', data: { tracks: gains.map((g) => ({ gain: g })) } })
  }
  $('menuBtn').onclick = settingsSheet
  $('reelTitle').onclick = settingsSheet
  $('wordsBtn').onclick = wordsComposer

  arrival()
  requestAnimationFrame(paint)

  // the service port: a labeled screw-panel for smoke scripts and the
  // curious, not an API — nothing in the UI depends on it
  window.lore = { spool, wind, reel: () => reel, engine: LoreEngine, store: LoreStore, refresh }
}

main()

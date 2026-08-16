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
    onTakeTap: (take) => {
      selectedId = selectedId === take.id ? null : take.id
    },
    onSayingTap: (s) => {
      selectedId = selectedId === s.id ? null : s.id
    },
  })

  // transport
  $('playBtn').onclick = () => (LoreEngine.ready ? LoreEngine.play() : toast('the motor arrives with the next ticket'))
  $('stopBtn').onclick = () => LoreEngine.stop()
  $('recBtn').onclick = () => toast('recording lands in T-153')
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

  arrival()
  requestAnimationFrame(paint)
}

main()

// the tape deck — a bench rig for docs/riffs/tape-deck.md
//
// Two hands on one page, one tape between them. Each hand is its own Spool
// (relayless, memory-only); the plug in the header is the rig's whole
// transport — plugged, every update crosses to the other hand at once;
// unplugged, each hand keeps its own worldview until you plug them back in
// (the engine's public surface has no disconnect, and the concurrency demo
// needs one). Two packet shapes on one tape: a set-packet that carries
// `from` and `to`, and a commuting delta. One interpreter with a direction
// knob. Each hand's head lives on this page only — direction is in the
// reading, never in the spool.
//
// The single-file build (build-single.mjs) swaps the import line below for
// a global; keep it on one line.
import { Spool, SpoolEngine, generateCode, Y } from './spools.js'

const HANDS = [
  { name: 'ana', tint: 'var(--ana)' },
  { name: 'ben', tint: 'var(--ben)' },
]
const COLORS = { red: '#e05a4e', blue: '#4e8be0', green: '#4ec27a', gold: '#e0b84e', pink: '#e07ab8', teal: '#4ecbd0' }
const START = { color: 'red', count: 0 }
const code = generateCode() // one tape; both hands hold a copy

// ---- the interpreter: one fold, a direction knob ---------------------------
const forward = (s, e) =>
  e.kind === 'set' ? { ...s, [e.data.field]: e.data.to }
  : e.kind === 'tick' ? { ...s, count: s.count + e.data.n }
  : s
const backward = (s, e) =>
  e.kind === 'set' ? { ...s, [e.data.field]: e.data.from }
  : e.kind === 'tick' ? { ...s, count: s.count - e.data.n }
  : s
const play = (packets, dir = 'forward', from = START) =>
  (dir === 'forward' ? packets : [...packets].reverse()).reduce(
    dir === 'forward' ? forward : backward,
    from
  )

// ---- rendering helpers ---------------------------------------------------------
const q = (root, sel) => root.querySelector(sel)
const byCreation = (a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1)
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
const tintOf = (author) => HANDS.find((h) => h.name === author)?.tint ?? '#999'
const sw = (c) => `<span class="sw" style="background:${COLORS[c] ?? '#555'}" title="${c}"></span>`
const chip = (e, cls = '') => {
  const who = `<span class="who" style="background:${tintOf(e.author)}" title="${e.author}"></span>`
  const body =
    e.kind === 'set' ? `${sw(e.data.from)}→${sw(e.data.to)}`
    : e.kind === 'tick' ? (e.data.n > 0 ? `+${e.data.n}` : `${e.data.n}`)
    : e.kind
  return `<div class="pk ${cls}" data-id="${e.id}" title="${e.author} · ${new Date(e.createdAt).toLocaleTimeString()}">${who}${body}</div>`
}

const template = (hand) => `
  <h2><span class="who" style="background:${hand.tint}"></span>${hand.name}<span class="status stats spacer"></span></h2>
  <div class="row">
    <span class="status">color</span><span class="row swatches"></span>
    <span class="status">count</span><button class="plus">+1</button><button class="minus">−1</button>
    <button class="undo spacer">undo mine (soft)</button>
  </div>
  <div class="tape"></div>
  <div class="row">
    <button class="to-start" title="to the start">⏮</button>
    <button class="back" title="one packet back">◀</button>
    <button class="fwd" title="one packet forward">▶</button>
    <button class="to-end" title="to the end">⏭</button>
    <span class="status head-stats"></span>
    <label class="spacer status"><input type="checkbox" class="ghosts"> ghosts</label>
  </div>
  <div class="readout"><h3>replayed forward, up to the head</h3><div class="big fwd-read"></div></div>
  <div class="readout"><h3>walked back from the end, down to the head</h3><div class="big back-read"></div></div>
  <p class="note verdict"></p>
  <div class="rewind">
    <h3>rewind <span class="moments-stats"></span></h3>
    <input type="range" class="scrub" min="0" max="0" value="0" disabled>
    <div class="row">
      <span class="status scrub-label"></span>
      <span class="spacer"></span>
      <button class="put-back" disabled>put it back to here</button>
      <button class="now" disabled>back to now</button>
    </div>
    <div class="tape then"></div>
  </div>`

// ---- a hand -------------------------------------------------------------------------
let plugged = true
const hands = []

async function mountHand(root, hand) {
  root.innerHTML = template(hand)
  // Escape-hatch construction (the shape history.test.ts uses) so moments
  // land while you watch; the shipped defaults are 2 s idle / 10 s apart.
  const engine = new SpoolEngine({ code, persist: false, disableBc: true, webrtc: false })
  const spool = new Spool(engine, '', undefined, hand.name, { debounceMs: 400, minGapMs: 1500 })
  await spool.whenReady
  const h = { ...hand, root, spool, doc: spool.doc, head: 0, follow: true, scrubTo: null }

  const windColor = (to) => {
    const from = play(spool.entries).color // the writer's memory — that's the point
    if (from !== to) spool.wind({ kind: 'set', data: { field: 'color', from, to } })
  }
  const windTick = (n) => spool.wind({ kind: 'tick', data: { n } })
  const undoMine = () => {
    const mine = spool.entries.filter((e) => e.author === hand.name)
    const last = mine[mine.length - 1]
    if (last) last.delete() // soft, on purpose — see the riff's undo verdict
  }
  const putBack = () => {
    if (h.scrubTo == null) return
    const then = spool.rewind(h.scrubTo)
    const visible = new Set(then.filter((s) => s.deletedAt == null).map((s) => s.id))
    for (const e of spool.entries) if (!visible.has(e.id)) e.delete() // newer than the moment
    for (const e of spool.deleted) if (visible.has(e.id)) e.restore() // deleted since
    h.scrubTo = null
    h.follow = true
    render()
  }

  function renderTape() {
    const es = spool.entries
    const n = es.length
    if (h.follow) h.head = n
    h.head = Math.max(0, Math.min(h.head, n))
    const ghosts = q(root, '.ghosts').checked
    const items = ghosts ? [...es, ...spool.deleted].sort(byCreation) : es
    let html = h.head === 0 ? '<div class="head"></div>' : ''
    let seen = 0
    for (const e of items) {
      const ghost = e.deletedAt != null
      if (!ghost) seen++
      html += chip(e, ghost ? 'ghost' : seen > h.head ? 'unread' : '')
      if (!ghost && seen === h.head && h.head > 0) html += '<div class="head"></div>'
    }
    if (items.length === 0) html += '<span class="empty">nothing on the tape yet — wind something</span>'
    q(root, '.tape').innerHTML = html
    q(root, '.stats').textContent = `${plural(n, 'packet')} · ${plural(spool.deleted.length, 'ghost')} · ${Y.encodeStateAsUpdate(spool.doc).byteLength} B`
    q(root, '.head-stats').textContent = `head at ${h.head} of ${n}${h.follow ? ' · following' : ''}`
    q(root, '.to-start').disabled = q(root, '.back').disabled = h.head === 0
    q(root, '.fwd').disabled = q(root, '.to-end').disabled = h.head === n
    q(root, '.undo').disabled = !es.some((e) => e.author === hand.name)

    // two readings of the same tape
    const end = play(es)
    const fwd = play(es.slice(0, h.head))
    const back = play(es.slice(h.head), 'backward', end)
    q(root, '.fwd-read').innerHTML = `${sw(fwd.color)} ${fwd.color} <span class="status">·</span> count ${fwd.count}`
    q(root, '.back-read').innerHTML = `${sw(back.color)} ${back.color} <span class="status">·</span> count ${back.count}`
    if (h.head === n) {
      q(root, '.verdict').innerHTML = 'at the end, both readings are the end state. step the head back to compare them.'
    } else {
      const colorOk = fwd.color === back.color
      const countOk = fwd.count === back.count
      q(root, '.verdict').innerHTML =
        (colorOk
          ? '<span class="ok">✓ color agrees</span>'
          : '<span class="bad">✗ color disagrees</span> — the from-lie: a set-packet\'s <code>from</code> is its writer\'s memory, not the room\'s truth') +
        ' · ' +
        (countOk
          ? '<span class="ok">✓ count agrees</span> — a commuting delta reads the same in any order, and its inverse is free'
          : '<span class="bad">✗ count disagrees</span> — this should never happen; tell the riff')
    }
  }

  function renderRewind() {
    const moments = spool.history
    const scrub = q(root, '.scrub')
    scrub.max = Math.max(0, moments.length - 1)
    scrub.disabled = moments.length === 0
    q(root, '.moments-stats').textContent = `— ${plural(moments.length, 'moment')}`
    q(root, '.put-back').disabled = q(root, '.now').disabled = h.scrubTo == null
    q(root, '.then').style.display = h.scrubTo == null ? 'none' : ''
    if (h.scrubTo == null) {
      scrub.value = scrub.max
      q(root, '.then').innerHTML = ''
      q(root, '.scrub-label').textContent = moments.length ? 'now — drag back to look' : 'no moments yet — wind something and wait a beat'
      return
    }
    const idx = moments.indexOf(h.scrubTo)
    scrub.value = Math.max(0, idx)
    try {
      const then = spool.rewind(h.scrubTo)
      q(root, '.scrub-label').textContent = `moment ${idx + 1} of ${moments.length} · ${new Date(h.scrubTo).toLocaleTimeString()} · ${plural(then.filter((s) => s.deletedAt == null).length, 'packet')} then`
      q(root, '.then').innerHTML = then.map((s) => chip(s, s.deletedAt != null ? 'ghost' : '')).join('') || '<span class="empty">an empty tape, then</span>'
    } catch (err) {
      q(root, '.scrub-label').textContent = `can't rebuild that moment: ${err.message}`
      q(root, '.then').innerHTML = ''
    }
  }

  function render() {
    root.classList.toggle('unplugged', !plugged)
    renderTape()
    renderRewind()
  }

  // wiring
  q(root, '.swatches').innerHTML = Object.keys(COLORS)
    .map((c) => `<button class="sw-btn" data-color="${c}" title="${c}">${sw(c)}</button>`)
    .join('')
  q(root, '.swatches').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-color]')
    if (b) windColor(b.dataset.color)
  })
  q(root, '.plus').onclick = () => windTick(+1)
  q(root, '.minus').onclick = () => windTick(-1)
  q(root, '.undo').onclick = undoMine
  q(root, '.ghosts').onchange = render
  q(root, '.tape').addEventListener('click', (ev) => {
    const g = ev.target.closest('.pk.ghost')
    if (g) spool.deleted.find((e) => e.id === g.dataset.id)?.restore()
  })
  const step = (to, stick) => {
    h.head = to
    h.follow = stick
    render()
  }
  q(root, '.to-start').onclick = () => step(0, false)
  q(root, '.back').onclick = () => step(h.head - 1, false)
  q(root, '.fwd').onclick = () => step(h.head + 1, h.head + 1 >= spool.entries.length)
  q(root, '.to-end').onclick = () => step(spool.entries.length, true)
  q(root, '.scrub').oninput = () => {
    h.scrubTo = spool.history[+q(root, '.scrub').value] ?? null
    renderRewind()
  }
  q(root, '.put-back').onclick = putBack
  q(root, '.now').onclick = () => {
    h.scrubTo = null
    renderRewind()
  }
  spool.on('entry', render)
  spool.doc.getArray('history').observe(renderRewind) // moments have no SDK event; watch the root array
  h.render = render
  render()
  return h
}

// ---- the tape between them: the plug ------------------------------------------------
const [ana, ben] = await Promise.all([
  mountHand(document.getElementById('hand-ana'), HANDS[0]),
  mountHand(document.getElementById('hand-ben'), HANDS[1]),
])
hands.push(ana, ben)
const wire = (from, to) => {
  from.doc.on('update', (update, origin) => {
    if (plugged && origin !== 'remote') Y.applyUpdate(to.doc, update, 'remote')
  })
}
wire(ana, ben)
wire(ben, ana)

const renderAll = () => {
  const plugBtn = document.getElementById('plug')
  plugBtn.textContent = plugged ? 'plugged in' : 'unplugged — click to plug back in'
  plugBtn.classList.toggle('on', plugged)
  document.getElementById('deck-section').classList.toggle('unplugged', !plugged)
  document.getElementById('deck-stats').textContent = `tape ${code}`
  for (const h of hands) h.render()
}
const plug = () => {
  plugged = true
  // exchange whole states both ways; the CRDT makes the overlap harmless
  Y.applyUpdate(ben.doc, Y.encodeStateAsUpdate(ana.doc), 'remote')
  Y.applyUpdate(ana.doc, Y.encodeStateAsUpdate(ben.doc), 'remote')
  renderAll()
}
const unplug = () => {
  plugged = false
  renderAll()
}
document.getElementById('plug').onclick = () => (plugged ? unplug() : plug())

// two packets at load, one from each hand, so the page opens with a tape on it
ana.spool.wind({ kind: 'set', data: { field: 'color', from: START.color, to: 'blue' } })
ben.spool.wind({ kind: 'tick', data: { n: +1 } })
renderAll()

// for the driver script and the curious: the rig's parts, in the console
window.deck = { hands, plug, unplug, play, Y, get plugged() { return plugged } }

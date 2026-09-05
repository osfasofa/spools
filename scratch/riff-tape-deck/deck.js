// the tape deck — a bench rig for docs/riffs/tape-deck.md
//
// One spool, relayless and memory-only, synced between tabs on this machine
// over a BroadcastChannel the rig owns (so it can be unplugged — the engine's
// public surface has no disconnect, and the concurrency demo needs one). Two
// packet shapes on one tape: a set-packet that carries `from` and `to`, and a
// commuting delta. One interpreter with a direction knob. The head lives in
// this tab only — direction is in the reading, never in the spool.

import { Spool, SpoolEngine, generateCode, isValidCode, Y } from './spools.js'

// ---- who and where ---------------------------------------------------------
const NAMES = ['ana', 'ben', 'cy', 'dee']
const HAND = { ana: 'var(--ana)', ben: 'var(--ben)', cy: 'var(--cy)', dee: 'var(--dee)' }
const COLORS = { red: '#e05a4e', blue: '#4e8be0', green: '#4ec27a', gold: '#e0b84e', pink: '#e07ab8', teal: '#4ecbd0' }
const START = { color: 'red', count: 0 }

const url = new URL(location.href)
let code = new URLSearchParams(url.hash.slice(1)).get('deck')
if (!code || !isValidCode(code)) code = generateCode()
let me = url.searchParams.get('me')
if (!NAMES.includes(me)) me = NAMES[Math.floor(Math.random() * NAMES.length)]
url.searchParams.set('me', me)
url.hash = `deck=${code}`
history.replaceState(null, '', url)
const otherUrl = new URL(url)
otherUrl.searchParams.set('me', NAMES.find((n) => n !== me))

// ---- the spool ---------------------------------------------------------------
// Escape-hatch construction (the shape history.test.ts uses) so moments land
// while you watch; the shipped defaults are 2 s idle / 10 s apart.
const engine = new SpoolEngine({ code, persist: false, disableBc: true, webrtc: false })
const spool = new Spool(engine, '', undefined, me, { debounceMs: 400, minGapMs: 1500 })
await spool.whenReady
const doc = spool.doc

// ---- the rig's transport: a BroadcastChannel with a plug -------------------
const bc = new BroadcastChannel(`deck:${code}`)
let plugged = true
const send = (msg) => bc.postMessage(msg)
doc.on('update', (update, origin) => {
  if (origin !== 'remote' && plugged) send({ t: 'update', u: update })
})
bc.onmessage = ({ data }) => {
  if (!plugged) return // unplugged: whatever the other hand does stays over there
  if (data.t === 'hello') send({ t: 'state', u: Y.encodeStateAsUpdate(doc) })
  else Y.applyUpdate(doc, data.u, 'remote')
}
const plug = () => {
  plugged = true
  send({ t: 'state', u: Y.encodeStateAsUpdate(doc) }) // everything I have
  send({ t: 'hello' }) // and please send me everything you have
  render()
}
const unplug = () => {
  plugged = false
  render()
}

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

// ---- the head: this tab's read position, never wound into the spool --------
let head = 0
let follow = true // stick to the end while new packets arrive

// ---- winding -----------------------------------------------------------------
const windColor = (to) => {
  const from = play(spool.entries).color // the writer's memory — that's the point
  if (from !== to) spool.wind({ kind: 'set', data: { field: 'color', from, to } })
}
const windTick = (n) => spool.wind({ kind: 'tick', data: { n } })
const undoMine = () => {
  const mine = spool.entries.filter((e) => e.author === me)
  const last = mine[mine.length - 1]
  if (last) last.delete() // soft, on purpose — see the riff's undo verdict
}

// ---- rewind ------------------------------------------------------------------
let scrubTo = null // a moment's timestamp while scrubbing, null = now
const putBack = () => {
  if (scrubTo == null) return
  const then = spool.rewind(scrubTo)
  const visible = new Set(then.filter((s) => s.deletedAt == null).map((s) => s.id))
  for (const e of spool.entries) if (!visible.has(e.id)) e.delete() // newer than the moment
  for (const e of spool.deleted) if (visible.has(e.id)) e.restore() // deleted since
  scrubTo = null
  follow = true
  render()
}

// ---- render ------------------------------------------------------------------
const $ = (id) => document.getElementById(id)
const byCreation = (a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1)
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
const sw = (c) => `<span class="sw" style="background:${COLORS[c] ?? '#555'}" title="${c}"></span>`
const chip = (e, cls = '') => {
  const who = `<span class="who" style="background:${HAND[e.author] ?? '#999'}" title="${e.author}"></span>`
  const body =
    e.kind === 'set' ? `${sw(e.data.from)}→${sw(e.data.to)}`
    : e.kind === 'tick' ? (e.data.n > 0 ? `+${e.data.n}` : `${e.data.n}`)
    : e.kind
  return `<div class="pk ${cls}" data-id="${e.id}" title="${e.author} · ${new Date(e.createdAt).toLocaleTimeString()}">${who}${body}</div>`
}

function renderTape() {
  const es = spool.entries
  const n = es.length
  if (follow) head = n
  head = Math.max(0, Math.min(head, n))
  const ghosts = $('ghosts').checked
  const items = ghosts ? [...es, ...spool.deleted].sort(byCreation) : es
  let html = head === 0 ? '<div class="head"></div>' : ''
  let seen = 0
  for (const e of items) {
    const ghost = e.deletedAt != null
    if (!ghost) seen++
    html += chip(e, ghost ? 'ghost' : seen > head ? 'unread' : '')
    if (!ghost && seen === head && head > 0) html += '<div class="head"></div>'
  }
  if (items.length === 0) html += '<span class="empty">nothing on the tape yet — wind something</span>'
  $('tape').innerHTML = html
  $('tape-stats').textContent = `— ${plural(n, 'packet')}, ${plural(spool.deleted.length, 'ghost')}`
  $('head-stats').textContent = `head at ${head} of ${n}${follow ? ' · following' : ''}`
  $('to-start').disabled = $('back').disabled = head === 0
  $('fwd').disabled = $('to-end').disabled = head === n
  $('undo').disabled = !spool.entries.some((e) => e.author === me)

  // two readings of the same tape
  const end = play(es)
  const fwd = play(es.slice(0, head))
  const back = play(es.slice(head), 'backward', end)
  $('fwd-read').innerHTML = `${sw(fwd.color)} ${fwd.color} <span class="status">·</span> count ${fwd.count}`
  $('back-read').innerHTML = `${sw(back.color)} ${back.color} <span class="status">·</span> count ${back.count}`
  if (head === n) {
    $('verdict').innerHTML = 'at the end, both readings are the end state. step the head back to compare them.'
  } else {
    const colorOk = fwd.color === back.color
    const countOk = fwd.count === back.count
    $('verdict').innerHTML =
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
  const scrub = $('scrub')
  scrub.max = Math.max(0, moments.length - 1)
  scrub.disabled = moments.length === 0
  $('moments-stats').textContent = `— ${plural(moments.length, 'moment')}`
  $('put-back').disabled = $('now').disabled = scrubTo == null
  $('then').style.display = scrubTo == null ? 'none' : ''
  if (scrubTo == null) {
    scrub.value = scrub.max
    $('then').innerHTML = ''
    $('scrub-label').textContent = moments.length ? 'now — drag back to look' : 'no moments yet — wind something and wait a beat'
    return
  }
  const idx = moments.indexOf(scrubTo)
  scrub.value = Math.max(0, idx)
  try {
    const then = spool.rewind(scrubTo)
    $('scrub-label').textContent = `moment ${idx + 1} of ${moments.length} · ${new Date(scrubTo).toLocaleTimeString()} · ${plural(then.filter((s) => s.deletedAt == null).length, 'packet')} then`
    $('then').innerHTML = then.map((s) => chip(s, s.deletedAt != null ? 'ghost' : '')).join('') || '<span class="empty">an empty tape, then</span>'
  } catch (err) {
    $('scrub-label').textContent = `can't rebuild that moment: ${err.message}`
    $('then').innerHTML = ''
  }
}

function render() {
  $('me').textContent = me
  $('me-dot').style.background = HAND[me]
  $('other').href = otherUrl.href
  $('plug').textContent = plugged ? 'plugged in' : 'unplugged — click to plug back in'
  $('plug').classList.toggle('on', plugged)
  $('deck-section').classList.toggle('unplugged', !plugged)
  $('tape-section').classList.toggle('unplugged', !plugged)
  $('stats').textContent = `${Y.encodeStateAsUpdate(doc).byteLength} B on the tape`
  renderTape()
  renderRewind()
}

// ---- wiring ------------------------------------------------------------------
$('swatches').innerHTML = Object.keys(COLORS)
  .map((c) => `<button class="sw-btn" data-color="${c}" title="${c}">${sw(c)}</button>`)
  .join('')
$('swatches').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-color]')
  if (b) windColor(b.dataset.color)
})
$('plus').onclick = () => windTick(+1)
$('minus').onclick = () => windTick(-1)
$('undo').onclick = undoMine
$('plug').onclick = () => (plugged ? unplug() : plug())
$('ghosts').onchange = render
$('tape').addEventListener('click', (ev) => {
  const g = ev.target.closest('.pk.ghost')
  if (!g) return
  spool.deleted.find((e) => e.id === g.dataset.id)?.restore()
})
const step = (to, stick) => {
  head = to
  follow = stick
  render()
}
$('to-start').onclick = () => step(0, false)
$('back').onclick = () => step(head - 1, false)
$('fwd').onclick = () => step(head + 1, head + 1 >= spool.entries.length)
$('to-end').onclick = () => step(spool.entries.length, true)
document.addEventListener('keydown', (ev) => {
  if (ev.target.tagName === 'INPUT') return
  if (ev.key === 'ArrowLeft') $('back').click()
  if (ev.key === 'ArrowRight') $('fwd').click()
})
$('scrub').oninput = () => {
  scrubTo = spool.history[+$('scrub').value] ?? null
  renderRewind()
}
$('put-back').onclick = putBack
$('now').onclick = () => {
  scrubTo = null
  renderRewind()
}

spool.on('entry', render)
doc.getArray('history').observe(renderRewind) // moments have no SDK event; watch the root array
plug()
render()

// for the driver script and the curious: the rig's parts, in the console
window.deck = { spool, doc, Y, play, get head() { return head }, get plugged() { return plugged } }

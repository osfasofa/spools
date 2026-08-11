// T-030: three renderers over the same live spool — views are skins.
// Each view is { mount(spool, root) → update(change) }: mount builds the
// skeleton (including the view's own wind UI, so inputs survive rerenders),
// update rerenders entry content. `change` is the diff payload from
// on('entry'), or null for a full repaint.
//
// The forward-compat rule, exercised for real: every view must render kinds
// it doesn't understand harmlessly (generic fallback, never a crash).
/* global spools */

// ---- track bodies: the markdown-smuggle experiment (T-030 forcing function)
// A track is `[Title — Artist](url)` on line 1, note on the lines after.
// Naive views show a readable line instead of a JSON blob — that's the
// argument FOR smuggling; the parser fragility below is the argument against.
const encodeTrack = ({ title, artist, url, note }) =>
  `[${title} — ${artist}](${url})` + (note ? `\n${note}` : '')

const parseTrack = (body) => {
  const nl = body.indexOf('\n')
  const head = nl === -1 ? body : body.slice(0, nl)
  const m = /^\[(.+) — (.+)\]\((.+)\)$/.exec(head)
  if (!m) return null // a title containing " — ", a url containing ")" … smuggling is guesswork
  return { title: m[1], artist: m[2], url: m[3], note: nl === -1 ? '' : body.slice(nl + 1) }
}

// entries come from peers; a smuggled "url" is untrusted input
const safeHref = (url) => (/^https?:\/\//i.test(url) ? url : null)

const EMOJI = ['🔥', '💜', '😭', '👀']

const el = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

const when = (ts) => new Date(ts).toLocaleTimeString()

const trackLink = (track) => {
  const href = safeHref(track.url)
  const label = `${track.title} — ${track.artist}`
  if (!href) return el('span', null, label + ` (${track.url})`)
  const a = el('a', null, label)
  a.href = href
  a.target = '_blank'
  a.rel = 'noopener'
  return a
}

/** emoji reactions on an entry, via the threading mechanism — children, not a special case */
const reactionRow = (spool, entry) => {
  const row = el('span', 'reactions')
  const counts = new Map()
  for (const child of entry.children) {
    if (child.kind === 'reaction') counts.set(child.body, (counts.get(child.body) ?? 0) + 1)
  }
  for (const [emoji, n] of counts) row.appendChild(el('span', null, ` ${emoji}${n > 1 ? n : ''}`))
  for (const emoji of EMOJI) {
    const btn = el('button', null, emoji)
    btn.title = 'react'
    btn.onclick = () => void spool.wind({ kind: 'reaction', parent: entry.id, body: emoji })
    row.appendChild(btn)
  }
  return row
}

/** top-level entries only — reactions render under their parent, not as rows */
const topLevel = (spool) => spool.entries.filter((e) => e.kind !== 'reaction')

/** after an update pass, flash entries the diff says are new (smart-client path of the event contract) */
const flashAdded = (root, change) => {
  if (!change) return
  for (const entry of change.added) {
    const node = root.querySelector(`[data-id="${entry.id}"]`)
    if (node) node.classList.add('fresh')
  }
}

const VIEWS = {
  // ---- mixtape: the tape is the artifact -------------------------------
  mixtape: {
    mount(spool, root) {
      const tape = el('div', 'tape')
      tape.appendChild(el('h2', null, '▶ SIDE A'))
      const trackList = el('div')
      tape.appendChild(trackList)
      const liner = el('div')
      tape.appendChild(liner)

      const form = el('form', 'stack')
      form.appendChild(el('strong', null, 'add a track'))
      const inputs = {}
      for (const [name, placeholder] of [['url', 'song url'], ['title', 'title'], ['artist', 'artist'], ['note', 'why this one? (optional)']]) {
        inputs[name] = el('input')
        inputs[name].placeholder = placeholder
        form.appendChild(inputs[name])
      }
      const btn = el('button', null, 'wind it on')
      form.appendChild(btn)
      form.onsubmit = (ev) => {
        ev.preventDefault()
        if (!inputs.title.value.trim() || !inputs.url.value.trim()) return
        void spool.wind({
          kind: 'track',
          body: encodeTrack({
            title: inputs.title.value.trim(),
            artist: inputs.artist.value.trim() || 'unknown artist',
            url: inputs.url.value.trim(),
            note: inputs.note.value.trim(),
          }),
        })
        for (const input of Object.values(inputs)) input.value = ''
      }
      root.append(tape, form)

      return (change) => {
        trackList.textContent = ''
        liner.textContent = ''
        let n = 0
        const rest = []
        for (const entry of topLevel(spool)) {
          if (entry.kind === 'track') {
            const track = parseTrack(entry.body)
            const div = el('div', 'track')
            div.dataset.id = entry.id
            if (track) {
              n += 1
              div.appendChild(el('span', null, `${String(n).padStart(2, '0')}. `))
              div.appendChild(trackLink(track))
              if (track.note) div.appendChild(el('div', 'note', track.note))
            } else {
              // a track body the smuggle-parser can't read — show it raw, never break
              div.appendChild(el('span', null, `??. ${entry.body}`))
            }
            div.appendChild(el('div', 'meta', `${entry.author} · ${when(entry.createdAt)}`))
            div.appendChild(reactionRow(spool, entry))
            trackList.appendChild(div)
          } else {
            rest.push(entry) // notes, mysteries: liner notes, not breakage
          }
        }
        if (rest.length > 0) {
          liner.appendChild(el('h3', null, 'liner notes'))
          for (const entry of rest) {
            const div = el('div', null)
            div.dataset.id = entry.id
            div.appendChild(el('span', 'kind-tag', entry.kind))
            div.appendChild(el('span', null, `${entry.author}: ${entry.body}`))
            liner.appendChild(div)
          }
        }
        flashAdded(root, change)
      }
    },
  },

  // ---- chat: the same spool as a conversation --------------------------
  chat: {
    mount(spool, root) {
      const feed = el('div')
      const form = el('form', 'row')
      const input = el('input')
      input.placeholder = 'say something'
      input.autocomplete = 'off'
      const btn = el('button', null, 'send')
      form.append(input, btn)
      form.onsubmit = (ev) => {
        ev.preventDefault()
        const body = input.value.trim()
        if (body) void spool.wind({ kind: 'note', body })
        input.value = ''
      }
      root.append(feed, form)

      return (change) => {
        feed.textContent = ''
        for (const entry of topLevel(spool)) {
          const div = el('div', entry.kind === 'track' ? 'card' : undefined)
          div.dataset.id = entry.id
          div.appendChild(el('div', 'meta', `${entry.author} · ${when(entry.createdAt)}`))
          if (entry.kind === 'note') {
            div.appendChild(el('div', null, entry.body))
          } else if (entry.kind === 'track') {
            const track = parseTrack(entry.body)
            if (track) {
              div.appendChild(el('div', null, '🎵 ')).appendChild(trackLink(track))
              if (track.note) div.appendChild(el('div', 'note', track.note))
            } else {
              div.appendChild(el('div', null, `🎵 ${entry.body}`))
            }
            div.appendChild(reactionRow(spool, entry))
          } else {
            // unknown kind: a labeled bubble, harmless
            div.appendChild(el('span', 'kind-tag', entry.kind))
            div.appendChild(el('span', null, entry.body))
          }
          feed.appendChild(div)
        }
        flashAdded(root, change)
      }
    },
  },

  // ---- list: T-020's raw view, kind-agnostic on purpose ----------------
  list: {
    mount(spool, root) {
      const controls = el('p')
      const showDeleted = el('input')
      showDeleted.type = 'checkbox'
      const label = el('label', null, ' show deleted')
      label.prepend(showDeleted)
      controls.appendChild(label)

      const list = el('ul')

      const form = el('form', 'row')
      const input = el('input')
      input.placeholder = 'write something'
      input.autocomplete = 'off'
      const btn = el('button', null, 'wind')
      form.append(input, btn)
      form.onsubmit = (ev) => {
        ev.preventDefault()
        const body = input.value.trim()
        if (body) void spool.wind({ kind: 'note', body })
        input.value = ''
      }
      root.append(controls, form, list)

      const row = (entry, btnLabel, onClick, struck) => {
        const li = el('li', struck ? 'deleted' : undefined)
        li.dataset.id = entry.id
        li.appendChild(el('span', 'kind-tag', entry.kind))
        li.appendChild(el('span', null, `${entry.author} @ ${new Date(entry.createdAt).toLocaleString()}: ${entry.body} `))
        const button = el('button', null, btnLabel)
        button.onclick = onClick
        li.appendChild(button)
        return li
      }

      const update = (change) => {
        list.textContent = ''
        for (const e of spool.entries) list.appendChild(row(e, 'delete', () => e.delete()))
        if (showDeleted.checked) {
          for (const e of spool.deleted) list.appendChild(row(e, 'restore', () => e.restore(), true))
        }
        flashAdded(root, change)
      }
      showDeleted.onchange = () => update(null)
      return update
    },
  },
}

window.VIEWS = VIEWS

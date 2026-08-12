// The spool reference client shell. T-020 built the bones; T-030 made the
// content area a swappable renderer (views.js) — the switcher swaps skins
// over the same live spool, no reconnection.
/* global spools, VIEWS */
const $ = (id) => document.getElementById(id)

// Author is fixed when the spool opens, so changing your name reloads the page.
// (localStorage, not prompt(): a modal on load blocks the page and automation.)
const author = localStorage.getItem('spool-author') || 'anonymous'
$('author').value = author
$('saveAuthor').onclick = () => {
  localStorage.setItem('spool-author', $('author').value.trim() || 'anonymous')
  location.reload()
}

async function main() {
  // A link in the hash means someone handed you this spool; no link means
  // you're starting fresh — then the share link goes into the URL so a
  // refresh reopens the same spool.
  const handed = location.hash.includes('spool=')
  const spool = handed
    ? await spools.openSpool(location.href, { author })
    : await spools.newSpool({ author })
  if (!handed) history.replaceState(null, '', spool.share())

  $('code').textContent = spool.code
  $('share').textContent = spool.share()
  $('st').textContent = spool.status
  spool.on('status', (s) => { $('st').textContent = s })

  // ---- rewind mode (T-061): a facade with the views' read surface, backed
  // by frozen EntrySnapshots. The renderers don't change at all — they were
  // already skins over {entries, deleted, children, wind}, and memory just
  // swaps what's behind it (wind/delete/restore become no-ops; the UI for
  // them is hidden by CSS anyway).
  let rewindTs = null // null = live; otherwise the recorded moment being shown

  const memorySource = (snapshots) => {
    const live = snapshots.filter((s) => s.deletedAt == null)
    const wrap = (s) => ({
      ...s,
      get children() {
        return live.filter((c) => c.parent === s.id).map(wrap)
      },
      delete() {},
      restore() {},
    })
    return {
      entries: live.map(wrap),
      deleted: snapshots.filter((s) => s.deletedAt != null).map(wrap),
      wind() {},
    }
  }

  // ---- the view switcher: same spool, different skin ----
  let update = null
  let current = localStorage.getItem('spool-view') || 'mixtape'
  if (!VIEWS[current]) current = 'mixtape'

  const mount = () => {
    for (const btn of document.querySelectorAll('nav [data-view]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.view === current))
    }
    const root = $('view')
    root.textContent = ''
    const source = rewindTs === null ? spool : memorySource(spool.rewind(rewindTs))
    update = VIEWS[current].mount(source, root)
    update(null) // full repaint; entry events pass the diff for polish
  }
  for (const btn of document.querySelectorAll('nav [data-view]')) {
    btn.onclick = () => {
      current = btn.dataset.view
      localStorage.setItem('spool-view', current)
      mount() // view switching works mid-rewind: memory is data, views are skins
    }
  }

  // ---- the scrubber itself ----
  const scrub = $('scrub')
  const showMoment = () => {
    const moments = spool.history
    const i = moments.lastIndexOf(rewindTs)
    $('rewindLabel').textContent =
      `${new Date(rewindTs).toLocaleString()} · moment ${i + 1}/${moments.length}`
  }
  scrub.oninput = () => {
    // rewind(ts) resolves to the latest moment ≤ ts; only remount when the
    // resolved moment actually changes, so dragging stays smooth
    const ts = Number(scrub.value)
    const resolved = spool.history.filter((m) => m <= ts).pop()
    if (resolved === undefined || resolved === rewindTs) return
    rewindTs = resolved
    showMoment()
    mount()
  }
  const exitRewind = () => {
    rewindTs = null
    $('rewindBar').hidden = true
    document.body.classList.remove('rewinding')
    mount() // back to live is a plain repaint of the present — nothing to undo
  }
  $('backToLive').onclick = exitRewind
  $('rewindBtn').onclick = () => {
    if (rewindTs !== null) return exitRewind()
    const moments = spool.history
    if (moments.length === 0) {
      const btn = $('rewindBtn')
      btn.textContent = 'no memory yet'
      setTimeout(() => { btn.textContent = '⏪ rewind' }, 1500)
      return
    }
    scrub.min = moments[0]
    scrub.max = Date.now()
    scrub.value = scrub.max
    rewindTs = moments[moments.length - 1]
    $('rewindBar').hidden = false
    document.body.classList.add('rewinding')
    showMoment()
    mount()
  }

  // while in memory the present keeps syncing underneath; repaint only live
  spool.on('entry', (change) => {
    if (rewindTs === null) update(change)
  })
  mount()

  // ---- export + stash (T-080) ----
  const download = (name, text) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }
  $('exportBtn').onclick = () => download(`${spool.code}.spool.json`, spool.export())

  const panel = $('stashPanel')
  const renderStash = async () => {
    const rows = await spools.stash.list()
    const ul = $('stashList')
    ul.textContent = ''
    for (const row of rows) {
      const li = document.createElement('li')
      const isCurrent = row.code === spool.code

      const label = document.createElement('input')
      label.className = 'label'
      label.placeholder = 'label this keepsake'
      label.value = row.label ?? ''
      label.onchange = () => spools.stash.label(row.code, label.value.trim())
      li.appendChild(label)

      const meta = document.createElement('span')
      meta.className = 'meta'
      meta.textContent = ` ${row.code}${isCurrent ? ' (open now)' : ''}${row.archived ? ' · archived' : ''}` +
        (row.lastOpened ? ` · last ${new Date(row.lastOpened).toLocaleDateString()}` : '')
      li.appendChild(meta)

      const btn = (text, onClick, cls) => {
        const b = document.createElement('button')
        b.textContent = text
        if (cls) b.className = cls
        b.onclick = onClick
        li.appendChild(b)
        return b
      }
      if (!isCurrent) btn('open', () => { location.href = row.link ?? `#spool=${row.code}` })
      btn('export', async () => {
        if (isCurrent) return download(`${row.code}.spool.json`, spool.export())
        try {
          // open it quietly off to the side, export, put it back
          const temp = await spools.openSpool(row.link ?? row.code, { author })
          download(`${row.code}.spool.json`, temp.export())
          await temp.leave()
        } catch (err) {
          alert(`couldn't open ${row.code} to export it — if it was sealed, open it once via its link first (${err.message})`)
        }
      })
      btn(row.archived ? 'unarchive' : 'archive', () => {
        spools.stash.archive(row.code, !row.archived)
        renderStash()
      })
      // the one hard delete gets ceremony: two clicks, the second explicit
      const forget = btn('forget', async () => {
        if (forget.dataset.armed !== '1') {
          forget.dataset.armed = '1'
          forget.textContent = 'really forget forever?'
          setTimeout(() => { forget.dataset.armed = ''; forget.textContent = 'forget' }, 4000)
          return
        }
        try {
          if (isCurrent) await spool.leave() // release the database before deleting it
          await spools.stash.forget(row.code)
          if (isCurrent) {
            location.hash = '' // reload lands on a fresh spool
            location.reload()
          } else {
            renderStash()
          }
        } catch (err) {
          alert(`couldn't forget ${row.code}: ${err.message}`)
        }
      }, 'danger')
      ul.appendChild(li)
    }
  }
  $('stashBtn').onclick = () => {
    panel.hidden = !panel.hidden
    if (!panel.hidden) renderStash()
  }
  $('importFile').onchange = async (ev) => {
    const file = ev.target.files[0]
    if (!file) return
    try {
      const imported = await spools.importSpool(await file.text(), { author })
      const link = (await spools.stash.list()).find((s) => s.code === imported.code)?.link
      await imported.leave()
      if (imported.code === spool.code) return location.reload() // merged into the open spool
      location.href = link ?? `#spool=${imported.code}`
    } catch (err) {
      alert(`import failed: ${err.message}`)
    }
  }

  window.spool = spool // console escape hatch
}

// pasting a different spool link into the URL bar is a fragment-only
// navigation — nothing reloads on its own (found by T-021's torture run)
window.addEventListener('hashchange', () => location.reload())

main()

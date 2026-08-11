// The ugliest possible list client (T-020). Read top to bottom — this file is
// demo-as-documentation for the spools SDK.
/* global spools */
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

  const row = (who, when, body, btnLabel, onClick, struck) => {
    const li = document.createElement('li')
    if (struck) li.style.textDecoration = 'line-through'
    li.textContent = `${who} @ ${new Date(when).toLocaleString()}: ${body} `
    const btn = document.createElement('button')
    btn.textContent = btnLabel
    btn.onclick = onClick
    li.appendChild(btn)
    return li
  }

  // The naive path, on purpose: any entry event → rerender everything from
  // spool.entries. Can never drift. (The diff payload gets exercised in T-030.)
  const render = () => {
    const list = $('list')
    list.textContent = ''
    for (const e of spool.entries) {
      list.appendChild(row(e.author, e.createdAt, e.body, 'delete', () => e.delete()))
    }
    if ($('showDeleted').checked) {
      // SDK friction, recorded in T-020 Notes: spool.entries excludes
      // soft-deleted entries and there's no public way to list or re-handle
      // them, so "show deleted" goes through the spool.doc escape hatch.
      for (const [id, meta] of spool.doc.getMap('entries')) {
        if (meta.get('deletedAt') == null) continue
        const body = spool.doc.share.has('entry:' + id)
          ? spool.doc.getText('entry:' + id).toString()
          : ''
        list.appendChild(
          row(meta.get('author'), meta.get('createdAt'), body, 'restore',
            () => meta.delete('deletedAt'), true)
        )
      }
    }
  }

  spool.on('entry', render)
  $('showDeleted').onchange = render
  render()

  $('windForm').onsubmit = (ev) => {
    ev.preventDefault()
    const body = $('body').value.trim()
    if (body) spool.wind({ kind: 'note', body })
    $('body').value = ''
  }

  window.spool = spool // console escape hatch
}

main()

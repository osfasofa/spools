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
    update = VIEWS[current].mount(spool, root)
    update(null) // full repaint; entry events pass the diff for polish
  }
  for (const btn of document.querySelectorAll('nav [data-view]')) {
    btn.onclick = () => {
      current = btn.dataset.view
      localStorage.setItem('spool-view', current)
      mount()
    }
  }

  spool.on('entry', (change) => update(change))
  mount()

  window.spool = spool // console escape hatch
}

// pasting a different spool link into the URL bar is a fragment-only
// navigation — nothing reloads on its own (found by T-021's torture run)
window.addEventListener('hashchange', () => location.reload())

main()

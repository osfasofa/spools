import { useEffect, useState } from 'react'
import { newSpool, openSpool, stash, type Entry, type PocketState, type Spool, type SpoolStatus } from 'spools'

export interface SpoolState {
  spool: Spool | null
  entries: Entry[]
  status: SpoolStatus
  undecryptable: number
  /** what the relay's pocket did on open (null: keyless/relayless spool — no pocket) */
  pocket: PocketState | null
  error: string | null
}

/**
 * Where the key goes (T-165, option C — DESIGN_DOC §5 "The address bar"):
 * the browser syncs its address bar to its maker, so the bar drops `k=`
 * once the stash confirms it holds the full link for this room, and a bare
 * link (a bookmark, a reload, a synced tab) reopens through the stash. Only
 * once the stash confirms: a device whose storage swallowed the write keeps
 * the key in the bar, because that bar is then the only place it lives.
 */
const resolveHandedLink = async (): Promise<{ link: string; bare: boolean }> => {
  const params = new URLSearchParams(location.hash.slice(1))
  const code = params.get('spool')
  if (code && !params.get('k')) {
    const row = (await stash.list()).find((r) => r.code === code)
    if (row?.link) return { link: row.link, bare: false } // the stash knows this room; its link carries the key
    return { link: location.href, bare: true } // never held here: opens keyless, and the room says so
  }
  return { link: location.href, bare: false }
}
const hideKeyOnceStashed = async (code: string): Promise<void> => {
  const params = new URLSearchParams(location.hash.slice(1))
  if (!params.get('k')) return
  const row = (await stash.list()).find((r) => r.code === code)
  if (!row?.link || !/[#&]k=/.test(row.link)) return // not confirmed: the bar keeps the key
  params.delete('k')
  history.replaceState(null, '', `${location.pathname}${location.search}#${params.toString()}`)
}

/**
 * One spool for the page's lifetime: open the link in the hash, or start a
 * fresh tape and put its link in the URL bar so refresh/bookmark keep it.
 * Entries re-render via on('entry') — the naive-client path of the event
 * contract (rerender from the getter; can never drift).
 */
export const useSpool = (author: string): SpoolState => {
  const [state, setState] = useState<SpoolState>({
    spool: null,
    entries: [],
    status: 'offline',
    undecryptable: 0,
    pocket: null,
    error: null,
  })

  useEffect(() => {
    let alive = true
    let opened: Spool | null = null
    const offs: Array<() => void> = []

    const open = async () => {
      try {
        const handed = location.hash.includes('spool=')
        const resolved = handed ? await resolveHandedLink() : null
        const spool = resolved
          ? await openSpool(resolved.link, { author })
          : await newSpool({ author })
        if (!alive) {
          void spool.leave() // strict-mode double-mount or fast unmount
          return
        }
        opened = spool
        if (!handed) history.replaceState(null, '', spool.share())
        void hideKeyOnceStashed(spool.code)
        const sync = () => setState((s) => ({ ...s, spool, entries: spool.entries, status: spool.status }))
        offs.push(spool.on('entry', sync))
        offs.push(spool.on('status', sync))
        offs.push(spool.on('undecryptable', (total) => setState((s) => ({ ...s, undecryptable: total }))))
        // midnight-fetched entries arrive through the ordinary entry events;
        // this only narrates what the pocket is doing (T-104)
        offs.push(spool.on('pocket', (pocket) => setState((s) => ({ ...s, pocket }))))
        setState((s) => ({ ...s, pocket: spool.pocket }))
        sync()
      } catch (err) {
        if (alive) setState((s) => ({ ...s, error: err instanceof Error ? err.message : String(err) }))
      }
    }
    void open()

    return () => {
      alive = false
      offs.forEach((off) => off())
      void opened?.leave()
    }
  }, [author])

  return state
}

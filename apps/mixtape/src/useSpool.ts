import { useEffect, useState } from 'react'
import { newSpool, openSpool, type Entry, type Spool, type SpoolStatus } from 'spools'

export interface SpoolState {
  spool: Spool | null
  entries: Entry[]
  status: SpoolStatus
  undecryptable: number
  error: string | null
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
    error: null,
  })

  useEffect(() => {
    let alive = true
    let opened: Spool | null = null
    const offs: Array<() => void> = []

    const open = async () => {
      try {
        const handed = location.hash.includes('spool=')
        const spool = handed
          ? await openSpool(location.href, { author })
          : await newSpool({ author })
        if (!alive) {
          void spool.leave() // strict-mode double-mount or fast unmount
          return
        }
        opened = spool
        if (!handed) history.replaceState(null, '', spool.share())
        const sync = () => setState((s) => ({ ...s, spool, entries: spool.entries, status: spool.status }))
        offs.push(spool.on('entry', sync))
        offs.push(spool.on('status', sync))
        offs.push(spool.on('undecryptable', (total) => setState((s) => ({ ...s, undecryptable: total }))))
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

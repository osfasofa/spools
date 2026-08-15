import { useEffect, useState } from 'react'
import { newSpool, openSpool, type Entry, type PocketState, type Spool, type SpoolStatus } from 'spools'

export interface RoomState {
  spool: Spool | null
  entries: Entry[]
  status: SpoolStatus
  undecryptable: number
  /** what the relay's pocket did on open (null: keyless/relayless spool — no pocket) */
  pocket: PocketState | null
  error: string | null
}

/**
 * One spool for the page's lifetime — forked from the mixtape's useSpool
 * (T-090), both paid-for lessons intact: no event replay on load (render
 * from spool.entries, then subscribe) and rerender-from-the-getter on every
 * event, the naive-client path that can never drift.
 */
export const useRoom = (author: string): RoomState => {
  const [state, setState] = useState<RoomState>({
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
        const spool = handed
          ? await openSpool(location.href, { author })
          : await newSpool({ author })
        if (!alive) {
          void spool.leave() // strict-mode double-mount or fast unmount
          return
        }
        opened = spool
        if (!handed) history.replaceState(null, '', spool.share())
        // the torture harnesses drive the app through this (T-104 idiom)
        ;(window as unknown as { spool?: Spool }).spool = spool
        const sync = () => setState((s) => ({ ...s, spool, entries: spool.entries, status: spool.status }))
        offs.push(spool.on('entry', sync))
        offs.push(spool.on('status', sync))
        offs.push(spool.on('undecryptable', (total) => setState((s) => ({ ...s, undecryptable: total }))))
        // midnight-collected entries arrive through ordinary entry events;
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

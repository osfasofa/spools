import { useEffect, useState } from 'react'
import { newSpool, openSpool, stash, type Entry, type PocketState, type Spool, type SpoolStatus } from 'spools'

export interface RoomState {
  spool: Spool | null
  entries: Entry[]
  status: SpoolStatus
  undecryptable: number
  /** what the relay's pocket did on open (null: keyless/relayless spool — no pocket) */
  pocket: PocketState | null
  /** other awareness clients right now — the ONLY honest "who's here" (status 'connected' means relay-reachable, not peer-present) */
  peers: number
  /** true when local persistence held nothing at open — captured before the pocket can merge; drives the arrival overlay (T-117) */
  openedEmpty: boolean
  /** the relay refused the last connection with 1013 (T-169); the SDK stands back ~30 s and tries again on its own */
  roomFull: boolean
  /** the relay's close reason on the last refusal — "room full" or "too many connections from this address" */
  fullReason: string | null
  /** the link had no key and the stash had never held this room — it opened keyless, and a keyed room's frames will be ignored (T-165) */
  bareOpen: boolean
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
    peers: 0,
    openedEmpty: false,
    roomFull: false,
    fullReason: null,
    bareOpen: false,
    error: null,
  })

  useEffect(() => {
    let alive = true
    let opened: Spool | null = null
    const offs: Array<() => void> = []

    const open = async () => {
      try {
        const handed = location.hash.includes('spool=')
        // a bare URL may still name a relay (`#relay=…`, no `spool=`): forget
        // (T-163) and start-a-new-room (T-164) land here from a room on a
        // self-hosted relay, and staying on it is what its people expect —
        // the canonical relay is only ever the default, never a redirect
        const relay = new URLSearchParams(location.hash.slice(1)).get('relay')
        const resolved = handed ? await resolveHandedLink() : null
        const spool = resolved
          ? await openSpool(resolved.link, { author })
          : await newSpool({ author, ...(relay && /^wss?:\/\//.test(relay) ? { relay } : {}) })
        if (!alive) {
          void spool.leave() // strict-mode double-mount or fast unmount
          return
        }
        opened = spool
        // read synchronously at open-resolution, before the pocket's merge
        // continuation can run — "was there local history?" is an open-time
        // fact, not a render-time one
        const openedEmpty = spool.entries.length === 0
        setState((s) => ({ ...s, openedEmpty }))
        if (!handed) history.replaceState(null, '', spool.share())
        setState((s) => ({ ...s, bareOpen: resolved?.bare ?? false }))
        void hideKeyOnceStashed(spool.code)
        // the torture harnesses drive the app through this (T-104 idiom)
        ;(window as unknown as { spool?: Spool }).spool = spool
        // roomFull rides every sync from the getter: the relay completes the
        // upgrade before closing 1013, so `connected` lands a frame before
        // the refusal — reading the getter on each event (never caching the
        // edge) is what settles it (T-169's flicker note)
        const sync = () =>
          setState((s) => ({ ...s, spool, entries: spool.entries, status: spool.status, roomFull: spool.roomFull }))
        offs.push(spool.on('entry', sync))
        offs.push(spool.on('status', sync))
        // fires on every refused attempt while the room is full; the reason
        // tells "room full" (64 seats) from "too many from this address"
        offs.push(spool.on('full', (reason) => setState((s) => ({ ...s, roomFull: spool.roomFull, fullReason: reason }))))
        offs.push(spool.on('undecryptable', (total) => setState((s) => ({ ...s, undecryptable: total }))))
        // midnight-collected entries arrive through ordinary entry events;
        // this only narrates what the pocket is doing (T-104)
        offs.push(spool.on('pocket', (pocket) => setState((s) => ({ ...s, pocket }))))
        // peers = other awareness clients; latecomers fill in over ≤15 s
        // heartbeats (T-111) — the arrival machine must expect that
        const aw = spool.awareness
        if (aw) {
          const countPeers = () => {
            let n = 0
            for (const id of aw.getStates().keys()) if (id !== spool.doc.clientID) n++
            setState((s) => ({ ...s, peers: n }))
          }
          const onAwareness = () => countPeers()
          aw.on('change', onAwareness)
          offs.push(() => aw.off('change', onAwareness))
          countPeers()
        }
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

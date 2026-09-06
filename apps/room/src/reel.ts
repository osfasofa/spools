import type { EntrySnapshot } from 'spools'

/**
 * The reel (T-187; DESIGN_DOC §2 "reel", "cut"; §5 "The splice family").
 * A spool seen as a length of tape: it has a beginning, it grows, and it can
 * be cut. Everything here is the room's convention over the SDK's one
 * primitive, `splice()` — the SDK offers records, never a time-cut and never
 * a policy; the three decisions the reel riff measured are taken here, out
 * loud: the seam is by entry, identity is preserved, orphans are flattened.
 */

/** the newest `room:reel` entry wins — the maker's soft length, in messages, inside the relay's hard cap */
export const REEL_KIND = 'room:reel'
/** where this reel was cut from — the old room's code and relay, never its key */
export const HOME_KIND = 'room:home'

export const CUT_SENTENCE =
  'start a new reel from this message on. replies to what you cut become plain entries; hidden messages stay behind. the new reel has no past — rewind starts here. the old reel stays whole on every device that keeps it.'

export const FULL_IS_A_CUT =
  'full is a cut, not a wall — tap a message and start a new reel from there on. the old reel stays whole.'

export const REEL_LENGTH_ADVISORY =
  'a custom, not a lock: anyone with the link can change it, and the relay only ever enforces its own cap.'

/** what the selection needs to know about an entry — live Entry or frozen snapshot alike */
export interface CutRec {
  readonly id: string
  readonly kind: string
  readonly parent?: string
  snapshot(): EntrySnapshot
}

export interface CutSelection {
  records: EntrySnapshot[]
  /** conversation entries that came along — messages, not the reactions and markers that hang on them */
  kept: number
  /** replies whose parent didn't make the cut and became plain entries */
  flattened: number
  /** reactions and edit markers whose parent didn't make the cut — dropped, they mean nothing alone */
  dropped: number
}

/**
 * The cut, by entry: everything from `fromId` on in the SDK's own order
 * (createdAt, id tie-break — the order every peer computes), plus every
 * reserved `room:*` entry regardless of position, because those are settings
 * resolved newest-wins (names, the room name, the reel length), not
 * conversation. `room:home` never carries: a reel's home is its own.
 *
 * Then the thread rule, explicitly, before the SDK sees a record: a message
 * whose parent stayed behind is flattened (`parent` removed — the thread
 * went with the parent, the message stays); a reaction or an edit marker
 * whose parent stayed behind is dropped (alone it is noise, not a message).
 * `splice()` would refuse either as a dangling parent — the "not synced yet"
 * lie — so this function is where the room decides instead.
 *
 * Soft-deleted entries are not in `live` and do not cross; the sentence on
 * the button says so.
 */
export const selectCut = (live: readonly CutRec[], fromId: string): CutSelection | null => {
  const at = live.findIndex((e) => e.id === fromId)
  if (at < 0) return null
  const chosen: CutRec[] = []
  for (let i = 0; i < live.length; i++) {
    const e = live[i]
    if (e.kind === HOME_KIND) continue
    if (i >= at || e.kind.startsWith('room:')) chosen.push(e)
  }
  const ids = new Set(chosen.map((e) => e.id))
  const records: EntrySnapshot[] = []
  let kept = 0
  let flattened = 0
  let dropped = 0
  for (const e of chosen) {
    const orphan = e.parent !== undefined && !ids.has(e.parent)
    if (orphan && (e.kind === 'reaction' || e.kind === 'room:edit')) {
      dropped++
      continue
    }
    const snap = e.snapshot()
    if (orphan) {
      flattened++
      const { parent: _parent, ...rest } = snap
      records.push(rest)
    } else {
      records.push(snap)
    }
    if (!e.kind.startsWith('room:') && e.kind !== 'reaction') kept++ // what a person would call a message
  }
  return { records, kept, flattened, dropped }
}

/** the relay's health endpoint for a link's relay: ws(s)://host/yjs → http(s)://host/ */
export const relayHealthUrl = (relayWs: string): string | null => {
  try {
    const u = new URL(relayWs)
    if (u.protocol !== 'ws:' && u.protocol !== 'wss:') return null
    u.protocol = u.protocol === 'wss:' ? 'https:' : 'http:'
    u.pathname = u.pathname.replace(/\/yjs\/?$/, '/')
    u.search = ''
    u.hash = ''
    return u.toString()
  } catch {
    return null
  }
}

/**
 * The relay's advertised deposit cap — the reel length in practice, read from
 * the relay the link names and never a constant baked into the client. `null`
 * when the relay doesn't advertise one (a pre-pocket relay, or unreachable).
 */
export const fetchRelayCap = async (relayWs: string): Promise<number | null> => {
  const url = relayHealthUrl(relayWs)
  if (!url) return null
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const json = (await res.json()) as { pocket?: { maxBytes?: unknown } }
    const cap = json.pocket?.maxBytes
    return typeof cap === 'number' && Number.isFinite(cap) && cap > 0 ? cap : null
  } catch {
    return null
  }
}

/** the newest `room:reel` entry: a soft length in messages, and who set it (their seat) */
export const reelLength = (
  records: readonly { kind: string; body: string; data?: Record<string, unknown> }[]
): { messages: number; seat: string | null } | null => {
  let out: { messages: number; seat: string | null } | null = null
  for (const rec of records) {
    if (rec.kind !== REEL_KIND) continue
    const body = rec.body.trim()
    if (body === '') {
      out = null // an empty body is a clear — newest wins, like the room name
      continue
    }
    const n = Number(body)
    if (!Number.isFinite(n) || n <= 0) continue
    const seat = rec.data?.seat
    out = { messages: Math.floor(n), seat: typeof seat === 'string' && seat !== '' ? seat : null }
  }
  return out
}

export const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 2 : 1)} MB`
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { seatColor, seatSuffix, initialOf } from './seat'
import { normalizeEmoji } from './emoji'

/**
 * THE BOUNDARY (T-113): every feed pixel renders through this component and
 * nothing outside it may assume repaint-the-world.
 *
 * T-116 verdicts (measured, scratch/spike-room/room-scale.mjs): the entries
 * getter's full sort is NOT the bottleneck (3.6 ms/read at 5 000) — the DOM
 * is (5 000 rows ≈ 100 ms per event on a laptop). So: render a tail WINDOW
 * (newest 150, "show earlier" expands by 300 with scroll compensation), and
 * the scroll contract is stick-to-bottom only at bottom, a "new messages"
 * pill otherwise — never a yank.
 */

/** what both live Entries and frozen EntrySnapshots look like (mixtape idiom) */
export interface Rec {
  readonly id: string
  readonly author: string
  readonly kind: string
  readonly parent?: string
  readonly createdAt: number
  readonly data?: Record<string, unknown>
  readonly body: string
}

const WINDOW_INITIAL = 150
const WINDOW_STEP = 300
/** a createdAt this far past our now is a peer clock running ahead — annotate, don't hide (v1 order IS the writer's clock) */
const CLOCK_AHEAD_MS = 90_000

export const seatOf = (rec: Rec): string =>
  typeof rec.data?.seat === 'string' && rec.data.seat !== '' ? rec.data.seat : `author:${rec.author}`

/** what a reply quote resolves to — structurally by id, never by position (T-116) */
export type ParentRef =
  | { kind: 'ok'; seat: string; body: string }
  | { kind: 'hidden' }
  | { kind: 'missing' }

/** entries come from peers; a url is untrusted input — http(s) only (T-030) */
const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi

const Body = ({ text }: { text: string }) => {
  const parts: Array<string | { href: string }> = []
  let last = 0
  for (const m of text.matchAll(URL_RE)) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push({ href: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i}>{p}</span>
        ) : (
          <a key={i} href={p.href} target="_blank" rel="noopener noreferrer">
            {p.href}
          </a>
        )
      )}
    </>
  )
}

const timeLabel = (ts: number) =>
  new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase()

const dayLabel = (ts: number): string => {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'today'
  if (d.toDateString() === yesterday.toDateString()) return 'yesterday'
  return d
    .toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
    })
    .toLowerCase()
}

const SeatTile = ({ seat, name }: { seat: string; name: string }) => (
  <span
    className="seatTile"
    style={{ borderColor: seatColor(seat), color: seatColor(seat) }}
    aria-hidden="true"
  >
    {initialOf(name)}
  </span>
)

interface Item {
  rec: Rec
  mine: boolean
  seat: string
  groupStart: boolean
  groupEnd: boolean
  dayBreak: string | null
  fallback: boolean
  clockAhead: boolean
  hidden: boolean
}

export const MessageList = ({
  records,
  mySeat,
  resolveName,
  onInvite,
  onBubbleTap,
  onToggleReaction,
  resolveParent,
  typingSeats,
  deletedRecords,
  editedBy,
  onSeen,
  readMarkers,
  unreadAfter,
}: {
  records: Rec[]
  mySeat: string
  /** the profile table, resolved at render — names apply retroactively (T-114) */
  resolveName: (seat: string) => string
  /** copy the room link — the empty state's invite affordance (T-117) */
  onInvite?: () => void
  /** tap a message bubble → the action sheet (T-118) */
  onBubbleTap?: (rec: Rec) => void
  /** toggle my reaction on a message (T-118) */
  onToggleReaction?: (parentId: string, emoji: string) => void
  /** resolve a reply's parent by id — live, tombstone-aware (T-118) */
  resolveParent?: (id: string) => ParentRef
  /** seats currently typing (never mine) — ephemeral bubbles at the tail (T-119) */
  typingSeats?: string[]
  /** soft-deleted messages, rendered as tombstones in their slots (T-120) */
  deletedRecords?: Rec[]
  /** resolved editor name for an edited message id, else null (T-120) */
  editedBy?: (id: string) => string | null
  /** the furthest message that's been on screen (pinned + visible tab) — the ephemeral read cursor's source (T-121) */
  onSeen?: (id: string) => void
  /** message id → seats whose ephemeral read marker sits there (T-121) */
  readMarkers?: Map<string, string[]>
  /** last-seen timestamp captured at open — the "— new —" divider goes before the first later non-mine message (T-123) */
  unreadAfter?: number | null
}) => {
  // render counter for the scratch harnesses (T-116/T-126): a runaway
  // render loop is measurable instead of a mystery hang
  ;(window as unknown as { __renders?: number }).__renders =
    ((window as unknown as { __renders?: number }).__renders ?? 0) + 1

  // The window is anchored by START index, not by tail: while the reader is
  // at the bottom it trims to the newest WINDOW_INITIAL; while they're
  // scrolled up it FREEZES, so arrivals only append below and nothing above
  // the viewport is ever taken out (a sliding window shifts the page one row
  // per message — a slow yank).
  const [start, setStart] = useState(0)
  const [pill, setPill] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)
  /** scrollHeight recorded just before a "show earlier" expansion */
  const pendingPrepend = useRef<number | null>(null)
  /** the tail id — a full window never changes length, so length can't detect arrivals */
  const lastTailId = useRef<string | null>(null)

  // reserved room:* kinds are settings, not conversation; reactions become
  // chips in T-118 and never stand alone; unknown kinds get the labeled
  // fallback. Sort order is the getter's: writer clock + id tie-break — the
  // honest v1 contract. Reply relationships must always be looked up by id
  // (structurally), never inferred from position: a reply CAN sort before
  // its parent under skew.
  const deletedIds = useMemo(() => new Set((deletedRecords ?? []).map((r) => r.id)), [deletedRecords])
  const visible = useMemo(() => {
    const live = records.filter((r) => !r.kind.startsWith('room:') && r.kind !== 'reaction')
    // tombstones keep their slot (T-120): merge deleted messages back into
    // the timeline under the same deterministic order
    const dead = (deletedRecords ?? []).filter((r) => r.kind === 'message')
    if (dead.length === 0) return live
    return [...live, ...dead].sort((x, y) => x.createdAt - y.createdAt || (x.id < y.id ? -1 : 1))
  }, [records, deletedRecords])
  // trim during render (the documented render-phase adjustment) so the first
  // big sync never paints thousands of rows before a post-paint trim
  if (atBottom.current && Math.max(0, visible.length - WINDOW_INITIAL) > start) {
    setStart(Math.max(0, visible.length - WINDOW_INITIAL))
  }
  const windowed = useMemo(() => visible.slice(Math.min(start, visible.length)), [visible, start])
  const hiddenCount = Math.min(start, visible.length)

  // reactions grouped per parent by (seat, normalized emoji) — dedupe is the
  // Set: the same seat reacting 👍 then 👍🏽 counts once (T-118)
  const reactionGroups = useMemo(() => {
    const byParent = new Map<string, Map<string, Set<string>>>()
    for (const r of records) {
      if (r.kind !== 'reaction' || !r.parent || !r.body) continue
      const norm = normalizeEmoji(r.body)
      if (!norm) continue
      let m = byParent.get(r.parent)
      if (!m) byParent.set(r.parent, (m = new Map()))
      let set = m.get(norm)
      if (!set) m.set(norm, (set = new Set()))
      set.add(seatOf(r))
    }
    return byParent
  }, [records])

  // the "— new —" divider: before the first non-mine message later than the
  // last-seen timestamp captured at open (T-123). Fixed for the session —
  // the divider must not chase you while you read.
  const unreadBreakId = useMemo(() => {
    if (unreadAfter == null) return null
    const first = visible.find(
      (r) => r.kind === 'message' && r.createdAt > unreadAfter && seatOf(r) !== mySeat && !deletedIds.has(r.id)
    )
    return first?.id ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.length > 0, unreadAfter, mySeat])

  /** jump to a message by id: widen the window if needed, then center it */
  const pendingJump = useRef<string | null>(null)
  const jumpTo = (id: string) => {
    const idx = visible.findIndex((r) => r.id === id)
    if (idx === -1) return
    pendingJump.current = id
    if (idx < hiddenCount) {
      setStart(Math.max(0, idx - 5))
    } else {
      const el = scroller.current?.querySelector(`[data-rid="${id}"]`)
      el?.scrollIntoView({ block: 'center' })
      pendingJump.current = null
    }
  }

  const items = useMemo<Item[]>(() => {
    const now = Date.now()
    // the record just before the window keeps day/group continuity honest
    const before = hiddenCount > 0 ? visible[hiddenCount - 1] : undefined
    const out: Item[] = []
    for (let i = 0; i < windowed.length; i++) {
      const rec = windowed[i]
      const prev = i > 0 ? windowed[i - 1] : before
      const next = windowed[i + 1]
      const seat = seatOf(rec)
      const fallback = rec.kind !== 'message'
      const hidden = deletedIds.has(rec.id)
      const sameDay = (x: Rec, y: Rec) => new Date(x.createdAt).toDateString() === new Date(y.createdAt).toDateString()
      const dayBreak = !prev || !sameDay(prev, rec) ? dayLabel(rec.createdAt) : null
      const joins = (other: Rec | undefined) =>
        !!other && other.kind === 'message' && !deletedIds.has(other.id) && seatOf(other) === seat
      const joinsPrev = i > 0 && !dayBreak && !fallback && !hidden && joins(prev)
      const joinsNext = !fallback && !hidden && joins(next) && !!next && sameDay(rec, next)
      out.push({
        rec,
        mine: seat === mySeat,
        seat,
        groupStart: !joinsPrev,
        groupEnd: !joinsNext,
        dayBreak,
        fallback,
        clockAhead: rec.createdAt - now > CLOCK_AHEAD_MS,
        hidden,
      })
    }
    return out
  }, [windowed, visible, hiddenCount, mySeat, deletedIds])

  // native listener, not React's onScroll: the synthetic handler missed
  // programmatic scrolls in headless testing, and the contract must hold for
  // every way the position can change
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onScroll = () => {
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
      if (atBottom.current) setPill(false)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    // the virtual keyboard resizes the app (main.tsx's --app-height) without
    // a React render — keep a bottom-pinned reader pinned through it
    const vv = window.visualViewport
    const onViewport = () => {
      if (atBottom.current) el.scrollTop = el.scrollHeight
    }
    vv?.addEventListener('resize', onViewport)
    return () => {
      el.removeEventListener('scroll', onScroll)
      vv?.removeEventListener('resize', onViewport)
    }
  }, [])

  const showEarlier = () => {
    pendingPrepend.current = scroller.current?.scrollHeight ?? null
    setStart((s) => Math.max(0, s - WINDOW_STEP))
  }

  const jumpToBottom = () => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
    atBottom.current = true
    setPill(false)
  }

  // first render with content: land at the unread divider when there is one
  // (jump-to-first-unread on open), otherwise pin to newest as always
  const didInitialLand = useRef(false)

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    if (!didInitialLand.current && items.length > 0) {
      didInitialLand.current = true
      if (unreadBreakId) {
        const idx = visible.findIndex((r) => r.id === unreadBreakId)
        if (idx !== -1 && idx < hiddenCount) {
          pendingJump.current = unreadBreakId
          setStart(Math.max(0, idx - 5))
          return
        }
        const target = el.querySelector(`[data-rid="${unreadBreakId}"]`)
        if (target) {
          target.scrollIntoView({ block: 'center' })
          lastTailId.current = items[items.length - 1].rec.id
          return
        }
      }
    }
    if (pendingJump.current !== null) {
      const el = scroller.current?.querySelector(`[data-rid="${pendingJump.current}"]`)
      el?.scrollIntoView({ block: 'center' })
      pendingJump.current = null
      pendingPrepend.current = null
      lastTailId.current = items.length > 0 ? items[items.length - 1].rec.id : null
      return
    }
    const tailId = items.length > 0 ? items[items.length - 1].rec.id : null
    if (pendingPrepend.current !== null) {
      // prepend: keep the reader anchored on what they were looking at
      el.scrollTop += el.scrollHeight - pendingPrepend.current
      pendingPrepend.current = null
    } else if (atBottom.current) {
      el.scrollTop = el.scrollHeight
    } else if (tailId !== lastTailId.current && lastTailId.current !== null) {
      setPill(true) // new messages while reading history — offer, never yank
    }
    lastTailId.current = tailId
    // typingSeats in the deps: a typing bubble appearing at the tail should
    // keep a pinned reader pinned
  }, [items, typingSeats?.length])

  // the newest real message currently rendered — what "seen" can honestly claim
  const lastMsg = [...items].reverse().find((it) => !it.fallback && !it.hidden)
  const lastMsgId = useRef<string | null>(null)
  lastMsgId.current = lastMsg?.rec.id ?? null
  const onSeenRef = useRef(onSeen)
  onSeenRef.current = onSeen
  const reportSeen = () => {
    if (
      lastMsgId.current &&
      atBottom.current &&
      document.visibilityState === 'visible'
    ) {
      onSeenRef.current?.(lastMsgId.current)
    }
  }

  // post-paint geometry check: scroll events can be missed (headless frames,
  // programmatic scrolls) — self-heal at-bottom-ness after every paint, and
  // report read progress (deduped + throttled downstream, T-121)
  useEffect(() => {
    const el = scroller.current
    if (el) atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    reportSeen()
  })

  // coming back to the tab is also "seeing" — renders don't happen for it
  useEffect(() => {
    document.addEventListener('visibilitychange', reportSeen)
    return () => document.removeEventListener('visibilitychange', reportSeen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="feedWrap">
      <div className="feed" ref={scroller}>
        {hiddenCount > 0 ? (
          <button className="showEarlier" onClick={showEarlier}>
            show earlier · {hiddenCount} more
          </button>
        ) : null}
        {items.length === 0 ? (
          <div className="feedEmpty">
            <div>nothing here yet — say something.</div>
            {onInvite ? (
              <>
                <button className="inviteBtn" onClick={onInvite}>
                  ⤴ invite someone — copy the link
                </button>
                <div className="honestLine">
                  whoever holds this link reads everything and writes anything — there is no partial
                  history and no read-only.
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        {items.map((it) => {
          const groups = reactionGroups.get(it.rec.id)
          const parentRef = it.rec.parent && resolveParent ? resolveParent(it.rec.parent) : null
          return (
            <div key={it.rec.id} data-rid={it.rec.id}>
              {it.dayBreak ? <div className="dayDivider">{it.dayBreak}</div> : null}
              {it.rec.id === unreadBreakId ? <div className="unreadDivider">— new —</div> : null}
              {it.fallback ? (
                <div className="systemLine">
                  <span className="kindLabel">{it.rec.kind}</span> {it.rec.body || '(no text)'}
                </div>
              ) : it.hidden ? (
                <div className={`msgRow ${it.mine ? 'mine' : 'them'} ${it.groupStart ? 'groupStart' : ''}`}>
                  {!it.mine ? <div className="tileCol" /> : null}
                  <div className="msgCol">
                    <button
                      className="tombstone"
                      onClick={onBubbleTap ? () => onBubbleTap(it.rec) : undefined}
                    >
                      hidden · anyone can restore
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`msgRow ${it.mine ? 'mine' : 'them'} ${it.groupStart ? 'groupStart' : ''}`}>
                  {!it.mine ? (
                    <div className="tileCol">
                      {it.groupEnd ? <SeatTile seat={it.seat} name={resolveName(it.seat)} /> : null}
                    </div>
                  ) : null}
                  <div className="msgCol">
                    {!it.mine && it.groupStart ? (
                      <div className="senderLine">
                        <span className="senderName">{resolveName(it.seat)}</span>
                        <span className="senderSuffix">{seatSuffix(it.seat)}</span>
                        <span className="senderTime">{timeLabel(it.rec.createdAt)}</span>
                      </div>
                    ) : null}
                    <div
                      className={`bubble ${it.mine ? 'mine' : 'them'} ${it.groupEnd ? 'groupEnd' : ''}`}
                      onClick={onBubbleTap ? () => onBubbleTap(it.rec) : undefined}
                    >
                      {parentRef ? (
                        <button
                          className="replyQuote"
                          onClick={(ev) => {
                            ev.stopPropagation()
                            if (it.rec.parent) jumpTo(it.rec.parent)
                          }}
                        >
                          {parentRef.kind === 'ok'
                            ? `${resolveName(parentRef.seat)}: ${parentRef.body.slice(0, 34)}${parentRef.body.length > 34 ? '…' : ''}`
                            : parentRef.kind === 'hidden'
                              ? 'hidden'
                              : 'not synced yet'}
                        </button>
                      ) : null}
                      <Body text={it.rec.body} />
                      {editedBy?.(it.rec.id) ? (
                        <span className="editedMark" title={`edited by ${editedBy(it.rec.id)}`}>
                          {' '}
                          · edited
                        </span>
                      ) : null}
                    </div>
                    {groups && groups.size > 0 ? (
                      <div className="reactionRow">
                        {[...groups].map(([emoji, seats]) => (
                          <button
                            key={emoji}
                            className={`reactionChip ${seats.has(mySeat) ? 'active' : ''}`}
                            title={[...seats].map(resolveName).join(', ')}
                            aria-label={`${emoji} — ${[...seats].map(resolveName).join(', ')}${seats.has(mySeat) ? ' (tap to take yours back)' : ' (tap to react too)'}`}
                            onClick={() => onToggleReaction?.(it.rec.id, emoji)}
                          >
                            {emoji}
                            {seats.size > 1 ? <span className="reactionCount">{seats.size}</span> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {it.clockAhead ? <span className="clockAhead">this device's clock runs ahead</span> : null}
                  </div>
                </div>
              )}
              {readMarkers?.get(it.rec.id)?.length ? (
                <div className="seenRow">
                  {readMarkers.get(it.rec.id)!.map((seat) => (
                    <span
                      key={seat}
                      className="seenSquare"
                      style={{ background: seatColor(seat) }}
                      title={`seen by ${resolveName(seat)}`}
                      role="img"
                      aria-label={`seen by ${resolveName(seat)}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
        {typingSeats?.map((seat) => (
          <div key={`typing:${seat}`} className="msgRow them groupStart typingRow">
            <div className="tileCol">
              <SeatTile seat={seat} name={resolveName(seat)} />
            </div>
            <div className="msgCol">
              <div className="bubble them typingBubble" aria-label={`${resolveName(seat)} is typing`}>
                <span className="typingDot" />
                <span className="typingDot" />
                <span className="typingDot" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {pill ? (
        <button className="newMsgPill" onClick={jumpToBottom}>
          new messages ↓
        </button>
      ) : null}
    </div>
  )
}

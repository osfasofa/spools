import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { seatColor, seatSuffix, initialOf } from './seat'

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

const seatOf = (rec: Rec): string =>
  typeof rec.data?.seat === 'string' && rec.data.seat !== '' ? rec.data.seat : `author:${rec.author}`

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
  <span className="seatTile" style={{ borderColor: seatColor(seat), color: seatColor(seat) }}>
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
}

export const MessageList = ({
  records,
  mySeat,
  resolveName,
  onInvite,
}: {
  records: Rec[]
  mySeat: string
  /** the profile table, resolved at render — names apply retroactively (T-114) */
  resolveName: (seat: string) => string
  /** copy the room link — the empty state's invite affordance (T-117) */
  onInvite?: () => void
}) => {
  // render counter for the scratch harnesses (T-116/T-126): a runaway
  // render loop is measurable instead of a mystery hang
  ;(window as unknown as { __renders?: number }).__renders =
    ((window as unknown as { __renders?: number }).__renders ?? 0) + 1

  // The window is anchored by START index, not by tail: while the reader is
  // at the bottom it trims to the newest WINDOW_INITIAL; while they're
  // scrolled up it FREEZES, so arrivals only append below and nothing above
  // the viewport is ever removed (a sliding window shifts the page one row
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
  const visible = useMemo(
    () => records.filter((r) => !r.kind.startsWith('room:') && r.kind !== 'reaction'),
    [records]
  )
  // trim during render (the documented render-phase adjustment) so the first
  // big sync never paints thousands of rows before a post-paint trim
  if (atBottom.current && Math.max(0, visible.length - WINDOW_INITIAL) > start) {
    setStart(Math.max(0, visible.length - WINDOW_INITIAL))
  }
  const windowed = useMemo(() => visible.slice(Math.min(start, visible.length)), [visible, start])
  const hiddenCount = Math.min(start, visible.length)

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
      const sameDay = (x: Rec, y: Rec) => new Date(x.createdAt).toDateString() === new Date(y.createdAt).toDateString()
      const dayBreak = !prev || !sameDay(prev, rec) ? dayLabel(rec.createdAt) : null
      const joinsPrev =
        i > 0 && !!prev && !dayBreak && !fallback && prev.kind === 'message' && seatOf(prev) === seat
      const joinsNext = !!next && !fallback && next.kind === 'message' && seatOf(next) === seat && sameDay(rec, next)
      out.push({
        rec,
        mine: seat === mySeat,
        seat,
        groupStart: !joinsPrev,
        groupEnd: !joinsNext,
        dayBreak,
        fallback,
        clockAhead: rec.createdAt - now > CLOCK_AHEAD_MS,
      })
    }
    return out
  }, [windowed, visible, hiddenCount, mySeat])

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
    return () => el.removeEventListener('scroll', onScroll)
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

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
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
  }, [items])

  // post-paint geometry check: scroll events can be missed (headless frames,
  // programmatic scrolls) — self-heal at-bottom-ness after every paint
  useEffect(() => {
    const el = scroller.current
    if (el) atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  })

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
        {items.map((it) => (
          <div key={it.rec.id}>
            {it.dayBreak ? <div className="dayDivider">{it.dayBreak}</div> : null}
            {it.fallback ? (
              <div className="systemLine">
                <span className="kindLabel">{it.rec.kind}</span> {it.rec.body || '(no text)'}
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
                  <div className={`bubble ${it.mine ? 'mine' : 'them'} ${it.groupEnd ? 'groupEnd' : ''}`}>
                    <Body text={it.rec.body} />
                  </div>
                  {it.clockAhead ? <span className="clockAhead">this device's clock runs ahead</span> : null}
                </div>
              </div>
            )}
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

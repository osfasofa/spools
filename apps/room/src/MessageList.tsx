import { useLayoutEffect, useMemo, useRef } from 'react'
import { seatColor, seatSuffix, initialOf } from './seat'

/**
 * THE BOUNDARY (T-113): every feed pixel renders through this component and
 * nothing outside it may assume repaint-the-world — T-116 rewires the
 * internals (windowing, ordering, clock skew) without touching callers.
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
}

export const MessageList = ({
  records,
  mySeat,
  resolveName,
}: {
  records: Rec[]
  mySeat: string
  /** the profile table, resolved at render — names apply retroactively (T-114) */
  resolveName: (seat: string) => string
}) => {
  const items = useMemo<Item[]>(() => {
    // reserved room:* kinds are settings, not conversation (T-114 defines
    // them; the filter exists from day one). Reactions become chips in T-118
    // and never stand alone. Unknown kinds render via the labeled fallback.
    const visible = records.filter((r) => !r.kind.startsWith('room:') && r.kind !== 'reaction')
    const out: Item[] = []
    for (let i = 0; i < visible.length; i++) {
      const rec = visible[i]
      const prev = visible[i - 1]
      const next = visible[i + 1]
      const seat = seatOf(rec)
      const fallback = rec.kind !== 'message'
      const sameDay = (a: Rec, b: Rec) => new Date(a.createdAt).toDateString() === new Date(b.createdAt).toDateString()
      const dayBreak = !prev || !sameDay(prev, rec) ? dayLabel(rec.createdAt) : null
      const joinsPrev = !!prev && !dayBreak && !fallback && prev.kind === 'message' && seatOf(prev) === seat
      const joinsNext =
        !!next && !fallback && next.kind === 'message' && seatOf(next) === seat && sameDay(rec, next)
      out.push({
        rec,
        mine: seat === mySeat,
        seat,
        groupStart: !joinsPrev,
        groupEnd: !joinsNext,
        dayBreak,
        fallback,
      })
    }
    return out
  }, [records, mySeat])

  // stick to bottom ONLY when already there — never yank a reader (the full
  // scroll story is T-116's; this naive version must hold that one rule)
  const scroller = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)
  const onScroll = () => {
    const el = scroller.current
    if (el) atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }
  useLayoutEffect(() => {
    const el = scroller.current
    if (el && atBottom.current) el.scrollTop = el.scrollHeight
  }, [items])

  return (
    <div className="feed" ref={scroller} onScroll={onScroll}>
      {items.length === 0 ? <div className="feedEmpty">nothing here yet — say something.</div> : null}
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
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

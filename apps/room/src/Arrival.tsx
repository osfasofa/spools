import { useEffect, useRef, useState } from 'react'
import type { PocketPhase, SpoolStatus } from 'spools'

/**
 * The arrival state machine (T-117). A first open resolves on LOCAL
 * persistence, so a newcomer's empty room is indistinguishable from data
 * loss unless the app narrates what's actually happening: checking the
 * pocket → catching up / nobody here → this room really is empty. Full-bg
 * overlay, mono lines appearing sequentially, tap to skip (design README §5).
 * Never shown when local entries already exist.
 */

const LINE_GAP_MS = 550
/** how long "connected — nobody else here" holds before we call it really empty */
const EMPTY_VERDICT_MS = 2_500
const CLOSE_AFTER_CONTENT_MS = 600
const CLOSE_AFTER_EMPTY_MS = 1_400

export const Arrival = ({
  pocketPhase,
  status,
  peers,
  hasEntries,
  onDone,
}: {
  pocketPhase: PocketPhase | null
  status: SpoolStatus
  peers: number
  hasEntries: boolean
  onDone: () => void
}) => {
  const [lines, setLines] = useState<string[]>(['checking the pocket…'])
  const lastLineAt = useRef(Date.now())
  const emptySince = useRef<number | null>(null)
  const closeAt = useRef<number | null>(null)

  // latest inputs readable from the interval without re-arming it
  const inputs = useRef({ pocketPhase, status, peers, hasEntries })
  inputs.current = { pocketPhase, status, peers, hasEntries }

  useEffect(() => {
    const tick = setInterval(() => {
      const { pocketPhase: phase, status: st, peers: p, hasEntries: has } = inputs.current
      const now = Date.now()

      setLines((prev) => {
        const last = prev[prev.length - 1]
        const push = (line: string) => {
          if (last === line || prev.includes(line) || now - lastLineAt.current < LINE_GAP_MS) return prev
          lastLineAt.current = now
          return [...prev, line]
        }

        if (has) {
          // content is the payoff — schedule the close, no more narration
          closeAt.current ??= now + CLOSE_AFTER_CONTENT_MS
          return prev
        }
        if (phase === 'checking') return prev // first line already covers it
        if (p > 0) return push('someone’s here, catching up…')
        if (st === 'connected') {
          const announced = prev.includes('connected — nobody else here')
          if (!announced) {
            emptySince.current = now
            return push('connected — nobody else here')
          }
          if (emptySince.current !== null && now - emptySince.current > EMPTY_VERDICT_MS) {
            const next = push('this room really is empty')
            if (next !== prev) closeAt.current = now + CLOSE_AFTER_EMPTY_MS
            return next
          }
          return prev
        }
        if (st === 'offline') return push('relay unreachable — will keep trying')
        return prev
      })

      if (closeAt.current !== null && now >= closeAt.current) onDone()
    }, 200)
    return () => clearInterval(tick)
  }, [onDone])

  return (
    <div className="arrival" onClick={onDone} role="status">
      <div className="arrivalLines">
        {lines.map((l) => (
          <div key={l} className="arrivalLine">
            {l}
          </div>
        ))}
        <span className="arrivalCursor" />
      </div>
      <div className="arrivalSkip">tap to skip</div>
    </div>
  )
}

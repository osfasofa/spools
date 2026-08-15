import { useEffect, useRef, useState } from 'react'
import type { Spool } from 'spools'

/**
 * Presence (T-119): everything rides the sealed awareness payload
 * (`room: { seat, typing? }`), keyed to awareness states — never `synced`
 * (empty-room trap), never the doc (ghost presence is a named refusal; zero
 * document bytes by construction).
 *
 * T-111 numbers, applied here: typing is transitions-only (true on the first
 * keystroke, cleared after 3 s idle or on send — never per keystroke), and
 * when a previously-unknown client appears we re-touch our own state so
 * latecomers converge in ~RTT instead of a 15 s heartbeat.
 */

export interface SeatPresence {
  online: boolean
  typing: boolean
}

const TYPING_IDLE_MS = 3_000

export const usePresence = (spool: Spool | null, mySeat: string) => {
  const [presence, setPresence] = useState<Map<string, SeatPresence>>(new Map())
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingActive = useRef(false)

  useEffect(() => {
    const aw = spool?.awareness
    if (!aw || !spool) return
    const myClient = spool.doc.clientID

    const read = () => {
      const next = new Map<string, SeatPresence>()
      for (const [cid, st] of aw.getStates()) {
        const r = (st as { room?: { seat?: unknown; typing?: unknown } }).room
        if (!r || typeof r.seat !== 'string' || r.seat === '') continue
        const cur = next.get(r.seat) ?? { online: true, typing: false }
        // several clients can share a seat (two tabs); typing from any of
        // them counts, but never our own client's echo
        if (r.typing === true && cid !== myClient) cur.typing = true
        next.set(r.seat, cur)
      }
      setPresence(next)
    }

    let known = new Set<number>(aw.getStates().keys())
    const onChange = ({ added }: { added: number[] }) => {
      read()
      // the T-111 nudge: a brand-new client just joined — re-broadcast our
      // state so they see us now, not at the next heartbeat
      if (added.some((id) => !known.has(id) && id !== myClient)) {
        const current = (aw.getLocalState() as { room?: object })?.room ?? { seat: mySeat }
        aw.setLocalStateField('room', current)
      }
      known = new Set(aw.getStates().keys())
    }

    aw.setLocalStateField('room', { seat: mySeat })
    aw.on('change', onChange)
    read()

    // clean tab close: drop instantly rather than haunting for 30 s.
    // leave() already broadcasts removal (T-111: 51 ms); pagehide covers the
    // close-the-tab path where React never unmounts.
    const onPageHide = () => aw.setLocalState(null)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.removeEventListener('pagehide', onPageHide)
      aw.off('change', onChange)
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [spool, mySeat])

  /** call on every composer keystroke — broadcasts only the transitions */
  const onTyping = () => {
    const aw = spool?.awareness
    if (!aw) return
    if (!typingActive.current) {
      typingActive.current = true
      aw.setLocalStateField('room', { seat: mySeat, typing: true })
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      typingActive.current = false
      aw.setLocalStateField('room', { seat: mySeat })
    }, TYPING_IDLE_MS)
  }

  /** call on send — the message itself says everything typing was saying */
  const clearTyping = () => {
    const aw = spool?.awareness
    if (!aw) return
    if (typingTimer.current) clearTimeout(typingTimer.current)
    if (typingActive.current) {
      typingActive.current = false
      aw.setLocalStateField('room', { seat: mySeat })
    }
  }

  return { presence, onTyping, clearTyping }
}

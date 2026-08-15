import { useEffect, useRef, useState } from 'react'
import type { Spool } from 'spools'

/**
 * Presence (T-119) + ephemeral read receipts (T-121, the D4 decision):
 * everything rides the sealed awareness payload
 * (`room: { seat, typing?, read? }`), keyed to awareness states — never
 * `synced` (empty-room trap), never the doc (ghost presence is a named
 * refusal; zero document bytes by construction). "Seen" therefore dies with
 * the tab — the amended D3, said out loud in settings.
 *
 * T-111 numbers, applied: typing is transitions-only (true on the first
 * keystroke, cleared after 3 s idle or on send); read markers move only when
 * the *furthest-seen message* changes, throttled to one broadcast per 2 s —
 * never on scroll ticks. When a previously-unknown client appears we
 * re-touch our own state so latecomers converge in ~RTT.
 */

export interface SeatPresence {
  online: boolean
  typing: boolean
  /** entry id of the furthest message this seat has seen (ephemeral) */
  read: string | null
}

const TYPING_IDLE_MS = 3_000
const READ_GAP_MS = 2_000

export const usePresence = (spool: Spool | null, mySeat: string) => {
  const [presence, setPresence] = useState<Map<string, SeatPresence>>(new Map())
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const readTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastReadSent = useRef(0)
  /** the single source for our own payload — typing and read never clobber each other */
  const fields = useRef<{ seat: string; typing?: boolean; read?: string }>({ seat: mySeat })

  const broadcast = () => {
    const aw = spool?.awareness
    if (aw) aw.setLocalStateField('room', { ...fields.current })
  }

  useEffect(() => {
    const aw = spool?.awareness
    if (!aw || !spool) return
    const myClient = spool.doc.clientID

    const read = () => {
      const next = new Map<string, SeatPresence>()
      for (const [cid, st] of aw.getStates()) {
        const r = (st as { room?: { seat?: unknown; typing?: unknown; read?: unknown } }).room
        if (!r || typeof r.seat !== 'string' || r.seat === '') continue
        const cur = next.get(r.seat) ?? { online: true, typing: false, read: null }
        // several clients can share a seat (two tabs); typing from any of
        // them counts, but never our own client's echo
        if (r.typing === true && cid !== myClient) cur.typing = true
        if (typeof r.read === 'string' && r.read !== '') cur.read = r.read
        next.set(r.seat, cur)
      }
      setPresence(next)
    }

    let known = new Set<number>(aw.getStates().keys())
    const onChange = ({ added }: { added: number[] }) => {
      read()
      // the T-111 nudge: a brand-new client just joined — re-broadcast our
      // state so they see us now, not at the next heartbeat
      if (added.some((id) => !known.has(id) && id !== myClient)) broadcast()
      known = new Set(aw.getStates().keys())
    }

    fields.current = { seat: mySeat }
    broadcast()
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
      if (readTimer.current) clearTimeout(readTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spool, mySeat])

  /** call on every composer keystroke — broadcasts only the transitions */
  const onTyping = () => {
    if (!spool?.awareness) return
    if (fields.current.typing !== true) {
      fields.current = { ...fields.current, typing: true }
      broadcast()
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      const { typing: _typing, ...rest } = fields.current
      fields.current = rest
      broadcast()
    }, TYPING_IDLE_MS)
  }

  /** call on send — the message itself says everything typing was saying */
  const clearTyping = () => {
    if (!spool?.awareness) return
    if (typingTimer.current) clearTimeout(typingTimer.current)
    if (fields.current.typing === true) {
      const { typing: _typing, ...rest } = fields.current
      fields.current = rest
      broadcast()
    }
  }

  /**
   * The feed reports the furthest message that's actually been on screen
   * (pinned-at-bottom + visible tab). Broadcast only when it changes, at
   * most every 2 s — never on scroll ticks (T-121).
   */
  const setRead = (id: string) => {
    if (!spool?.awareness || fields.current.read === id) return
    fields.current = { ...fields.current, read: id }
    const since = Date.now() - lastReadSent.current
    if (readTimer.current) clearTimeout(readTimer.current)
    if (since >= READ_GAP_MS) {
      lastReadSent.current = Date.now()
      broadcast()
    } else {
      readTimer.current = setTimeout(() => {
        lastReadSent.current = Date.now()
        broadcast()
      }, READ_GAP_MS - since)
    }
  }

  return { presence, onTyping, clearTyping, setRead }
}

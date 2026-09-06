import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_RELAY, buildSpoolLink, generateCode, openSpool, parseSpoolLink, stash, type Spool } from 'spools'
import { encodeStateAsUpdate } from 'yjs'
import { ActionSheet } from './ActionSheet'
import { Arrival } from './Arrival'
import { drawFavicon, pageTitle } from './badge'
import { copyText } from './clipboard'
import { Composer } from './Composer'
import { MessageList, seatOf, type ParentRef, type Rec } from './MessageList'
import { normalizeEmoji, rememberEmoji } from './emoji'
import { mySeat, seatColor, seatSuffix, initialOf } from './seat'
import { nameFor, participants, profileTable, renamedByFor, type Profile } from './profiles'
import { THEMES, applyTheme, currentTheme } from './theme'
import { usePresence } from './usePresence'
import { useRoom } from './useRoom'
import {
  CUT_SENTENCE,
  FULL_IS_A_CUT,
  HOME_KIND,
  REEL_KIND,
  REEL_LENGTH_ADVISORY,
  fetchRelayCap,
  formatBytes,
  reelLength,
  selectCut,
} from './reel'

/**
 * The shell: header → notices → feed (through the <MessageList> boundary,
 * nothing else) → composer, plus the settings view. Later tickets own their
 * screens' behavior (T-117 arrival, T-118 action sheet, T-119 presence,
 * T-122 name/themes); this shell routes to them.
 */

const SEAT = typeof localStorage !== 'undefined' ? mySeat() : ''

/**
 * Where the key actually goes (T-165, review finding F6): "never sent to any
 * server" is true of spools' servers only. The address bar carries the key,
 * browsers sync their address bars, and a link travels through whatever
 * messenger carries it. Said wherever a link is copied, and in the fine print.
 */
const KEY_TRAVELS =
  'your browser may sync this address to its maker; send the link over something end-to-end encrypted, or in person.'

/**
 * One person row: live-looking input, but the profile entry winds on COMMIT
 * (blur/Enter), not per keystroke — every rename is permanent under gc:false,
 * and a keystroke-per-entry rename would spend dozens of them (D2's accepted
 * cost is "a handful of times", so the UI keeps it a handful).
 */
const PersonRow = ({
  seat,
  profile,
  renamedBy,
  isMe,
  onRename,
}: {
  seat: string
  profile: Profile | undefined
  /** the renamer's current display name (T-172), resolved by the caller from the same table */
  renamedBy: string | null
  isMe: boolean
  onRename: (name: string) => void
}) => {
  const resolved = profile?.name ?? seatSuffix(seat)
  const [draft, setDraft] = useState(resolved)
  const [editing, setEditing] = useState(false)
  // remote renames refresh the input unless the user is mid-edit
  useEffect(() => {
    if (!editing) setDraft(resolved)
  }, [resolved, editing])
  const commit = () => {
    setEditing(false)
    const name = draft.trim()
    if (name && name !== resolved) onRename(name)
    else setDraft(resolved)
  }
  return (
    <div className="personRow">
      <span className="seatTile" style={{ borderColor: seatColor(seat), color: seatColor(seat) }}>
        {initialOf(resolved)}
      </span>
      <div className="personMain">
        <input
          className="personName"
          value={draft}
          onFocus={() => setEditing(true)}
          onInput={(ev) => {
            const value = ev.currentTarget.value
            setDraft(value)
          }}
          onBlur={commit}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter') ev.currentTarget.blur()
          }}
          aria-label={`name for ${seatSuffix(seat)}`}
        />
        {renamedBy ? <span className="personAudit">renamed by {renamedBy}</span> : null}
      </div>
      <span className="personSeatId">
        {seatSuffix(seat)}
        {isMe ? ' · you' : ''}
      </span>
    </div>
  )
}

const Settings = ({
  spool,
  seats,
  profiles,
  roomName,
  namedBy,
  onRenameRoom,
  muted,
  onToggleMute,
  notifState,
  onEnableNotifications,
  notifText,
  onToggleNotifText,
  onForget,
  onNewRoom,
  tape,
  relayCap,
  reel,
  onSetReelLength,
  cutFrom,
  onBack,
}: {
  spool: Spool
  seats: string[]
  profiles: Map<string, Profile>
  roomName: string
  namedBy: string | null
  onRenameRoom: (name: string) => void
  muted: boolean
  onToggleMute: () => void
  notifState: string
  onEnableNotifications: () => void
  /** per-device: put the message text in the OS notification (T-173); default off */
  notifText: boolean
  onToggleNotifText: () => void
  /** the one hard delete, after the ceremony below has been completed (T-163) */
  onForget: () => void
  /** a fresh keyed room on the same relay, its link copied — the only remedy against a bad actor (T-164) */
  onNewRoom: () => void
  /** the tape counter (T-187): the document's bytes and the conversation's message count, measured on a debounce */
  tape: { bytes: number; messages: number } | null
  /** the relay's advertised deposit cap — the reel length in practice; null: not advertised / not reached yet */
  relayCap: number | null
  /** the room's own soft length in messages, newest `room:reel` wins, and who set it */
  reel: { messages: number; by: string } | null
  onSetReelLength: (messages: number | null) => void
  /** the code this reel was cut from, when it was */
  cutFrom: string | null
  onBack: () => void
}) => {
  const [reelDraft, setReelDraft] = useState<string>(reel ? String(reel.messages) : '')
  const commitReel = () => {
    const n = Number(reelDraft.trim())
    if (reelDraft.trim() === '') {
      if (reel) onSetReelLength(null)
      return
    }
    if (!Number.isFinite(n) || n <= 0) {
      setReelDraft(reel ? String(reel.messages) : '')
      return
    }
    if (!reel || Math.floor(n) !== reel.messages) onSetReelLength(Math.floor(n))
  }
  const overCap = tape !== null && relayCap !== null && tape.bytes > relayCap
  const overReel = tape !== null && reel !== null && tape.messages > reel.messages
  const fraction =
    tape === null ? 0 : Math.max(relayCap ? tape.bytes / relayCap : 0, reel ? tape.messages / reel.messages : 0)
  const [copied, setCopied] = useState(false)
  // T-163 keepsake: export is a plain file download; forget is the one hard
  // delete in the system and owes confirm-twice ceremony (stash docstring) —
  // step 1 says what it does, step 2 has you type the room code
  const [exported, setExported] = useState(false)
  const [forgetStep, setForgetStep] = useState<0 | 1 | 2>(0)
  const [forgetTyped, setForgetTyped] = useState('')
  const exportRoom = () => {
    const blob = new Blob([spool.export()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${spool.code}.spool.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    setExported(true)
    setTimeout(() => setExported(false), 1600)
  }
  const keepIt = () => {
    setForgetStep(0)
    setForgetTyped('')
  }
  const [nameDraft, setNameDraft] = useState(roomName)
  const [nameEditing, setNameEditing] = useState(false)
  useEffect(() => {
    if (!nameEditing) setNameDraft(roomName)
  }, [roomName, nameEditing])
  // per-device theme — the T-090 stash-label precedent: a theme is your
  // handwriting; it syncs nothing (owner-approved cut)
  const [theme, setTheme] = useState(currentTheme)
  const link = spool.share()
  // T-176: no Clipboard API (plain http on a LAN) → execCommand; no copy at
  // all → show the whole link, pre-selected, with a long-press hint
  const [copyHint, setCopyHint] = useState(false)
  const fullLinkRef = useRef<HTMLSpanElement>(null)
  const copy = () => {
    void copyText(link).then((ok) => {
      if (ok) {
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      } else {
        setCopyHint(true)
      }
    })
  }
  useEffect(() => {
    if (!copyHint || !fullLinkRef.current) return
    const range = document.createRange()
    range.selectNodeContents(fullLinkRef.current)
    const selection = getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [copyHint])
  return (
    <div className="screen">
      <header className="header">
        <button className="headerBtn" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <div className="headerTitle">settings</div>
        <span className="headerBtn" />
      </header>
      <div className="settingsBody">
        <section className="settingsSection">
          <div className="sectionLabel">name</div>
          <input
            className="roomNameInput"
            value={nameDraft}
            placeholder="room"
            onFocus={() => setNameEditing(true)}
            onInput={(ev) => {
              const value = ev.currentTarget.value
              setNameDraft(value)
            }}
            onBlur={() => {
              setNameEditing(false)
              const name = nameDraft.trim()
              if (name && name !== roomName) onRenameRoom(name)
              else setNameDraft(roomName)
            }}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') ev.currentTarget.blur()
            }}
            aria-label="Room name"
          />
          <div className="caption">{namedBy ? `named by ${namedBy} · ` : ''}anyone can rename it</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">theme</div>
          <div className="themeGrid">
            {Object.entries(THEMES).map(([name, t]) => (
              <button
                key={name}
                className={`themeCard ${theme === name ? 'active' : ''}`}
                style={{ background: t.bg, color: t.tx }}
                onClick={() => {
                  applyTheme(name)
                  setTheme(name)
                }}
              >
                <span className="themeDots">
                  <span style={{ background: t.ac }} />
                  <span style={{ background: t.tx }} />
                  <span style={{ background: t.dim }} />
                </span>
                {name}
              </button>
            ))}
          </div>
          <div className="caption">yours only — themes don't sync</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">people</div>
          {seats.map((seat) => {
            const profile = profiles.get(seat)
            return (
              <PersonRow
                key={seat}
                seat={seat}
                profile={profile}
                renamedBy={profile ? renamedByFor(profiles, profile) : null}
                isMe={seat === SEAT}
                onRename={(name) =>
                  // target seat + the renamer's seat (T-172): the audit trail
                  // resolves to a person, and follows that person's renames
                  void spool.wind({ kind: 'room:profile', body: name, data: { seat, by: SEAT } })
                }
              />
            )
          })}
          <div className="caption">anyone can rename anyone — it applies everywhere</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">notifications</div>
          {notifState === 'granted' ? (
            <div className="caption">enabled while a tab is open</div>
          ) : notifState === 'denied' ? (
            <div className="caption">blocked by the browser — change it in site settings</div>
          ) : notifState === 'unsupported' ? (
            <div className="caption">not supported here</div>
          ) : (
            <button className="copyBtn" onClick={onEnableNotifications}>
              enable notifications
            </button>
          )}
          <button className="copyBtn" onClick={onToggleMute}>
            {muted ? 'unmute this device' : 'mute this device'}
          </button>
          <button className="copyBtn notifTextToggle" onClick={onToggleNotifText} aria-pressed={notifText}>
            {notifText ? '✓ ' : ''}show message text in notifications
          </button>
          <div className="caption">notifications go through your OS and may be kept in its history.</div>
          <div className="caption">
            this room can only reach you while it's open somewhere — there is no server to call you
            back.
          </div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">link</div>
          <div className="linkRow">
            <span className="linkText">{link}</span>
            <button className="copyBtn" onClick={copy}>
              {copied ? 'copied ✓' : 'copy'}
            </button>
          </div>
          {copyHint ? (
            <div className="caption">
              copy didn't work here — long-press or select the link to copy it.
              <span className="linkFull" ref={fullLinkRef}>
                {link}
              </span>
            </div>
          ) : null}
          <div className="caption">the link is the key — share it with people you trust</div>
          <div className="caption keyTravels">{KEY_TRAVELS}</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">new room</div>
          <button className="copyBtn" onClick={onNewRoom}>
            start a new room
          </button>
          <div className="caption">
            a fresh room with a fresh key, its link copied. this room stays on this device — export or
            forget it below.
          </div>
        </section>
        <section className="settingsSection tape">
          <div className="sectionLabel">the reel</div>
          <div className="tapeLine">
            {tape === null
              ? 'measuring…'
              : `${formatBytes(tape.bytes)}${relayCap !== null ? ` of ${formatBytes(relayCap)}` : ''} · ${tape.messages.toLocaleString()} message${tape.messages === 1 ? '' : 's'}${reel ? ` of ${reel.messages.toLocaleString()}` : ''}`}
          </div>
          <div className="tapeBar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(fraction * 100))}>
            <div className={`tapeFill ${overCap || overReel ? 'over' : ''}`} style={{ width: `${Math.min(100, fraction * 100)}%` }} />
          </div>
          <div className="caption">
            {relayCap !== null
              ? `the relay this link names carries at most ${formatBytes(relayCap)} per copy — that is how long a reel can be here. `
              : 'this relay advertises no cap, so only its people know how long a reel can be here. '}
            {FULL_IS_A_CUT}
          </div>
          {cutFrom ? <div className="caption mono">cut from {cutFrom}</div> : null}
          <label className="caption" htmlFor="reelLength">
            reel length, in messages{reel ? ` — set by ${reel.by}` : ''}
          </label>
          <input
            id="reelLength"
            className="reelInput"
            inputMode="numeric"
            placeholder="no custom"
            value={reelDraft}
            onChange={(ev) => setReelDraft(ev.currentTarget.value)}
            onBlur={commitReel}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') ev.currentTarget.blur()
            }}
          />
          <div className="caption">{REEL_LENGTH_ADVISORY}</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">keepsake</div>
          <button className="copyBtn" onClick={exportRoom}>
            {exported ? 'exported ✓' : 'export this room'}
          </button>
          <div className="caption">
            everything here, as a file you can read without any software. the key is never in the file.
          </div>
          {forgetStep === 0 ? (
            <button className="copyBtn" onClick={() => setForgetStep(1)}>
              forget this room on this device
            </button>
          ) : (
            <div className="confirmCard">
              <div>
                gone from this device only — everyone else keeps their copy, and the relay's pocket keeps
                sealed copies for up to 60 days.
              </div>
              {forgetStep === 1 ? (
                <div className="keepsakeRow">
                  <button className="copyBtn" onClick={() => setForgetStep(2)}>
                    yes, forget it
                  </button>
                  <button className="copyBtn" onClick={keepIt}>
                    keep it
                  </button>
                </div>
              ) : (
                <>
                  <label className="caption" htmlFor="forgetCode">
                    type the room code to confirm: <span className="mono">{spool.code}</span>
                  </label>
                  <input
                    id="forgetCode"
                    className="codeInput"
                    value={forgetTyped}
                    placeholder={spool.code}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    onInput={(ev) => {
                      const value = ev.currentTarget.value
                      setForgetTyped(value)
                    }}
                  />
                  <div className="keepsakeRow">
                    <button
                      className="copyBtn forgetBtn"
                      disabled={forgetTyped.trim() !== spool.code}
                      onClick={onForget}
                    >
                      forget
                    </button>
                    <button className="copyBtn" onClick={keepIt}>
                      keep it
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">fine print</div>
          <div className="finePrint">
            anyone with the link can edit or delete anything. no push, no server that knows you. rewind
            never forgets. "seen" is live-only — nobody learns what you read while they were away. what
            you put here is kept by everyone in the room, for as long as they keep it. there is no way to
            remove someone. make a new room and hand the new link only to the people you want. {KEY_TRAVELS}
          </div>
        </section>
      </div>
    </div>
  )
}

export const App = () => {
  const [author] = useState(() => localStorage.getItem('spool-author') || 'anonymous')
  const { spool, entries, status, undecryptable, pocket, peers, openedEmpty, roomFull, fullReason, error } = useRoom(author)
  const [view, setView] = useState<'room' | 'settings'>('room')

  // the arrival overlay runs exactly once, and only when the room opened
  // with no local entries — a reopen has its content instantly and needs no
  // narration (T-117)
  const [arrival, setArrival] = useState<'unknown' | 'active' | 'done'>('unknown')
  useEffect(() => {
    if (spool && arrival === 'unknown') setArrival(openedEmpty ? 'active' : 'done')
  }, [spool, arrival, openedEmpty])

  // non-blocking naming: join instantly as an unnamed seat; the prompt is a
  // dismissible line, never a gate (§1: no onboarding)
  const [namePromptDismissed, setNamePromptDismissed] = useState(
    () => localStorage.getItem('room-nameprompt-dismissed') === '1'
  )
  const dismissNamePrompt = () => {
    localStorage.setItem('room-nameprompt-dismissed', '1')
    setNamePromptDismissed(true)
  }

  // T-187: the cut. A message's action sheet offers "start a new reel from
  // here"; the confirm line carries the sentence; the tap on "cut" mints the
  // link and copies it synchronously (T-164's Safari lesson), then the new
  // reel is opened *in this page* long enough to splice the selection and
  // leave — persistence writes it to this device and leave() deposits it to
  // the pocket — and the fragment change opens it as any room. The one
  // deviation from T-164's "no second Spool ever lives in this page": a
  // second one lives for about a second, and is left before navigation.
  const [cutFrom, setCutFrom] = useState<Rec | null>(null)
  const [cutState, setCutState] = useState<{ phase: 'idle' } | { phase: 'working' } | { phase: 'failed'; message: string }>({
    phase: 'idle',
  })
  const startNewReel = (from: Rec) => {
    if (!spool) return
    const relay = parseSpoolLink(spool.share()).relay ?? DEFAULT_RELAY
    const link = buildSpoolLink({ code: generateCode(), relay, key: crypto.getRandomValues(new Uint8Array(32)) })
    const copying = copyText(link) // synchronous first step, inside the tap (T-176)
    setCutState({ phase: 'working' })
    void (async () => {
      const selection = selectCut(spool.entries, from.id)
      if (!selection) throw new Error('that message is no longer in the room')
      const reel = await openSpool(link, { author })
      try {
        reel.splice(selection.records)
        // where this reel came from — code and relay, never the key (the
        // pointer must not hand the key; the old reel's people already hold it)
        reel.wind({ kind: HOME_KIND, data: { code: spool.code, relay, seat: SEAT } })
      } finally {
        await reel.leave() // closes this page's copy; deposits to the pocket; the database stays
      }
      const copied = await copying
      try {
        sessionStorage.setItem(
          'room-came-from',
          JSON.stringify({ code: spool.code, copied, cut: { kept: selection.kept, flattened: selection.flattened } })
        )
      } catch {
        // no sessionStorage: the arrival notice is a courtesy, not a gate
      }
      location.href = link // a fragment change — main.tsx's hashchange reload opens it
    })().catch((err: unknown) => {
      setCutState({ phase: 'failed', message: err instanceof Error ? err.message : String(err) })
    })
  }

  // the tape counter (T-187): bytes are the document's own update size, the
  // physics every transport pays; measured on a debounce because encoding a
  // 5 000-message room costs milliseconds, not microseconds
  const [tape, setTape] = useState<{ bytes: number; messages: number } | null>(null)
  useEffect(() => {
    if (!spool) return
    const measure = () =>
      setTape({
        bytes: encodeStateAsUpdate(spool.doc).byteLength,
        messages: spool.entries.filter((e) => e.kind === 'message').length,
      })
    const t = setTimeout(measure, tape === null ? 0 : 2000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spool, entries])
  // the cap comes from the relay the link names — never a constant
  const [relayCap, setRelayCap] = useState<number | null>(null)
  useEffect(() => {
    if (!spool) return
    const relay = parseSpoolLink(spool.share()).relay
    if (!relay) return
    let alive = true
    void fetchRelayCap(relay).then((cap) => {
      if (alive) setRelayCap(cap)
    })
    return () => {
      alive = false
    }
  }, [spool])

  const [inviteCopied, setInviteCopied] = useState(false)
  /** the link shown in the feed when no copy path worked (T-176) */
  const [copyFallback, setCopyFallback] = useState<string | null>(null)
  const invite = () => {
    if (!spool) return
    const link = spool.share()
    void copyText(link).then((ok) => {
      if (ok) {
        setInviteCopied(true)
        setTimeout(() => setInviteCopied(false), 4000) // long enough to read where the key goes (T-165)
      } else {
        setCopyFallback(link)
      }
    })
  }

  // T-164: the way out when someone turns bad — a new spool, handed only to
  // the people you want. The link is minted here (code + 32 random bytes,
  // same relay as this room) so the clipboard write happens synchronously
  // inside the tap — Safari refuses one after an await — and the new page's
  // ordinary openSpool(link) is what creates the room; no second Spool ever
  // lives in this page. History does not come along: that's `splice`, parked.
  const startNewRoom = () => {
    if (!spool) return
    const relay = parseSpoolLink(spool.share()).relay ?? DEFAULT_RELAY
    const link = buildSpoolLink({ code: generateCode(), relay, key: crypto.getRandomValues(new Uint8Array(32)) })
    const go = (copied: boolean) => {
      try {
        sessionStorage.setItem('room-came-from', JSON.stringify({ code: spool.code, copied }))
      } catch {
        // no sessionStorage: the arrival notice is a courtesy, not a gate
      }
      location.href = link // a fragment change — main.tsx's hashchange reload opens it
    }
    void copyText(link).then(go) // synchronous first step, inside the tap (T-176)
  }
  // …and the arrival on the other side: one notice, consumed on read so a
  // reload never repeats it
  const [cameFrom, setCameFrom] = useState<{
    code: string
    copied: boolean
    cut: { kept: number; flattened: number } | null
  } | null>(() => {
    try {
      const raw = sessionStorage.getItem('room-came-from')
      if (!raw) return null
      sessionStorage.removeItem('room-came-from')
      const parsed = JSON.parse(raw) as { code?: unknown; copied?: unknown; cut?: { kept?: unknown; flattened?: unknown } }
      const cut =
        parsed.cut && typeof parsed.cut.kept === 'number' && typeof parsed.cut.flattened === 'number'
          ? { kept: parsed.cut.kept, flattened: parsed.cut.flattened }
          : null
      return typeof parsed.code === 'string' ? { code: parsed.code, copied: parsed.copied === true, cut } : null
    } catch {
      return null
    }
  })

  // T-162: the first hide on this device gets one honest line — a hide is a
  // soft delete that lands everywhere, but every copy keeps the message and
  // rewind still shows it (MANIFESTO §2: no delete that doesn't delete)
  const [hideExplained, setHideExplained] = useState(false)
  const explainHideOnce = () => {
    if (localStorage.getItem('room-hide-explained') === '1') return
    localStorage.setItem('room-hide-explained', '1')
    setHideExplained(true)
  }

  // T-118: the two social gestures — both pure parent mechanics
  const [sheetFor, setSheetFor] = useState<Rec | null>(null)
  const [replyTo, setReplyTo] = useState<Rec | null>(null)
  // T-120: edit rewrites the entry BODY (bodies are mutable, metadata
  // write-once); delete is soft; the honest contract lives in settings
  const [editTarget, setEditTarget] = useState<Rec | null>(null)

  const deletedRecords = useMemo(() => (spool ? (spool.deleted as Rec[]) : []), [spool, entries])

  // "· edited" comes from room:edit marker entries (parent = the message) —
  // nothing else in the model can say a body changed, and the marker's seat
  // is the free audit trail ("edited by —")
  const editedIndex = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of entries) {
      if (e.kind === 'room:edit' && typeof e.parent === 'string') m.set(e.parent, seatOf(e))
    }
    return m
  }, [entries])
  const editedBy = (id: string): string | null => {
    const seat = editedIndex.get(id)
    return seat ? resolveName(seat) : null
  }

  const toggleReaction = (parentId: string, emojiRaw: string) => {
    if (!spool) return
    const norm = normalizeEmoji(emojiRaw)
    if (!norm) return
    rememberEmoji(emojiRaw)
    // my existing reaction found by SEAT (not author) + normalized emoji;
    // soft delete = un-react, and the getters already exclude the deleted
    const existing = spool.entries.find(
      (e) =>
        e.kind === 'reaction' &&
        e.parent === parentId &&
        seatOf(e) === SEAT &&
        normalizeEmoji(e.body) === norm
    )
    if (existing) existing.delete()
    else spool.wind({ kind: 'reaction', parent: parentId, body: emojiRaw, data: { seat: SEAT } })
  }

  // reply parents resolve structurally by id — live entries, then the
  // soft-deleted (tombstone-aware), then "not synced yet" (T-116's rule:
  // a reply can sort before its parent, so absence is a state, not an error)
  const parentIndex = useMemo(() => {
    if (!spool) return { live: new Map<string, Rec>(), deleted: new Set<string>() }
    const live = new Map<string, Rec>()
    for (const e of entries) live.set(e.id, e)
    const deleted = new Set<string>(spool.deleted.map((e) => e.id))
    return { live, deleted }
  }, [spool, entries])
  const resolveParent = (id: string): ParentRef => {
    const rec = parentIndex.live.get(id)
    if (rec) return { kind: 'ok', seat: seatOf(rec), body: rec.body }
    return parentIndex.deleted.has(id) ? { kind: 'hidden' } : { kind: 'missing' }
  }

  const myReactionsOn = (rec: Rec): Set<string> => {
    const out = new Set<string>()
    for (const e of entries) {
      if (e.kind === 'reaction' && e.parent === rec.id && seatOf(e) === SEAT) out.add(normalizeEmoji(e.body))
    }
    return out
  }

  // the profile table, recomputed behind the same feed subscription — names
  // resolve at render time, so renames apply retroactively by construction
  const profiles = useMemo(() => profileTable(entries), [entries])
  const seats = useMemo(() => participants(entries, SEAT), [entries])
  const resolveName = (seat: string) => nameFor(profiles, seat)

  // the reel's own soft length (T-187): newest `room:reel` wins, like the
  // room name; the setter's seat resolves through the profile table
  const reelCustom = useMemo(() => {
    const r = reelLength(entries)
    return r ? { messages: r.messages, by: r.seat ? resolveName(r.seat) : 'someone' } : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])
  const homeCode = useMemo(() => {
    let code: string | null = null
    for (const e of entries) if (e.kind === HOME_KIND && typeof e.data?.code === 'string') code = e.data.code
    return code
  }, [entries])

  // the shared room name (T-122): newest room:name entry wins; the entry's
  // seat is the free audit trail
  const roomNameRec = useMemo(() => {
    let latest: Rec | null = null
    for (const e of entries) if (e.kind === 'room:name' && e.body.trim()) latest = e
    return latest
  }, [entries])
  const roomName = roomNameRec?.body.trim() ?? ''

  // T-123: unread. The durable last-seen is LOCAL-only (localStorage) — the
  // shared read cursor is ephemeral by decision (D4), and unread must
  // survive a reload. Captured once at open for the divider; advanced by the
  // same onSeen signal that feeds the awareness marker.
  const seenKey = spool ? `room-seen:${spool.code}` : null
  const unreadAfter = useMemo(() => {
    if (!seenKey) return null
    const raw = localStorage.getItem(seenKey)
    return raw ? Number(raw) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenKey])
  const [unread, setUnread] = useState(0)
  const [muted, setMuted] = useState(() => localStorage.getItem('room-muted') === '1')
  const [notifState, setNotifState] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  // T-173: a notification carries the sender's name, not the message —
  // macOS and Android keep notification history and some of it syncs — unless
  // this device opted in. Per-device, like mute.
  const [notifText, setNotifText] = useState(() => localStorage.getItem('room-notif-text') === '1')
  const seenMsgCount = useRef<number | null>(null)
  useEffect(() => {
    const others = entries.filter((e) => e.kind === 'message' && seatOf(e) !== SEAT)
    if (seenMsgCount.current === null) {
      seenMsgCount.current = others.length // opening backlog is the divider's job, not the badge's
      return
    }
    const fresh = others.length - seenMsgCount.current
    seenMsgCount.current = others.length
    if (fresh <= 0 || document.visibilityState === 'visible') return
    setUnread((n) => n + fresh)
    const latest = others[others.length - 1]
    if (!muted && notifState === 'granted' && latest) {
      // tag collapses the pile into one — this is a nudge, not a feed. The
      // body is the name alone unless this device opted into the text (T-173)
      const name = nameFor(profileTable(entries), seatOf(latest))
      new Notification(roomName || 'a room', {
        body: notifText ? `${name}: ${latest.body.slice(0, 80)}` : `${name} said something`,
        tag: `room-${spool?.code ?? ''}`,
      })
    }
  }, [entries, muted, notifState, notifText, roomName, spool])
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setUnread(0)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])
  useEffect(() => {
    document.title = pageTitle(roomName, unread)
    drawFavicon(unread)
  }, [roomName, unread])

  // T-125: batched screen-reader announcements — one polite line per burst,
  // never a narration of every peer keystroke
  const [announcement, setAnnouncement] = useState('')
  const announceCount = useRef<number | null>(null)
  const announcePending = useRef<{ n: number; latest: string } | null>(null)
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const others = entries.filter((e) => e.kind === 'message' && seatOf(e) !== SEAT)
    if (announceCount.current === null) {
      announceCount.current = others.length
      return
    }
    const fresh = others.length - announceCount.current
    announceCount.current = others.length
    if (fresh <= 0) return
    const latest = others[others.length - 1]
    const cur = announcePending.current ?? { n: 0, latest: '' }
    announcePending.current = {
      n: cur.n + fresh,
      latest: `${resolveName(seatOf(latest))}: ${latest.body.slice(0, 60)}`,
    }
    if (announceTimer.current) clearTimeout(announceTimer.current)
    announceTimer.current = setTimeout(() => {
      const p = announcePending.current
      announcePending.current = null
      if (p) setAnnouncement(p.n === 1 ? p.latest : `${p.n} new messages — latest, ${p.latest}`)
    }, 1_500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])

  // presence (T-119) + ephemeral read receipts (T-121): sealed awareness,
  // zero doc bytes, ghosts expire ≤30 s, "seen" dies with the tab (D3 amended)
  const { presence, onTyping, clearTyping, setRead } = usePresence(spool, SEAT)
  const readMarkers = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const [seat, p] of presence) {
      if (seat === SEAT || !p.read) continue
      const list = m.get(p.read) ?? []
      list.push(seat)
      m.set(p.read, list)
    }
    return m
  }, [presence])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const typingSeats = useMemo(
    () => [...presence].filter(([seat, p]) => p.typing && seat !== SEAT).map(([seat]) => seat),
    [presence]
  )
  /** everyone the room knows of: seats that ever wrote, plus awareness-only arrivals */
  const drawerSeats = useMemo(() => {
    const out = [...seats]
    for (const seat of presence.keys()) if (!out.includes(seat)) out.push(seat)
    return out
  }, [seats, presence])

  // the pocket beat (T-104 idiom): a breath of "checking…", a brief note when
  // sealed copies land, and a persistent warning when depositing latched off —
  // the 413 latch is silent otherwise and the room degrades to live-only
  const [pocketFlash, setPocketFlash] = useState(false)
  useEffect(() => {
    if (pocket?.phase !== 'applied') return
    setPocketFlash(true)
    const t = setTimeout(() => setPocketFlash(false), 4000)
    return () => clearTimeout(t)
  }, [pocket?.phase])

  // T-163: forget. useRoom owns the spool's lifetime and leave() is
  // idempotent end to end (engine #left guard; history/pocket/store destroys
  // are re-entrant), so leaving here and letting the page go is safe: a
  // navigation never unmounts React, and a second leave() would be a no-op
  // anyway. Order: leave() closes the database (forget rejects while it's
  // open) → the one hard delete → the room-local key → the bare URL, on the
  // same relay when it isn't the default. `spool-seat` is never touched.
  const [forgetState, setForgetState] = useState<
    { phase: 'idle' } | { phase: 'working' } | { phase: 'failed'; message: string }
  >({ phase: 'idle' })
  const forgetRoom = async () => {
    if (!spool) return
    const code = spool.code
    const relay = parseSpoolLink(spool.share()).relay
    setForgetState({ phase: 'working' })
    try {
      await spool.leave()
      // the closing connection can still trip deleteDatabase's `blocked` for a
      // beat after close() — retry briefly before calling it another tab's
      let lastErr: unknown = null
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          await stash.forget(code)
          lastErr = null
          break
        } catch (err) {
          lastErr = err
          await new Promise((r) => setTimeout(r, 250))
        }
      }
      if (lastErr !== null) throw lastErr
      localStorage.removeItem(`room-seen:${code}`)
      const bare = location.origin + location.pathname
      location.replace(relay && relay !== DEFAULT_RELAY ? `${bare}#relay=${encodeURIComponent(relay)}` : bare)
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      setForgetState({
        phase: 'failed',
        message: /still open/.test(raw)
          ? 'this room is still open in another tab on this device — close it and try again.'
          : raw,
      })
    }
  }

  if (error) {
    return (
      <div className="screen">
        <div className="errorCard">
          <h2>this room wouldn't open</h2>
          <p>{error}</p>
          <p className="caption">check the link you were handed — same link, same key, that's the contract.</p>
        </div>
      </div>
    )
  }
  if (!spool) return <div className="screen loading">opening the room…</div>
  if (forgetState.phase === 'working')
    return <div className="screen loading">forgetting this room on this device…</div>
  if (forgetState.phase === 'failed')
    return (
      <div className="screen">
        <div className="errorCard">
          <h2>couldn't forget this room</h2>
          <p>{forgetState.message}</p>
          <p className="caption">nothing was deleted. reopen the room and try again.</p>
          <button className="copyBtn" onClick={() => location.reload()}>
            reopen the room
          </button>
        </div>
      </div>
    )

  if (view === 'settings')
    return (
      <Settings
        spool={spool}
        seats={seats}
        profiles={profiles}
        roomName={roomName}
        namedBy={roomNameRec ? resolveName(seatOf(roomNameRec)) : null}
        onRenameRoom={(name) => void spool.wind({ kind: 'room:name', body: name, data: { seat: SEAT } })}
        muted={muted}
        onToggleMute={() => {
          const next = !muted
          localStorage.setItem('room-muted', next ? '1' : '0')
          setMuted(next)
        }}
        notifState={notifState}
        onEnableNotifications={() => {
          // a button, never an ambush — permission is asked only here
          void Notification.requestPermission().then(setNotifState)
        }}
        notifText={notifText}
        onToggleNotifText={() => {
          const next = !notifText
          localStorage.setItem('room-notif-text', next ? '1' : '0')
          setNotifText(next)
        }}
        onForget={() => void forgetRoom()}
        onNewRoom={startNewRoom}
        tape={tape}
        relayCap={relayCap}
        reel={reelCustom}
        onSetReelLength={(n) => void spool.wind({ kind: REEL_KIND, body: n === null ? '' : String(n), data: { seat: SEAT } })}
        cutFrom={homeCode}
        onBack={() => setView('room')}
      />
    )

  return (
    <div className="screen">
      <header className="header">
        <span className="headerBtn" />
        <button className="headerTitle asButton" onClick={() => setView('settings')}>
          {roomName || 'room'}
        </button>
        <button className="headerBtn" onClick={() => setView('settings')} aria-label="Settings">
          ⋯
        </button>
      </header>
      <button className="presenceLine" onClick={() => setDrawerOpen((o) => !o)}>
        <span className={`statusDot ${status}`} />
        {presence.size > 0 ? `${presence.size} here` : status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting…' : 'offline'}
        {' ▼'}
      </button>
      {drawerOpen ? (
        <div className="peopleDrawer" onClick={() => setDrawerOpen(false)}>
          {drawerSeats.map((seat) => {
            const p = presence.get(seat)
            return (
              <div key={seat} className={`personTile ${p ? '' : 'offline'}`}>
                <span className="personTileBox">
                  <span
                    className="seatTile big"
                    style={{ borderColor: seatColor(seat), color: seatColor(seat) }}
                  >
                    {initialOf(resolveName(seat))}
                  </span>
                  {p ? <span className="onlineDot" /> : null}
                </span>
                <span className="personTileName">{p?.typing ? 'typing…' : resolveName(seat)}</span>
              </div>
            )
          })}
        </div>
      ) : null}

      {roomFull ? (
        // the relay said no (1013), and the SDK stands back ~30 s between
        // tries instead of spinning (T-169). Rendered from the getter, so the
        // line clears itself the moment a connection is accepted
        <div className="notice warn roomFull" role="status">
          {fullReason?.includes('address')
            ? 'too many tabs from this address — the relay caps what one address can hold in a room. Close one, and this tab tries again on its own (about every half minute).'
            : 'this room is full — the relay holds 64 connections per room and every one is taken. When someone leaves, this tab tries again on its own (about every half minute).'}
        </div>
      ) : null}
      {undecryptable > 0 ? (
        <div className="notice warn">
          someone in this room isn't on your key — {undecryptable} frame
          {undecryptable === 1 ? '' : 's'} ignored.
        </div>
      ) : null}
      {pocket?.phase === 'checking' ? <div className="notice">checking the pocket…</div> : null}
      {pocketFlash && pocket?.phase === 'applied' ? (
        <div className="notice">
          ⤵ {pocket.applied} sealed cop{pocket.applied === 1 ? 'y' : 'ies'} from the pocket
          {pocket.dropped ? ` (${pocket.dropped} dropped — not on your key)` : ''}
        </div>
      ) : null}
      {pocket?.depositError ? (
        <div className="notice warn">
          {pocket.depositError === 'too-big'
            ? `this room has outgrown the relay's pocket — syncing live-only now. ${FULL_IS_A_CUT}`
            : "the relay's pocket is full — syncing live-only now."}
        </div>
      ) : null}

      <div className="visuallyHidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <MessageList
        records={entries}
        mySeat={SEAT}
        resolveName={resolveName}
        onInvite={invite}
        onBubbleTap={(rec) => setSheetFor(rec)}
        onToggleReaction={toggleReaction}
        resolveParent={resolveParent}
        typingSeats={typingSeats}
        deletedRecords={deletedRecords}
        editedBy={editedBy}
        onSeen={(id) => {
          setRead(id) // the ephemeral shared marker (T-121)
          if (seenKey) {
            // …and the durable local last-seen (T-123)
            const rec = entries.find((e) => e.id === id)
            if (rec) {
              const prev = Number(localStorage.getItem(seenKey) ?? 0)
              if (rec.createdAt > prev) localStorage.setItem(seenKey, String(rec.createdAt))
            }
          }
        }}
        readMarkers={readMarkers}
        unreadAfter={unreadAfter}
      />
      {inviteCopied ? (
        <div className="notice linkCopied">link copied — hand it to someone you trust. {KEY_TRAVELS}</div>
      ) : null}
      {copyFallback ? (
        <div className="noticeRow copyFallback">
          <div className="notice">
            copy didn't work here — long-press or select the link to copy it.
            <span className="linkFull">{copyFallback}</span>
            {KEY_TRAVELS}
          </div>
          <button className="noticeClose" onClick={() => setCopyFallback(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ) : null}
      {cutFrom ? (
        <div className="noticeRow cutConfirm">
          <div className="notice">
            {cutState.phase === 'working'
              ? 'cutting a new reel…'
              : cutState.phase === 'failed'
                ? `couldn't cut: ${cutState.message}. nothing changed.`
                : `${CUT_SENTENCE} ${KEY_TRAVELS}`}
            {cutState.phase !== 'working' ? (
              <div className="noticeActions">
                <button className="copyBtn" onClick={() => startNewReel(cutFrom)}>
                  cut
                </button>
                <button
                  className="copyBtn"
                  onClick={() => {
                    setCutFrom(null)
                    setCutState({ phase: 'idle' })
                  }}
                >
                  keep going
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {cameFrom ? (
        <div className="noticeRow cameFrom">
          <div className="notice">
            {cameFrom.cut
              ? `a new reel: ${cameFrom.cut.kept.toLocaleString()} message${cameFrom.cut.kept === 1 ? '' : 's'} came along${cameFrom.cut.flattened ? `, ${cameFrom.cut.flattened} repl${cameFrom.cut.flattened === 1 ? 'y' : 'ies'} became plain entries` : ''}; rewind starts here. `
              : ''}
            your old room is still on this device.{' '}
            {cameFrom.copied
              ? `the new link is copied — hand it only to the people you want. ${KEY_TRAVELS}`
              : 'copy the new link from settings → link and hand it only to the people you want.'}
          </div>
          <button className="noticeClose" onClick={() => setCameFrom(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ) : null}
      {hideExplained ? (
        <div className="noticeRow hideExplained">
          <div className="notice">
            this hides it everywhere, but every copy keeps it and rewind still shows it.
          </div>
          <button className="noticeClose" onClick={() => setHideExplained(false)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ) : null}
      {!profiles.get(SEAT) && !namePromptDismissed ? (
        <div className="namePrompt">
          <button className="namePromptText" onClick={() => setView('settings')}>
            you're {seatSuffix(SEAT)} — set a name?
          </button>
          <button className="namePromptClose" onClick={dismissNamePrompt} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ) : null}
      <Composer
        onSend={(body) => {
          if (editTarget) {
            // rewrite the body in place; the marker entry says it happened
            const live = entries.find((e) => e.id === editTarget.id)
            if (live && live.body !== body) {
              ;(live as { body: string }).body = body
              void spool.wind({ kind: 'room:edit', parent: editTarget.id, data: { seat: SEAT } })
            }
            setEditTarget(null)
          } else {
            void spool.wind({
              kind: 'message',
              body,
              data: { seat: SEAT },
              ...(replyTo ? { parent: replyTo.id } : {}),
            })
            setReplyTo(null)
          }
          clearTyping()
        }}
        onTyping={onTyping}
        replyLabel={
          replyTo ? `↩ ${resolveName(seatOf(replyTo))} — ${replyTo.body.slice(0, 40)}${replyTo.body.length > 40 ? '…' : ''}` : null
        }
        onCancelReply={() => setReplyTo(null)}
        editLabel={editTarget ? `✎ editing — ${editTarget.body.slice(0, 40)}${editTarget.body.length > 40 ? '…' : ''}` : null}
        editSeed={editTarget ? editTarget.body : null}
        onCancelEdit={() => setEditTarget(null)}
      />
      {sheetFor ? (
        (() => {
          const isTombstone = deletedRecords.some((r) => r.id === sheetFor.id)
          const isMine = seatOf(sheetFor) === SEAT
          return (
            <ActionSheet
              preview={`${resolveName(seatOf(sheetFor))} — ${isTombstone ? 'hidden' : `${sheetFor.body.slice(0, 48)}${sheetFor.body.length > 48 ? '…' : ''}`}`}
              myReactions={isTombstone ? undefined : myReactionsOn(sheetFor)}
              onReact={isTombstone ? undefined : (emoji) => toggleReaction(sheetFor.id, emoji)}
              actions={
                isTombstone
                  ? [
                      {
                        label: '↺ restore',
                        run: () => spool.deleted.find((e) => e.id === sheetFor.id)?.restore(),
                      },
                    ]
                  : [
                      {
                        label: '↩ reply',
                        run: () => {
                          setEditTarget(null)
                          setReplyTo(sheetFor)
                        },
                      },
                      {
                        // the cut (T-187): a new reel from this message on;
                        // the confirm line carries the sentence
                        label: '✂ start a new reel from here',
                        run: () => {
                          setCutState({ phase: 'idle' })
                          setCutFrom(sheetFor)
                        },
                      },
                      // affordance is own-only; the protocol can't enforce it
                      // and settings says so out loud — that's the contract
                      ...(isMine
                        ? [
                            {
                              label: '✎ edit',
                              run: () => {
                                setReplyTo(null)
                                setEditTarget(sheetFor)
                              },
                            },
                            {
                              // the label says what the mechanism does: a
                              // soft hide anyone can restore (T-162)
                              label: '✕ hide for everyone',
                              run: () => {
                                entries.find((e) => e.id === sheetFor.id)?.delete()
                                explainHideOnce()
                              },
                            },
                          ]
                        : []),
                    ]
              }
              onClose={() => setSheetFor(null)}
            />
          )
        })()
      ) : null}
      {arrival === 'active' || (arrival === 'unknown' && entries.length === 0) ? (
        // 'unknown' + empty covers the one commit before the deciding effect
        // runs — without it, a fast pocket paints one bare-empty frame
        <Arrival
          pocketPhase={pocket?.phase ?? null}
          status={status}
          peers={peers}
          hasEntries={entries.length > 0}
          onDone={() => setArrival('done')}
        />
      ) : null}
    </div>
  )
}

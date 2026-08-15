import { useEffect, useMemo, useState } from 'react'
import type { Spool } from 'spools'
import { Composer } from './Composer'
import { MessageList } from './MessageList'
import { mySeat, seatColor, seatSuffix, initialOf } from './seat'
import { nameFor, participants, profileTable, type Profile } from './profiles'
import { useRoom } from './useRoom'

/**
 * The shell: header → notices → feed (through the <MessageList> boundary,
 * nothing else) → composer, plus the settings view. Later tickets own their
 * screens' behavior (T-117 arrival, T-118 action sheet, T-119 presence,
 * T-122 name/themes); this shell routes to them.
 */

const SEAT = typeof localStorage !== 'undefined' ? mySeat() : ''

/**
 * One person row: live-looking input, but the profile entry winds on COMMIT
 * (blur/Enter), not per keystroke — every rename is permanent under gc:false,
 * and a keystroke-per-entry rename would spend dozens of them (D2's accepted
 * cost is "a handful of times", so the UI keeps it a handful).
 */
const PersonRow = ({
  seat,
  profile,
  isMe,
  onRename,
}: {
  seat: string
  profile: Profile | undefined
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
        {profile ? <span className="personAudit">renamed by {profile.renamedBy}</span> : null}
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
  onBack,
}: {
  spool: Spool
  seats: string[]
  profiles: Map<string, Profile>
  onBack: () => void
}) => {
  const [copied, setCopied] = useState(false)
  const link = spool.share()
  const copy = () => {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }
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
          <div className="sectionLabel">people</div>
          {seats.map((seat) => (
            <PersonRow
              key={seat}
              seat={seat}
              profile={profiles.get(seat)}
              isMe={seat === SEAT}
              onRename={(name) =>
                void spool.wind({ kind: 'room:profile', body: name, data: { seat } })
              }
            />
          ))}
          <div className="caption">anyone can rename anyone — it applies everywhere</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">link</div>
          <div className="linkRow">
            <span className="linkText">{link}</span>
            <button className="copyBtn" onClick={copy}>
              {copied ? 'copied ✓' : 'copy'}
            </button>
          </div>
          <div className="caption">the link is the key — share it with people you trust</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">fine print</div>
          <div className="finePrint">
            anyone with the link can edit or delete anything. no push, no server that knows you. rewind
            never forgets.
          </div>
        </section>
      </div>
    </div>
  )
}

export const App = () => {
  const [author] = useState(() => localStorage.getItem('spool-author') || 'anonymous')
  const { spool, entries, status, undecryptable, pocket, error } = useRoom(author)
  const [view, setView] = useState<'room' | 'settings'>('room')

  // the profile table, recomputed behind the same feed subscription — names
  // resolve at render time, so renames apply retroactively by construction
  const profiles = useMemo(() => profileTable(entries), [entries])
  const seats = useMemo(() => participants(entries, SEAT), [entries])
  const resolveName = (seat: string) => nameFor(profiles, seat)

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

  if (view === 'settings')
    return <Settings spool={spool} seats={seats} profiles={profiles} onBack={() => setView('room')} />

  return (
    <div className="screen">
      <header className="header">
        <span className="headerBtn" />
        <button className="headerTitle asButton" onClick={() => setView('settings')}>
          room
        </button>
        <button className="headerBtn" onClick={() => setView('settings')} aria-label="Settings">
          ⋯
        </button>
      </header>
      <div className="statusLine">
        <span className={`statusDot ${status}`} />
        {status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting…' : 'offline'}
      </div>

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
            ? "this room has outgrown the relay's pocket — syncing live-only now."
            : "the relay's pocket is full — syncing live-only now."}
        </div>
      ) : null}

      <MessageList records={entries} mySeat={SEAT} resolveName={resolveName} />
      <Composer onSend={(body) => void spool.wind({ kind: 'message', body, data: { seat: SEAT } })} />
    </div>
  )
}

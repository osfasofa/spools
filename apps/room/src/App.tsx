import { useEffect, useState } from 'react'
import { Composer } from './Composer'
import { MessageList } from './MessageList'
import { mySeat } from './seat'
import { useRoom } from './useRoom'

/**
 * The shell: header → notices → feed (through the <MessageList> boundary,
 * nothing else) → composer, plus the settings view. Later tickets own their
 * screens' behavior (T-114 people, T-117 arrival, T-118 action sheet, T-119
 * presence, T-122 name/themes); this shell routes to them.
 */

const SEAT = typeof localStorage !== 'undefined' ? mySeat() : ''

const Settings = ({ link, onBack }: { link: string; onBack: () => void }) => {
  const [copied, setCopied] = useState(false)
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

  if (view === 'settings') return <Settings link={spool.share()} onBack={() => setView('room')} />

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

      <MessageList records={entries} mySeat={SEAT} />
      <Composer onSend={(body) => void spool.wind({ kind: 'message', body, data: { seat: SEAT } })} />
    </div>
  )
}

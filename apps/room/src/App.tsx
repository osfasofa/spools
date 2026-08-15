import { useEffect, useMemo, useRef, useState } from 'react'
import type { Spool } from 'spools'
import { ActionSheet } from './ActionSheet'
import { Arrival } from './Arrival'
import { drawFavicon, pageTitle } from './badge'
import { Composer } from './Composer'
import { MessageList, seatOf, type ParentRef, type Rec } from './MessageList'
import { normalizeEmoji, rememberEmoji } from './emoji'
import { mySeat, seatColor, seatSuffix, initialOf } from './seat'
import { nameFor, participants, profileTable, type Profile } from './profiles'
import { THEMES, applyTheme, currentTheme } from './theme'
import { usePresence } from './usePresence'
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
  roomName,
  namedBy,
  onRenameRoom,
  muted,
  onToggleMute,
  notifState,
  onEnableNotifications,
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
  onBack: () => void
}) => {
  const [copied, setCopied] = useState(false)
  const [nameDraft, setNameDraft] = useState(roomName)
  const [nameEditing, setNameEditing] = useState(false)
  useEffect(() => {
    if (!nameEditing) setNameDraft(roomName)
  }, [roomName, nameEditing])
  // per-device theme — the T-090 stash-label precedent: a theme is your
  // handwriting; it syncs nothing (owner-approved cut)
  const [theme, setTheme] = useState(currentTheme)
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
          <div className="caption">the link is the key — share it with people you trust</div>
        </section>
        <section className="settingsSection">
          <div className="sectionLabel">fine print</div>
          <div className="finePrint">
            anyone with the link can edit or delete anything. no push, no server that knows you. rewind
            never forgets. "seen" is live-only — nobody learns what you read while they were away.
          </div>
        </section>
      </div>
    </div>
  )
}

export const App = () => {
  const [author] = useState(() => localStorage.getItem('spool-author') || 'anonymous')
  const { spool, entries, status, undecryptable, pocket, peers, openedEmpty, error } = useRoom(author)
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

  const [inviteCopied, setInviteCopied] = useState(false)
  const invite = () => {
    if (!spool) return
    void navigator.clipboard.writeText(spool.share()).then(() => {
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 1600)
    })
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
    return parentIndex.deleted.has(id) ? { kind: 'removed' } : { kind: 'missing' }
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
      // tag collapses the pile into one — this is a nudge, not a feed
      new Notification(roomName || 'a room', {
        body: `${nameFor(profileTable(entries), seatOf(latest))}: ${latest.body.slice(0, 80)}`,
        tag: `room-${spool?.code ?? ''}`,
      })
    }
  }, [entries, muted, notifState, roomName, spool])
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
      {inviteCopied ? <div className="notice">link copied — hand it to someone you trust</div> : null}
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
              preview={`${resolveName(seatOf(sheetFor))} — ${isTombstone ? 'removed' : `${sheetFor.body.slice(0, 48)}${sheetFor.body.length > 48 ? '…' : ''}`}`}
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
                              label: '✕ remove',
                              run: () => entries.find((e) => e.id === sheetFor.id)?.delete(),
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

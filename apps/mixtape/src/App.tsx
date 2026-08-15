import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { stash } from 'spools'
import { Cassette } from './Cassette'
import { useSpool } from './useSpool'

/**
 * A record is what both live Entries and frozen EntrySnapshots look like —
 * the renderer never knows which it's holding (views are skins over data;
 * rewind reuses every component below unchanged).
 */
interface Rec {
  readonly id: string
  readonly author: string
  readonly kind: string
  readonly parent?: string
  readonly createdAt: number
  readonly data?: Record<string, unknown>
  readonly body: string
}

const EMOJI = ['🔥', '💜', '😭', '👀']

/** entries come from peers; a url is untrusted input */
const safeHref = (url: unknown): string | null =>
  typeof url === 'string' && /^https?:\/\//i.test(url) ? url : null

const when = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const trackInfo = (rec: Rec) => {
  const d = rec.data ?? {}
  return {
    title: typeof d.title === 'string' && d.title ? d.title : rec.body || 'untitled',
    artist: typeof d.artist === 'string' && d.artist ? d.artist : 'unknown artist',
    href: safeHref(d.url),
    note: typeof d.title === 'string' ? rec.body : '',
  }
}

const Reactions = ({ counts, onReact }: { counts: Map<string, number>; onReact?: (emoji: string) => void }) => (
  <span className="reactions">
    {[...counts].map(([emoji, n]) => (
      <span key={emoji} className="reactionCount">
        {emoji}
        {n > 1 ? <small>{n}</small> : null}
      </span>
    ))}
    {onReact
      ? EMOJI.map((emoji) => (
          <button key={emoji} className="reactBtn" title="react" onClick={() => onReact(emoji)}>
            {emoji}
          </button>
        ))
      : null}
  </span>
)

const TrackList = ({ records, onReact }: { records: Rec[]; onReact?: (parent: string, emoji: string) => void }) => {
  const reactions = useMemo(() => {
    const byParent = new Map<string, Map<string, number>>()
    for (const rec of records) {
      if (rec.kind !== 'reaction' || !rec.parent) continue
      const counts = byParent.get(rec.parent) ?? new Map<string, number>()
      counts.set(rec.body, (counts.get(rec.body) ?? 0) + 1)
      byParent.set(rec.parent, counts)
    }
    return byParent
  }, [records])

  const tracks = records.filter((r) => r.kind === 'track')
  const notes = records.filter((r) => r.kind !== 'track' && r.kind !== 'reaction' && !r.parent)

  return (
    <>
      {tracks.length === 0 ? <p className="empty">nothing on the tape yet — wind the first track on.</p> : null}
      <ol className="tracks">
        {tracks.map((rec, i) => {
          const t = trackInfo(rec)
          const label = `${t.title} — ${t.artist}`
          return (
            <li key={rec.id} className="track">
              <span className="trackNo">{String(i + 1).padStart(2, '0')}</span>
              <div className="trackBody">
                {t.href ? (
                  <a href={t.href} target="_blank" rel="noopener noreferrer" className="trackTitle">
                    {label}
                  </a>
                ) : (
                  <span className="trackTitle">{label}</span>
                )}
                {t.note ? <div className="trackNote">{t.note}</div> : null}
                <div className="trackMeta">
                  {rec.author} · {when(rec.createdAt)}
                  <Reactions
                    counts={reactions.get(rec.id) ?? new Map()}
                    onReact={onReact ? (emoji) => onReact(rec.id, emoji) : undefined}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      {notes.length > 0 ? (
        <div className="liner">
          <h3>liner notes</h3>
          {notes.map((rec) => (
            <p key={rec.id} className="linerNote">
              {rec.body} <span className="trackMeta">— {rec.author}</span>
            </p>
          ))}
        </div>
      ) : null}
    </>
  )
}

const AddTrack = ({ onWind }: { onWind: (fields: { url: string; title: string; artist: string; note: string }) => void }) => {
  const [fields, setFields] = useState({ url: '', title: '', artist: '', note: '' })
  const set = (k: keyof typeof fields) => (ev: FormEvent<HTMLInputElement>) => {
    // read before the updater runs — currentTarget is nulled after dispatch
    const value = ev.currentTarget.value
    setFields((f) => ({ ...f, [k]: value }))
  }
  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    if (!fields.title.trim() || !fields.url.trim()) return
    onWind(fields)
    setFields({ url: '', title: '', artist: '', note: '' })
  }
  return (
    <form className="addTrack" onSubmit={submit}>
      <h3>add a track</h3>
      <input placeholder="song url" value={fields.url} onInput={set('url')} />
      <div className="row">
        <input placeholder="title" value={fields.title} onInput={set('title')} />
        <input placeholder="artist" value={fields.artist} onInput={set('artist')} />
      </div>
      <input placeholder="why this one? (optional)" value={fields.note} onInput={set('note')} />
      <button type="submit">wind it on</button>
    </form>
  )
}

export const App = () => {
  const [author] = useState(() => localStorage.getItem('spool-author') || 'anonymous')
  const { spool, entries, status, undecryptable, pocket, error } = useSpool(author)

  // the pocket beat: a breath of "checking…" on open, a brief note when
  // sealed copies land, and a persistent warning only when depositing hit a
  // hard relay limit (the spool itself is fine — live-only, said out loud)
  const [pocketFlash, setPocketFlash] = useState(false)
  useEffect(() => {
    if (pocket?.phase !== 'applied') return
    setPocketFlash(true)
    const t = setTimeout(() => setPocketFlash(false), 4000)
    return () => clearTimeout(t)
  }, [pocket?.phase])

  // the tape's name lives on this device (stash label) — write on the cassette
  const [title, setTitle] = useState('')
  useEffect(() => {
    if (!spool) return
    void stash.list().then((rows) => {
      const mine = rows.find((r) => r.code === spool.code)
      if (mine?.label) setTitle(mine.label)
    })
  }, [spool])
  const retitle = (next: string) => {
    setTitle(next)
    if (spool) stash.label(spool.code, next.trim())
  }

  // rewind: null = live; otherwise the recorded moment being shown.
  // moments are read fresh when entering (they accrue ~2 s after writes,
  // with no entry event — render-time reads would go stale)
  const [rewindTs, setRewindTs] = useState<number | null>(null)
  const [moments, setMoments] = useState<number[]>([])
  const [noMemory, setNoMemory] = useState(false)
  const rewinding = rewindTs !== null

  const records: Rec[] = useMemo(() => {
    if (!spool) return []
    if (rewindTs === null) return entries
    return spool.rewind(rewindTs).filter((s) => s.deletedAt == null)
  }, [spool, entries, rewindTs])

  const [copied, setCopied] = useState(false)
  const [nameDraft, setNameDraft] = useState(author)

  if (error) {
    return (
      <main className="page">
        <div className="errorCard">
          <h2>this tape wouldn't open</h2>
          <p>{error}</p>
          <p className="trackMeta">check the link you were handed — same link, same key, that's the contract.</p>
        </div>
      </main>
    )
  }
  if (!spool) return <main className="page loading">finding the tape…</main>

  const share = () => {
    void navigator.clipboard.writeText(spool.share()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  const scrub = (raw: number) => {
    const resolved = moments.filter((m) => m <= raw).pop()
    if (resolved !== undefined && resolved !== rewindTs) setRewindTs(resolved)
  }

  return (
    <main className="page">
      <Cassette title={title} code={spool.code} status={status} onRetitle={retitle} />

      {undecryptable > 0 ? (
        <p className="warn">someone in this room isn't on your key — their {undecryptable} frame{undecryptable === 1 ? '' : 's'} were ignored.</p>
      ) : null}

      {pocket?.phase === 'checking' ? <p className="pocketBeat">checking the pocket…</p> : null}
      {pocketFlash && pocket?.phase === 'applied' ? (
        <p className="pocketBeat">
          ⤵ {pocket.applied} sealed cop{pocket.applied === 1 ? 'y' : 'ies'} from the pocket
          {pocket.dropped ? ` (${pocket.dropped} dropped — not on your key)` : ''}
        </p>
      ) : null}
      {pocket?.depositError ? (
        <p className="warn">
          {pocket.depositError === 'too-big'
            ? "this tape has outgrown the relay's pocket — syncing live-only now."
            : "the relay's pocket is full — syncing live-only now."}
        </p>
      ) : null}

      <div className="deck">
        <button
          className="deckBtn"
          onClick={() => {
            if (rewinding) return setRewindTs(null)
            const fresh = spool.history
            if (fresh.length === 0) {
              setNoMemory(true)
              setTimeout(() => setNoMemory(false), 1500)
              return
            }
            setMoments(fresh)
            setRewindTs(fresh[fresh.length - 1])
          }}
          title="scrub back through the tape"
        >
          {rewinding ? '⏵ back to now' : noMemory ? 'no memory yet' : '⏪ rewind'}
        </button>
        <button className="deckBtn" onClick={share}>
          {copied ? 'link copied ✓' : '⤴ hand this tape to someone'}
        </button>
      </div>

      {rewinding ? (
        <div className="memoryBar">
          <input
            type="range"
            min={moments[0]}
            max={Math.max(moments[moments.length - 1], moments[0] + 1)}
            step="any"
            defaultValue={moments[moments.length - 1]}
            onInput={(ev) => scrub(Number(ev.currentTarget.value))}
          />
          <div className="memoryLabel">
            🕰 {new Date(rewindTs).toLocaleString()} · moment {moments.lastIndexOf(rewindTs) + 1}/{moments.length} — memory is read-only
          </div>
        </div>
      ) : null}

      <section className={rewinding ? 'tapeContents memory' : 'tapeContents'}>
        <TrackList
          records={records}
          onReact={
            rewinding
              ? undefined
              : (parent, emoji) => void spool.wind({ kind: 'reaction', parent, body: emoji })
          }
        />
        {!rewinding ? (
          <AddTrack
            onWind={({ url, title: t, artist, note }) =>
              void spool.wind({
                kind: 'track',
                body: note.trim(),
                data: { url: url.trim(), title: t.trim(), artist: artist.trim() },
              })
            }
          />
        ) : null}
      </section>

      <footer className="colophon">
        <label>
          from{' '}
          <input
            className="authorInput"
            value={nameDraft}
            onInput={(ev) => setNameDraft(ev.currentTarget.value)}
            onBlur={() => {
              const next = nameDraft.trim() || 'anonymous'
              if (next !== author) {
                localStorage.setItem('spool-author', next)
                location.reload()
              }
            }}
          />
        </label>
        <span>
          · a <a href="https://github.com/osfasofa/spools" rel="noopener noreferrer">spool</a> — yours, on this device, forever
        </span>
      </footer>
    </main>
  )
}

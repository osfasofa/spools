/* The reel model: a pure projection from spool entries to what the tape and
   the telling render. No DOM, no audio, no spool mutation — derive() works on
   the live spool and on rewind snapshots alike (both expose entries/deleted
   with {id, author, kind, parent, createdAt, deletedAt, data, body}).

   Schema (DESIGN.md §3): takes carry audio pointers + placement; placement
   edits are append-only `mend` entries (newest surviving wins); cuts are two
   winds and a tombstone. Unknown kinds and malformed data are ignored, never
   fatal — the forward-compatibility rule. */
/* exported LoreReel */
const LoreReel = (() => {
  const TRACKS = 4

  // house sort: createdAt, id tie-break — same everywhere
  const byTime = (a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

  const num = (v) => (typeof v === 'number' && isFinite(v) ? v : null)

  // a usable audio pointer names its bytes; everything else is decoration
  const audioOf = (d) => {
    const a = d && d.audio
    if (!a || typeof a.sha256 !== 'string' || !a.sha256) return null
    return {
      sha256: a.sha256,
      size: num(a.size) ?? 0,
      mime: typeof a.mime === 'string' ? a.mime : 'application/octet-stream',
      dur: num(a.dur) ?? 0,
      url: typeof a.url === 'string' ? a.url : undefined,
    }
  }

  const tapeOf = (t) => {
    if (!t) return null
    const at = num(t.at)
    const dur = num(t.dur)
    if (at === null || dur === null || dur <= 0) return null
    let track = num(t.track) ?? 0
    track = Math.min(TRACKS - 1, Math.max(0, Math.floor(track)))
    return {
      track,
      at,
      dur,
      offset: Math.max(0, num(t.offset) ?? 0),
      gain: Math.min(2, Math.max(0, num(t.gain) ?? 1)),
      rate: Math.min(8, Math.max(1 / 8, num(t.rate) ?? 1)),
    }
  }

  const derive = (source) => {
    const live = (source.entries || []).slice().sort(byTime)

    // group children once: mends (placement amendments) and glosses
    const mendsFor = new Map()
    const glossesFor = new Map()
    for (const e of live) {
      if (e.kind === 'mend' && e.parent) {
        // a mend is valid if it names a position; sayings mend with {at}
        // alone, takes with a full placement block
        const at = e.data && e.data.tape ? num(e.data.tape.at) : null
        if (at === null) continue
        const prev = mendsFor.get(e.parent)
        // newest surviving mend wins (byTime order makes the last one newest)
        if (!prev || byTime(prev, e) < 0) mendsFor.set(e.parent, e)
      } else if (e.kind === 'gloss' && e.parent) {
        if (!glossesFor.has(e.parent)) glossesFor.set(e.parent, [])
        glossesFor.get(e.parent).push(e)
      }
    }

    const takes = []
    const sayings = []
    const tellings = []
    let title
    let epigraph
    let mixGains = [1, 1, 1, 1]
    const names = new Map() // seat → display name (newest wins; byTime order)

    for (const e of live) {
      const d = e.data || {}
      switch (e.kind) {
        case 'take': {
          const audio = audioOf(d)
          const wound = tapeOf(d.tape)
          if (!audio || !wound) break
          const mend = mendsFor.get(e.id)
          const mended = mend ? tapeOf(mend.data.tape) : null
          takes.push({
            id: e.id,
            author: e.author,
            createdAt: e.createdAt,
            caption: e.body || '',
            audio,
            tape: mended || wound,
            wound, // the placement as first told — the telling shows drift
            mended: !!mended,
            punch: d.punch && num(d.punch.in) !== null ? d.punch : undefined,
            source: d.source && typeof d.source.type === 'string' ? d.source : undefined,
            origin: d.origin && typeof d.origin.take === 'string' ? d.origin : undefined,
            glosses: glossesFor.get(e.id) || [],
            entry: e,
          })
          break
        }
        case 'saying': {
          const at = d.tape ? num(d.tape.at) : null
          if (at === null || !e.body) break
          const mend = mendsFor.get(e.id)
          const mAt = mend ? num(mend.data.tape.at) : null
          sayings.push({
            id: e.id,
            author: e.author,
            createdAt: e.createdAt,
            body: e.body,
            at: mAt !== null ? mAt : at,
            glosses: glossesFor.get(e.id) || [],
            entry: e,
          })
          break
        }
        case 'telling': {
          const audio = audioOf(d)
          if (!audio) break
          tellings.push({
            id: e.id,
            author: e.author,
            createdAt: e.createdAt,
            body: e.body || '',
            audio,
            baked: d.baked || {},
            glosses: glossesFor.get(e.id) || [],
            entry: e,
          })
          break
        }
        case 'lore:reel': {
          // newest wins; live is already oldest→newest
          if (typeof d.title === 'string') title = d.title
          if (typeof d.epigraph === 'string') epigraph = d.epigraph
          break
        }
        case 'lore:mix': {
          if (Array.isArray(d.tracks)) {
            mixGains = mixGains.map((g, i) => {
              const t = d.tracks[i]
              const v = t && num(t.gain)
              return v === null || v === undefined ? g : Math.min(2, Math.max(0, v))
            })
          }
          break
        }
        case 'lore:teller': {
          if (typeof d.seat === 'string' && typeof d.name === 'string') names.set(d.seat, d.name)
          break
        }
        default:
          break // unknown kinds render nowhere on the tape; the telling still lists them
      }
    }

    // the reel ends where the last sound or word ends
    let length = 0
    for (const t of takes) length = Math.max(length, t.tape.at + t.tape.dur)
    for (const s of sayings) length = Math.max(length, s.at)

    return { takes, sayings, tellings, names, title, epigraph, mixGains, length }
  }

  // display name for an entry: profile table by seat (stamped in data.seat at
  // wind time), else the frozen author string — testimony either way
  const tellerName = (reel, entry) => {
    const seat = entry.data && typeof entry.data.seat === 'string' ? entry.data.seat : null
    if (seat && reel.names.has(seat)) return reel.names.get(seat)
    return entry.author || 'someone'
  }

  return { TRACKS, derive, tellerName, byTime }
})()

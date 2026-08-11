---
id: T-030
title: track/reaction kinds + view switcher (views-are-skins)
status: done
milestone: M3
depends: [T-021]
---

## Goal

The demo that *is* the pitch: the same spool rendered as a mixtape, a chat, and a list — switchable live. Proves `kind` + `parent` carry app semantics with zero protocol changes, and forces the parked `data`-field question to a verdict.

## Context

- DESIGN_DOC Layer 4: "two or three renderers over the *same spool*, so people viscerally get that views are skins over one data model."
- Kinds for this milestone: `track` (a song: url + title + artist + a note) and `reaction` (emoji, `parent` = a track's id). Chat view renders `note` kinds as messages and tracks as link cards; mixtape view renders tracks as the tape and reactions as flair; list view (T-020) renders everything raw.
- Forward-compat rule exercised for real: the list view must render `track` entries it "doesn't understand" gracefully (as generic entries), not break.
- **The forcing function** (DESIGN_DOC §5/§6): tracks want structured data (url/title/artist). V1 options are (a) markdown-smuggle into the Y.Text body, (b) JSON-in-body, (c) conclude a plain `data` metadata field earns its spec sentence. Build with (a) or (b), *feel* the friction, record the verdict.
- Cultural reference for the mixtape UX: blackpeople.lol (the shipped toy that established the trade-a-mixtape feel).

## Tasks

- [x] `wind` UI for tracks (url + title + artist + note) and reactions (tap an emoji on a track).
- [x] Mixtape view; chat view; keep list view. Switcher swaps renderer over the same live spool, no reconnection.
- [x] Reactions render via `entry.children` (threading mechanism, not a special case).
- [x] Use the **diff payload** for at least one polish moment (new track animates in / "new reaction" flash) — exercises the smart-client path of the event contract.
- [x] Write the `data`-field verdict in Notes + update DESIGN_DOC §6 (and §5 if decided).

## Acceptance criteria

- One spool, three views, switchable live in two tabs simultaneously showing different views of the same data.
- An unknown-kind entry (wind a `kind: 'mystery'` via console) renders harmlessly in every view.
- The `data` verdict is written down with the friction evidence that produced it.

## Notes / open questions

- **Shipped shape:** `views.js` (three renderers, each `{ mount(spool, root) → update(change) }`) + `app.js` as the shell. The mount/update split exists because a naive full-rerender eats input focus mid-typing when a peer winds — views build their wind UI once (input is part of the skin: chat gets a message box, mixtape gets the track form, list keeps T-020's) and rerender only entry content. The switcher swaps skins over the same live spool object; no reconnection, verified live in two tabs holding different views of the same data.
- **Track data was built as markdown-smuggle** (option a): body = `[Title — Artist](url)` + note lines. Chosen over JSON-in-body because degradation is the whole forward-compat story — and it delivered: the list view showed `[lofi hip hop radio — Lofi Girl](https://…) for the late shifts` as a perfectly readable line in a view that doesn't understand tracks. JSON would have shown a blob.
- **`data`-field verdict (recommendation — protocol-shaping, needs user sign-off before any SDK change):** *smuggling works for the demo but does not deserve to become the convention; a plain-JSON `data` field earns its spec sentence.* The friction, felt while building:
  1. **The parser is guesswork.** A title containing ` — ` mis-splits the regex; a url containing `)` truncates. The fallback (render raw, never break) is fine UX, but the fields are genuinely ambiguous — the format cannot be parsed reliably even in principle.
  2. **The schema exists either way — it's just hiding in a regex.** Every renderer that wants track fields must ship a bug-compatible copy of the same parser. That's a protocol sentence pretending not to be one, which is worse than writing it down.
  3. **Fields can't be touched independently**: editing the note risks corrupting the head line; there is no sane path to "fix the artist" without re-encoding the whole body.
  4. What smuggling got right should be **kept, not lost**: the proposed shape is `data` for machine fields (`{url, title, artist}`) + body for the human note — so naive views still show human text, and the LWW constraint on plain map values stays honest because track data is written once at wind time (immutable by convention, like the parked note predicted).
- **UX observations:** the diff-payload flash (`change.added` → `.fresh` class after repaint) is exactly the "smart client" moment the event contract was designed for — one query-selector per added id, no bookkeeping. Reactions-as-children needed zero special casing: `entry.children` filtered to `kind === 'reaction'`, grouped by body, done. Smuggled `url` is untrusted peer input — the client renders a link only for `http(s):` (a `data` field would not remove that obligation).
- Unknown-kind check: a console-wound `kind: 'mystery'` entry rendered harmlessly in all three views (labeled bubble in chat, liner notes in mixtape, raw row in list).

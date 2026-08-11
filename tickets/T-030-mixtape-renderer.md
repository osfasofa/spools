---
id: T-030
title: track/reaction kinds + view switcher (views-are-skins)
status: todo
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

- [ ] `wind` UI for tracks (url + title + artist + note) and reactions (tap an emoji on a track).
- [ ] Mixtape view; chat view; keep list view. Switcher swaps renderer over the same live spool, no reconnection.
- [ ] Reactions render via `entry.children` (threading mechanism, not a special case).
- [ ] Use the **diff payload** for at least one polish moment (new track animates in / "new reaction" flash) — exercises the smart-client path of the event contract.
- [ ] Write the `data`-field verdict in Notes + update DESIGN_DOC §6 (and §5 if decided).

## Acceptance criteria

- One spool, three views, switchable live in two tabs simultaneously showing different views of the same data.
- An unknown-kind entry (wind a `kind: 'mystery'` via console) renders harmlessly in every view.
- The `data` verdict is written down with the friction evidence that produced it.

## Notes / open questions

- (data-field verdict + UX observations land here)

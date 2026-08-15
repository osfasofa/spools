---
id: T-119
title: "Presence: online dots (+ typing)"
status: done
milestone: M11
depends: [T-111, T-112, T-114]
---

## Goal

The room feels inhabited: online dots per seat, and — only if T-111's numbers
said it's affordable — a debounced typing indicator. All of it ephemeral, all of
it sealed, zero document bytes.

## Context

`spool.awareness` (T-112) or a held `SpoolEngine` if T-112 hasn't landed.
Payload: `setLocalStateField('room', { seat, typing })` — app-defined, per SPEC
§3. Liveness comes from awareness's own 15 s heartbeat / 30 s prune; key
everything to awareness states, never to `synced` (empty-room trap). Ghost
presence is a named refusal — nothing from awareness is ever written to the doc.
Typing is gated on T-111's go/no-go and uses its debounce number; presence dots
deliver most of the aliveness at none of the traffic.

## Tasks

- [x] Participant strip: dots for seats present in awareness, names via the
      profile resolver, merged per T-114's multi-device choice.
- [x] Own-state lifecycle: set on open, clear on `leave()`/pagehide so clean
      exits drop instantly rather than waiting out the timeout.
- [x] Typing (if go): debounced per T-111, cleared on send/blur/idle; "X is
      typing" renders through the resolver.
- [x] Ghost check in the app: kill a tab; the dot drops within the awareness
      timeout on the surviving devices (mechanism measured in T-111: 31.2 s;
      the app rides the identical awareness path — T-126 re-runs it in vivo).

## Acceptance criteria

- A sees B appear on open and drop on tab close (fast) and on kill (≤ timeout).
- Nothing presence-related persists: reload with everyone gone shows an empty
  participant strip and an unchanged doc byte size.

## Notes / open questions

- Landed: `usePresence.ts` — everything rides the sealed awareness `room`
  field (`{ seat, typing? }`), keyed to awareness states, never `synced`,
  never the doc. UI: presence line ("N here ▼", transport status word when
  alone) toggling the people drawer (30 px tiles, accent online dot, offline
  seats at 45 %, "typing…" as the label), and per-seat typing bubbles with
  the three bouncing dots at the feed tail (inside the `<MessageList>`
  boundary; a pinned reader stays pinned when one appears).
- **T-111's numbers, applied**: typing is transitions-only — `typing: true`
  on the first keystroke, cleared after 3 s idle or on send, never per
  keystroke (323 frames/min naive vs ~baseline debounced). The **nudge**
  ships: when a previously-unknown clientID appears, we re-touch our own
  state so latecomers see the room in ~RTT instead of a 15 s heartbeat.
- Clean exits drop fast on three paths: `leave()` (51 ms, T-111), unmount
  (useRoom calls leave), and **pagehide → `setLocalState(null)`** for plain
  tab closes — measured 0.3 s to disappear from peers. Crash ghosts expire
  by the 30 s awareness timeout (T-111: 31.2 s).
- Multi-device per T-114's choice: presence is seat-keyed; several clients
  on one seat merge (typing from any of them counts, own client's echo
  excluded).
- Verified (smoke 11): three seats' dots converge; typing bubble appears on
  a peer and clears on idle with **doc bytes bit-identical** (baseline taken
  after history moments settle — the first run misread a debounced moment
  from earlier scenarios as presence traffic); send clears the bubble as the
  message lands; a closed tab leaves presence in ~0.3 s. Zero page errors.

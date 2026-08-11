---
id: T-020
title: Ugliest possible list client
status: todo
milestone: M2
depends: [T-012]
---

## Goal

The ugliest working client: static HTML/JS in `apps/client`, open-or-create a spool, wind text entries, watch them appear in another tab. Zero styling budget — this ticket proves the SDK, not the design.

## Context

DESIGN_DOC Layer 4: pure static files, no build server, no backend. Build-order step 2's success criterion: *two browser tabs winding entries onto the same spool, surviving refresh and offline/reconnect* (the surviving half is T-021's job to torture-test).

Client consumes the SDK via the mechanism chosen in T-001 (see its Notes).

## Tasks

- [ ] `index.html` + one JS file: on load, parse `location.hash` — spool link present → `openSpool`, absent → `newSpool` + write the share link into the hash and show it ("send this to a friend").
- [ ] Render `spool.entries` as a list (author, body, timestamp). Naive path on purpose: any `entry` event → rerender from `spool.entries`. (The diff payload gets exercised in T-030.)
- [ ] Input box → `wind({ kind: 'note', body })`. Author from a bare prompt/localStorage.
- [ ] Delete button per entry → `entry.delete()` (with a "show deleted" toggle to prove restore).
- [ ] Connection status indicator (`spool.status`).

## Acceptance criteria

- Two tabs, same link: entries wound in either appear in both within ~a second (via fosho's relay).
- Works served from `file://` or any static host — no build step, no server of ours.
- Total client code small enough to read in one sitting (it's demo-as-documentation).

## Notes / open questions

- First real-consumer friction with the SDK API gets recorded here — this ticket is the API's first user test.

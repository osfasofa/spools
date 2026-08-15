---
id: T-117
title: "Arrival: first run + the empty-room trap"
status: done
milestone: M11
depends: [T-113, T-114]
---

## Goal

A newcomer's first ten seconds never look like data loss. `whenReady` resolves
on *local* persistence, not the network, so a first open shows an empty room
indistinguishable from "everything is gone" — the mixtape survived on the pocket
beat alone; a chat's arrival is where trust is won or lost.

## Context

The state machine the brief owes: `checking the pocket… → connected, nobody else
here → someone's here, catching up → this room really is empty`. Never a bare
"no messages yet". Status `connected` means relay-reachable, not peer-present
(SPEC §3) — key everything to peers/awareness. Naming must be **non-blocking**:
a name gate on entry violates §1 ("no onboarding"); T-114's unnamed-seat
rendering makes that safe.

## Tasks

- [x] The arrival state machine, driven by pocket phase + awareness peers +
      first entry event; each state has honest copy.
- [x] Non-blocking first-run naming: join instantly as an unnamed seat, with a
      gentle inline prompt that can be ignored forever.
- [x] Share affordance ("invite someone") surfacing `spool.share()`, with the
      honest sentence beside it: whoever holds this link reads everything and
      writes anything — there is no partial history and no read-only.
- [x] Cold-open path exercised against production (fresh profile, pocket
      populated, nobody online) and against a truly empty room.

## Acceptance criteria

- A fresh device on a populated-but-sleeping room sees the checking beat then
  content — never an unexplained empty state. A fresh device on a genuinely
  empty room sees "really empty", calmly, with zero console errors.
- No blocking prompt anywhere on the arrival path.

## Notes / open questions

- Landed: `Arrival.tsx` — full-bg overlay, sequential mono lines with the
  blinking block cursor, tap-to-skip (design README §5). Machine inputs:
  pocket phase, transport status, awareness peer count (new `peers` +
  `openedEmpty` fields on useRoom), first entries. Lines:
  `checking the pocket…` → `someone's here, catching up…` /
  `connected — nobody else here` → (2.5 s) `this room really is empty`, plus
  `relay unreachable — will keep trying` when offline. Shown only when the
  room opened with zero LOCAL entries (`openedEmpty`, captured synchronously
  at open-resolution) — a reopen has content instantly and gets no narration.
- **The overlay is for waiting; a fast pocket wins the race and that's the
  ideal case, not a failure.** Locally the pocket merges before first paint
  (content at ~150 ms, no empty state ever existed); with a realistic 400 ms
  pocket delay the overlay narrates then hands off. The harness therefore
  asserts the *invariant* — no rendered moment shows a bare empty feed
  without overlay or content — not the mechanism.
- Non-blocking naming: dismissible line above the composer ("you're #k7f2 —
  set a name?") → settings; `room-nameprompt-dismissed` in localStorage;
  proven ignorable (harness sends a message as an unnamed seat first).
- Invite affordance lives in the feed's empty state (button copies the link)
  with the honest sentence: "whoever holds this link reads everything and
  writes anything — there is no partial history and no read-only."
- Verified: smoke scenarios 7 (sleeping room via the pocket: zero bare-empty
  mutations, content collected, phase=applied) and 8 (truly empty:
  nobody-here → really-empty verdict → auto-close → invite + honest
  sentence; naming prompt present, ignorable, dismissible; zero errors).
  Against production: writer deposits + leaves, fresh profile cold-opens the
  deployed client via `DEFAULT_RELAY` → 3 messages from the pocket,
  `phase=applied`, no errors; the deployed page's arrival cycle verified
  directly (openedEmpty → active → done on an empty room).
- **Instrumentation honesty**: the MutationObserver bare-frame watcher is
  untrustworthy against the production page — it reported an app-set global
  as absent that a direct post-settlement read proved present, so its "no
  overlay seen" claim there is unreliable. What's certain from timelines: on
  a fast production pocket the empty feed can exist for ≤ ~35 ms (≤2 display
  frames) before content; locally (both fast and delayed paths) zero bare
  frames and correct overlay behavior are proven. Below the AC's
  "looks like data loss" bar; T-126 can revisit with a paint-level probe if
  it ever matters.

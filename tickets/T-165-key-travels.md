---
id: T-165
title: "Where the key actually goes: the sync/messenger sentence, and the address-bar decision — sign-off"
status: doing
milestone: M15
depends: []
---
## Goal

The fine print says where the key travels beyond our servers, and the owner
decides whether the address bar keeps carrying it.

## Context

The room writes the full link, key included, into the URL on first open
(`useRoom.ts`, `history.replaceState`). Browsers sync history, open tabs, and
bookmarks to their makers; Chrome by default syncs history in a form Google
can read unless a sync passphrase is set. The link then travels through
whatever messenger carries it: Discord, Slack, SMS, email, and Instagram DMs
hold it in plaintext on their servers; Signal does not. The docs' "the key is
never transmitted to any server" is true of *spools'* servers. `stash.ts`
already stores the full link in localStorage, deliberately. Review finding F6.

## Tasks

- [ ] The sentence (no sign-off): fine print and the "link copied" toast:
      *"your browser may sync this address to its maker; send the link over
      something end-to-end encrypted, or in person."* Same sentence in
      WHITEPAPER §7 and the SDK README's honesty bullet.
      — **room half done** (fine print, every "link copied" moment, the
      Settings link caption); WHITEPAPER §7 + SDK README still open, see Notes.
- [ ] The decision (**sign-off**), trade-offs written here for the owner:
      - **A. Keep the key in the address bar** (status quo). Copying from the
        URL bar works; history/tab/bookmark sync carries the key.
      - **B. Strip `k=` after open** (`replaceState` to `#spool=<code>`). The
        key lives only in the stash and the Settings copy button; sharing is
        the button. Bookmarks and history lose the key, so reopening from one
        works only while the stash still holds it; private windows lose it on
        close.
      - **C. Strip only once the stash confirms it holds the key.** B's
        protection with a guard against losing a room on a device whose
        storage is blocked.
- [ ] Record the choice + why in DESIGN_DOC §5; SPEC stays untouched (the
      link grammar doesn't move).

## Acceptance criteria

- Sentence shipped in the room, the whitepaper, and the SDK README.
- §5 row recorded; if B or C, the smoke suite covers reopen-from-stash.

## Notes / open questions

- **Room half shipped (the sentence only); the decision is untouched and
  this ticket stays `doing`.** The sentence is one constant in `App.tsx`
  (`KEY_TRAVELS`) and appears verbatim in: the fine print; the invite toast
  ("link copied — hand it to someone you trust. …", held 4 s instead of 1.6
  so it can be read); the Settings link caption, permanently, under "the
  link is the key"; and T-164's arrival notice when the new room's link was
  copied — every "link copied" moment the room has. Smoke: scenario 8 now
  taps invite on an empty feed and reads the toast; scenario 16 reads the
  fine print and the caption.
- **Not done here, by lane:** WHITEPAPER §7 and the SDK README's honesty
  bullet are outside `apps/room` / `apps/mixtape` (this session's lane).
  Left for the owner or the docs pass; the sentence to paste is the one
  above.
- **The A/B/C address-bar decision is the owner's** (sign-off). Nothing in
  `useRoom.ts`'s `replaceState` moved. One observation for the trade-off
  table, from the T-163/T-164 work: the stash registry already holds the
  full link for every persisted room on the device (SDK-API "the stash"),
  so option C's guard ("strip only once the stash confirms it holds the
  key") can be read straight off `stash.list()` after `whenReady` — no new
  storage needed. The mixtape has the same `replaceState` shape and would
  need the same decision applied.

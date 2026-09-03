---
id: T-165
title: "Where the key actually goes: the sync/messenger sentence, and the address-bar decision — sign-off"
status: todo
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

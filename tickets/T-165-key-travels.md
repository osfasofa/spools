---
id: T-165
title: "Where the key actually goes: the sync/messenger sentence, and the address-bar decision — sign-off"
status: done
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

- [x] The sentence (no sign-off): fine print and the "link copied" toast:
      *"your browser may sync this address to its maker; send the link over
      something end-to-end encrypted, or in person."* Same sentence in
      WHITEPAPER §7 and the SDK README's honesty bullet.
      — **done**: room (fine print, every "link copied" moment, the
      Settings link caption), WHITEPAPER §7, SDK README (5 Sep 2026).
- [x] The decision (**sign-off**) — **C**, 6 Sep 2026, trade-offs written here for the owner:
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
- [x] Record the choice + why in DESIGN_DOC §5; SPEC stays untouched (the
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
- App half landed in commit `42d0b57` (room only). Open: the whitepaper /
  SDK README sentence (other lane) and the address-bar decision (owner
  sign-off) — the ticket stays `doing` for those.
- **Docs half shipped, 5 Sep 2026 (headless).** The same sentence,
  verbatim from `KEY_TRAVELS`, in WHITEPAPER §7's first bullet (the
  capability one — it now says outright that "never sent to a server" is
  true of *this project's* servers, and names browser sync and plaintext
  messengers as the two other roads) and in the SDK README's honesty clause
  (the relay bullet). The README's encryption bullet two lines up still
  says "never sent to servers"; left as is, the honesty clause right below
  it now says whose. Only the A/B/C decision and the §5 row remain — the
  owner's. Ticket stays `doing`.
- **Decided and shipped, 6 Sep 2026: option C.** Both hooks (`useRoom.ts`,
  the mixtape's `useSpool.ts` — copied prose) gained two functions: a bare
  link (`spool=` without `k=`) resolves through `stash.list()` to the row's
  full link before `openSpool`; after open, the bar drops `k=` only if the
  stash row holds a link with a key (`history.replaceState`, which never
  fires `hashchange`, so main.tsx's reload listener stays quiet). The bar
  keeps `#spool=<code>&relay=…` so the bare-URL fallbacks (forget, new
  room) still know the relay. The room exposes `bareOpen` and, when a
  never-held bare link opens, shows "this link has no key, and this device
  never held this room. if the room is keyed, nothing here can be read —
  open the full link someone handed you." — unconditionally, because a
  keyless open cannot count sealed frames (`undecryptableFrames` is always 0
  on a keyless spool), so the line rides the one fact the client can know.
- Smoke 25: the bar drops the key within a beat of open while `share()`
  and the stash row keep it; a reload (a bare link now) reopens keyed with
  its content and no bare-open line; storage patched to swallow the
  registry write keeps `k=` in the bar; a third origin opening the bare
  link for a room it never held shows the honest line and renders zero of
  the sealed messages. The mixtape is build-verified (tsc + vite), as with
  T-176. §5 row: "The address bar (M15, T-165)". **Done.**
- Lab note: a keyless open of a keyed room logs y-websocket's "Unable to
  compute message" once per sealed frame (Yjs can't decode ciphertext) —
  the SDK's `undecryptableFrames` stays 0 because that counter lives in the
  encrypted transport, which a keyless spool doesn't use. Smoke 25 asserts
  those errors are the stranger's only ones, and that there were some.

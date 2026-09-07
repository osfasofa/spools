---
id: T-177
title: "Link shape: shorter and prettier without lying — sign-off"
status: done
milestone: M15
depends: [T-160]
---
## Goal

Decide what a link handed out from chat.spools.lol looks like.

## Context

Today a room link is ~150 characters, most of it the URL-encoded Railway
relay parameter. The owner asked for prettier links and floated "our own
spools namer." SPEC §1: `relay` is optional and SHOULD be carried (the cost of
omission is stated: two clients with different defaults won't meet); the base
URL before `#` is not protocol-meaningful; unknown parameters are ignored;
clients MUST reject links failing the grammar — but an app may translate its
own URL shape into a canonical link before the SDK sees it. Review F19.

## Options, with the link each produces

1. **After T-160 only:** `https://chat.spools.lol/#spool=amber-cassette-042&relay=wss%3A%2F%2Frelay.spools.lol%2Fyjs&k=…` (~120 chars).
2. **Omit `relay=` when it equals the client's default:**
   `https://chat.spools.lol/#spool=amber-cassette-042&k=…` (~95). Also makes
   future links pin no hostname — a provider move becomes a client redeploy,
   not a stranded link. Moves the relay decision from the link to the host
   page; for the canonical client and relay that's the same authority.
   Vessels on other relays keep carrying `relay=`.
3. **App-level path form:** `https://chat.spools.lol/amber-cassette-042#k=…`
   (~90). A room convention: the host serves `index.html` for any path (a
   rewrite on Vercel/Cloudflare, `404.html` on Pages) and the app builds the
   canonical link before `openSpool`. The SDK never changes.
4. **Pick your own two words.** The grammar already allows any
   `word-word-NNN`; a chooser in the client keeps the random suffix. Two
   groups picking the same code share a relay room harmlessly (different keys
   → "someone isn't on your key"; different pocket namespaces).

**Refused, written down so it isn't relitigated:** any server-side namer or
short-link service — it would hold keys, or the mapping to them, and a
directory is a feed in a trenchcoat (ECOSYSTEM); the relay must never see a
key (SPEC §4). Also refused: a shorter key (§5's no-KDF decision).

Recommendation: T-160, then 2, optionally 3.

## Tasks

- [x] Owner picks; §5 row (link-minting convention) and, if wanted, a
      non-normative SPEC §1 note (**sign-off**). *(Option 2, 7 Sep 2026;
      §5 "Link shape"; no SPEC note — the grammar already says it.)*
- [x] Room + mixtape mint the chosen form; `openSpool` accepts both forms;
      tests; the vendor bundle regenerated.

## Acceptance criteria

- Decision recorded; new links open in an old client build (they're still
  grammar-valid), old links open in the new one.

## Notes

**Option 2, shipped 7 Sep 2026 (room + mixtape).** A link handed out of
`chat.spools.lol` is now `#spool=<code>&k=<key>`: `relay=` is dropped when —
and only when — it equals the SDK's `DEFAULT_RELAY`. Measured in the smoke:
**130 → 89 characters** for a `link-shape-503`-length code (the real
`chat.spools.lol` shape lands at ~95).

- **Where it lives:** `apps/room/src/link.ts`, copied to
  `apps/mixtape/src/link.ts` (the apps copy prose, they don't import each
  other). Two functions: `carriedRelay(relay)` — undefined when the fallback
  says the same thing — and `handOut(link)`, which re-builds a link the SDK
  made, keeping its base and key. The forget path (T-163) had already grown
  the same idiom by hand (`relay && relay !== DEFAULT_RELAY`); it reads as
  the general case now.
- **Every place a link leaves the app**: the Settings copy button (and its
  T-176 shown-and-selected fallback), the invite button, the links minted by
  start-a-new-room (T-164) and the cut (T-187) — which are copied *and*
  navigated to, so both halves stay in step — the mixtape's "hand this tape
  to someone", and the address bar in both apps.
- **The address bar** (`tidyBar`, the old `hideKeyOnceStashed`): drops a
  default `relay=` unconditionally — the relay is not a secret and the
  fallback resolves it — and still drops `k=` only once the stash confirms
  it holds the full link (T-165's guard, untouched). A room on a self-hosted
  relay keeps `relay=` in the bar, which is what T-163/T-164's bare-URL path
  reads on the way back out.
- **The SDK never changed.** `spool.share()` and the stash row keep the
  relay pinned, so a bare reload still resolves through the stash to a full
  link, and SPEC §1's *links SHOULD carry `relay`* still describes what the
  SDK builds. The shortening is one app-level translation, which SPEC §1
  explicitly allows (an app may translate its own URL shape into a canonical
  link before the SDK sees it). `apps/client` — the reference client — was
  deliberately left alone: it demonstrates the protocol, and the SHOULD is
  part of what it demonstrates.
- **Smoke scenario 26** (`scratch/spike-room/room-smoke.mjs`, 26/26 green)
  proves both halves and the round trip: on this suite's local relay the
  link still carries it and equals `share()`; on the canonical relay the
  handed link, and the bar, drop it while `share()` and the stash row keep
  it; a second device holding **only** the short link opens
  `wss://relay.spools.lol/yjs/<code>` — the fallback saying what the omitted
  parameter said. Nothing may actually touch the canonical relay from a
  smoke run, so the page's `WebSocket` and `fetch` are dead before the app
  loads (the pre-load patch idiom of scenarios 20 and 25) and the scenario
  asserts **zero bytes** left for it, from `Network.enable`'s own record.
- The mixtape is build-verified only (tsc + vite, identical helper code); it
  has no headless suite in this repo, as T-176 noted.
- **Comparison is exact string equality** against `DEFAULT_RELAY`. A link
  carrying `wss://relay.spools.lol/yjs/` (trailing slash) or the old Railway
  hostname keeps its `relay=` — it is not the default, and SPEC's
  strip-trailing-slashes rule is about the *connection*, not about deciding
  what a link means. Boring on purpose: the wrong direction here strands
  people.
- Option 3 (the path form, `/<code>#k=…`, ~90) stays available and unbuilt:
  it needs the host to serve `index.html` for any path, which is T-167's
  decision. Nothing in this ticket blocks it — `handOut` is the one place
  that would change.

## Acceptance criteria — met

- Decision recorded (§5 "Link shape"); old links (with `relay=`) open in the
  new build — smoke 1–25 are all such links; new links are grammar-valid and
  open in any client that defaults to the canonical relay, which every build
  since `spools@0.2.0` does (smoke 26's second tab is exactly that check).

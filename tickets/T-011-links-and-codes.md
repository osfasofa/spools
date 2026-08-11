---
id: T-011
title: Links, codes, newSpool/openSpool/share
status: done
milestone: M1
depends: [T-001]
---

## Goal

A spool's identity layer: readable codes, the link format, and the public entry points that turn a link into a running engine and back.

## Context

Link grammar (docs/SDK-API.md): `#spool=<code>&relay=<wss-url>&k=<b64key>`. Adapted from fosho's legacy format (`#n=&k=`), whose parse/build helpers are `note.ts:222–234` and `:315–358` (~60 lines, zero deps). Drop fosho's V4 addressing layer entirely — its format sniffing (`note.ts:241–249`) is the cautionary tale for why Spool has exactly one link shape.

Room codes: `adjective-noun-NNN` generator + validation regex from `note.ts:68,97` (~2.5M combos — fine for rendezvous, not a security boundary; the key is the secret).

Key handling this milestone: generate 32 random bytes in `newSpool`, encode URL-safe unpadded base64 (helpers in fosho `encryption.ts:36–56`), carry in links, **store on the instance, use nowhere yet** — goes live in M5.

## Tasks

- [x] `parseSpoolLink(input)` — accepts full URL, bare fragment, or bare code; returns `{ code, relay, key? }`; throws `SpoolLinkError` with a human message on garbage.
- [x] `buildSpoolLink({ code, relay, key?, base? })` — inverse; relay URL-encoded.
- [x] Code generator + validator (word lists small and non-embarrassing; steal fosho's approach, curate the lists).
- [x] `newSpool(opts)` / `openSpool(link, opts)` per docs/SDK-API.md — construct engine (T-010), await `whenReady`, return `Spool`.
- [x] `spool.share()` — rebuild the link from instance state.
- [x] Unit tests: parse/build round-trip, garbage-in errors, code validation, bare-code default-relay path.

## Acceptance criteria

- Round-trip property: `parseSpoolLink(buildSpoolLink(x))` ≡ `x` for valid inputs; tests cover URL, fragment, bare-code forms.
- `openSpool(await (await newSpool()).share())` lands in the same room (manual two-tab check).
- Zero dependencies added for this layer.

## Notes / open questions

- Default relay constant: fosho's for now (T-010); becomes our deployed spools-relay after T-041 — leave a single well-named constant to flip. → `DEFAULT_RELAY` in `src/spool.ts`, exported.
- Shipped: `src/link.ts` (codes, keys, parse/build, zero deps) + `src/spool.ts` (`Spool` handle, `newSpool`/`openSpool`, defaults). 29 tests green.
- **Signaling for custom relays:** a link's single `relay=` URL can't yet derive a signaling endpoint (fosho maps `/yjs` vs `/` by convention). Decision here: custom-relay spools sync over **websocket only**; the default relay gets fosho's known signaling pair. T-040 defines the one-URL convention and lifts this. Not protocol-shaping (link format untouched).
- Strictness decisions: exactly one code shape (`adjective-noun-NNN`) — fosho's UUID "secure codes" and `@identity` addressing deliberately not carried; relay param must be `ws(s)://`; `k=` must decode to exactly 32 bytes. Every rejection is a `SpoolLinkError` with a human message.
- Word lists: 50 adjectives × 50 nouns, curated calm/analog register (`crooked-prism-212` was the first spool born from it).
- `buildSpoolLink` base default: current page in browsers (fosho pattern), bare `#spool=…` fragment elsewhere — still parseable, honest about there being no canonical host yet.
- Browser smoke (Chrome-automated, `scratch/smoke-t011/`): tab 1 `newSpool()` → `crooked-prism-212`; tab 2 navigated to the spool link → same room via default (fosho) relay; both directions converged. Fun find: the Chrome extension redacts `share()` output from tool results because it pattern-matches `k=<secret>` — the key-in-fragment design tripping a real privacy scanner, working as intended. Full-link round trip incl. key is unit-tested; `window.open(share())` was popup-blocked, so the tab-2 check used the code-only link form.

---
id: T-011
title: Links, codes, newSpool/openSpool/share
status: todo
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

- [ ] `parseSpoolLink(input)` — accepts full URL, bare fragment, or bare code; returns `{ code, relay, key? }`; throws `SpoolLinkError` with a human message on garbage.
- [ ] `buildSpoolLink({ code, relay, key?, base? })` — inverse; relay URL-encoded.
- [ ] Code generator + validator (word lists small and non-embarrassing; steal fosho's approach, curate the lists).
- [ ] `newSpool(opts)` / `openSpool(link, opts)` per docs/SDK-API.md — construct engine (T-010), await `whenReady`, return `Spool`.
- [ ] `spool.share()` — rebuild the link from instance state.
- [ ] Unit tests: parse/build round-trip, garbage-in errors, code validation, bare-code default-relay path.

## Acceptance criteria

- Round-trip property: `parseSpoolLink(buildSpoolLink(x))` ≡ `x` for valid inputs; tests cover URL, fragment, bare-code forms.
- `openSpool(await (await newSpool()).share())` lands in the same room (manual two-tab check).
- Zero dependencies added for this layer.

## Notes / open questions

- Default relay constant: fosho's for now (T-010); becomes our deployed spools-relay after T-041 — leave a single well-named constant to flip.

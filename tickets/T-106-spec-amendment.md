---
id: T-106
title: "SPEC v1.1: the pocket amendment"
status: done
milestone: M10
depends: [T-101, T-103]
---

## Goal

The constitution catches up with the working system — written last, from shipped code, per the house rule. The only M10 ticket allowed to touch SPEC.md.

## Context

Brief §7 lists what must survive verbatim (the §3 MUST NOTs, link grammar, closed conformance). The amendment is *additive*: an optional relay capability section + client behavior for it. T-070's ritual applies: adversarial clean-room reads before landing.

## Tasks

- [ ] SPEC: optional pocket capability — endpoints, envelope (`0xE2E3‖version‖tag‖nonce‖ct`), token derivation (exact construction from T-100/T-102 code), per-tag ring semantics as relay conformance-if-offered, the 200-envelope detection rule ("200 without the envelope = no capability, never empty"), keyed-only as normative, TTL/caps as the relay's own business with advertised values.
- [ ] Honesty clause extension: for pocket-running relays, the observable set grows — held ciphertext at rest, deposit sizes/times, an opaque per-spool namespace id, distinct session tags. Still zero content for keyed spools; still "ciphertext or nothing".
- [ ] Relay conformance: pocket optional; a relay offering it must meet the capability section; a relay not offering it is unchanged v1-compliant. Client conformance: unchanged (pocket use is MAY).
- [ ] `docs/SDK-API.md`: `on('pocket')`, scheduler behavior, loss-window honesty.
- [ ] DESIGN_DOC cross-refs tidied (§3 layer-3 "third deferred job" note updated to point at the amendment).
- [ ] Three clean-room adversarial reads of the amended sections (T-070 ritual), ambiguities fixed or recorded.

## Acceptance criteria

- An independent implementer could build a pocket-compatible relay and client from SPEC alone.
- Every pre-existing normative sentence in SPEC §3/§4 is byte-identical (diff-proved) except the section explicitly amended.
- Adversarial reads recorded in Notes with zero blocking ambiguities on the final pass.

## Notes / open questions

- SPEC is now **v1.1**: one new section (§6, the pocket), the honesty-clause extension, a parenthetical after the §3 MUST-NOT sentence (the sentence itself byte-identical, "(v1)" and all), optional conformance items (client 8, relay 5), and a versioning paragraph naming the revision additive. Diff-proved: the only removed lines are the two version strings, the honesty-clause block, and the §3 reflow — every other pre-existing normative sentence is untouched.
- **The adversarial-read ritual earned its keep.** Three passes (disclosed: my own, under three lenses — independent relay implementer, independent client implementer, abuse reader; no external readers were available this session), five real findings, all fixed in place: (1) the PUT success body was never defined (now `200` + `"stored": true`); (2) no charset rule on path segments — a disk-backed independent relay could have been path-traversed (now `[A-Za-z0-9_-]{1,64}`, 400 otherwise, named as the traversal guard); (3) CORS unmentioned — browser depositors would break against a naive independent relay (now a MUST for pocket paths); (4) the per-namespace tag cap was unstated (now MAY cap, stalest-first, reference keeps 4); (5) `at`'s clock was ambiguous (now relay-stamped at storage). Zero blocking ambiguities on the final pass.
- All five fixes describe behavior the reference relay already had (T-101) — the spec-from-working-code rule doing exactly what it's for.
- SDK-API.md gains the pocket surface (`spool.pocket`, `on('pocket')`, `PocketState`, the honest loss-window paragraph) and the `leave()` ordering; DESIGN_DOC §3's deferred third job now points at the shipped capability; the root README gains the pocket sentence, the keeper and mixtape rows, and the missing SPEC link.
- Deliberately NOT in the spec: K's exact value, debounce numbers, storage layout, budgets — the relay's own business (§3's pattern), advertised where clients need them (`ttlDays`).

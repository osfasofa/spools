---
id: T-106
title: "SPEC v1.1: the pocket amendment"
status: todo
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

(filled during work)

---
id: T-188
title: "DESIGN_DOC/SPEC: the splice family checked against working code — last"
status: done
milestone: M16
depends: [T-186, T-187]
---

## Goal

The words match the code. The §2 rows for *reel* and *cut* and the §5 row
"The splice family" were written at sign-off from the brief; this ticket
re-reads them against T-186 and T-187 as shipped and corrects anything the
build taught us. SPEC.md gains at most one non-normative sentence about
carried identity, and only if the build found it wanted. **Last, from
working code** — the only ticket allowed near SPEC.md.

## Tasks

- [x] Re-read DESIGN_DOC §2 (*splice*, *reel*, *cut*) and §5 against the
      shipped surface; fix wording, never intent.
- [x] SPEC.md: the one non-normative sentence, or nothing. The document
      shape, the `entries` map, the body key, write-once-per-document, and
      the display order are untouched by construction.
- [x] The spools-of-spools note (`docs/spools-of-spools.md`) and the two
      riffs get a one-line pointer to what shipped.
- [x] WHITEPAPER: the "spools grow and don't slim down" limit in §7 gains
      the cut as the graceful ending it already describes.

## Acceptance criteria

- SPEC.md's diff is empty or one non-normative sentence.

## Notes / open questions

- **Done, 6 Sep 2026 (the same night as T-186 and T-187).** §2's three rows
  (*splice*, *reel*, *cut*) read true against the code as shipped — no
  wording moved. The §5 row gained a "shipped" line carrying T-187's three
  conventions and the `next` decision, so the log holds the whole family in
  one place. §4's build order ticks `splice` as item 9; §6's chat-scale
  paragraph now says compaction is what stays parked and the cut is what
  answers the number.
- **SPEC.md: one non-normative sentence**, beside the `id` rule in §2 —
  uniqueness is within a spool; an id names an entry, not one spool's
  entry. The reason it was wanted after all: the §5 row's own "bakes in"
  line (a future cross-spool index must know), and SPEC was the one place a
  careful reader could have inferred spool-local ids from "MUST be unique
  in the spool". No normative sentence changed; the version stays.
- Pointers landed in the three research notes' preambles (spools-of-spools,
  the reel, the tape deck), each saying what shipped from it and what
  stays parked. WHITEPAPER §7's growth limit names the cut as the graceful
  ending it already described, with the counter's honesty line. The SDK
  README's surface block shows the verb.
- **M16 closes here.** Not published: `spools@0.3.0` waits for a client
  that needs it from the registry (the room uses the workspace SDK); the
  room's deploy is the owner's word.


---
id: T-188
title: "DESIGN_DOC/SPEC: the splice family checked against working code — last"
status: todo
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

- [ ] Re-read DESIGN_DOC §2 (*splice*, *reel*, *cut*) and §5 against the
      shipped surface; fix wording, never intent.
- [ ] SPEC.md: the one non-normative sentence, or nothing. The document
      shape, the `entries` map, the body key, write-once-per-document, and
      the display order are untouched by construction.
- [ ] The spools-of-spools note (`docs/spools-of-spools.md`) and the two
      riffs get a one-line pointer to what shipped.
- [ ] WHITEPAPER: the "spools grow and don't slim down" limit in §7 gains
      the cut as the graceful ending it already describes.

## Acceptance criteria

- SPEC.md's diff is empty or one non-normative sentence.

## Notes / open questions


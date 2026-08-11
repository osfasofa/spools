---
id: T-070
title: Write SPEC.md from the working system
status: todo
milestone: M7
depends: [T-041, T-051]
---

## Goal

The constitution, written after the country exists: `SPEC.md` describing exactly what demonstrably works, so a stranger can build a compliant client or relay without reading our code.

## Context

- DESIGN_DOC Layer 1 defines the four sections: **spool identity & links**, **document shape (Entry model)**, **wire protocol**, **encryption**. Brutally small — every sentence is implementation work for every future client author.
- Inputs: DESIGN_DOC §5 (all decisions + reasons), docs/SDK-API.md (behavioral contracts), T-003/T-040 Notes (what "relay" precisely means), T-051 Notes (what a compliant encrypted peer implements).
- The spec describes the **protocol**, not the SDK: `wind()` is not spec; "an entry is a map with these fields at this key" is. A compliant client could be written in Python.
- Include the forward-compat rule (ignore unknown kinds *and fields*) and the honesty clause. Include the banked sentence about `author`/`sig`.

## Tasks

- [ ] Draft the four sections from the working system; every claim cross-checked against running code/tests (cite the test where one exists).
- [ ] Conformance checklist: "you are a compliant client if…" / "…a compliant relay if…" — short, testable statements.
- [ ] Versioning stance: spec is `v1`, what compatibility promise (if any) it makes. Keep humble — one paragraph.
- [ ] Adversarial read: have a session play stranger-implementing-from-scratch and log every ambiguity found; fix them.
- [ ] Update DESIGN_DOC to point at SPEC.md as the protocol source of truth (DESIGN_DOC stays the *why*, spec becomes the *what*).

## Acceptance criteria

- A reader with Yjs docs and SPEC.md alone could interop — validated by the adversarial-read exercise producing zero blocking ambiguities on its second pass.
- Word-count discipline held: if it can't be said in a few pages, something upstream is too complicated (that's a finding, not a formatting problem).

## Notes / open questions

- (ambiguities found + resolved during the adversarial read)

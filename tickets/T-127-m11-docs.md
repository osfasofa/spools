---
id: T-127
title: "M11 docs: brief close-out, §5 finalization, SPEC check"
status: done
milestone: M11
depends: [T-110, T-111, T-112, T-113, T-114, T-115, T-116, T-117, T-118, T-119, T-120, T-121, T-122, T-123, T-124, T-125, T-126]
---

## Goal

The paperwork, last, from working code — per the constitution. Includes the
milestone's headline call: **did SPEC.md need to move?**

## Context

The M11 thesis (brief §7): if a Messenger-class chat shipped entirely on app
conventions — reserved kinds, `data.seat`, awareness payloads — then SPEC v1.1
stands untouched and *that* is the finding. If anything genuinely required
protocol surface, it went to the owner when it was hit; this ticket records the
outcome either way. Candidate SPEC touch (decide with the owner): whether the
reserved-kind convention deserves a non-normative sentence, and whether the
`sig`/seat forward path gets named in the spec or stays in DESIGN_DOC §6.

## Tasks

- [x] Brief: status → closed; every § updated to what actually shipped,
      deviations called out (the M10 brief's post-review edits are the model).
- [x] DESIGN_DOC §5: finalize the M11 rows — resolve the D4 pending-pricing
      clause with T-110/T-121's measured numbers; add any T-124 knob row.
- [x] DESIGN_DOC §6: chat-scale growth updated with the measured crossing
      point; the seat-ladder and asset-pointer banked sentences checked against
      what the app actually did.
- [x] SPEC: the headline call, made with the owner. If SPEC moves, it moves
      here, from working code, version-bumped; if it doesn't, the README/spec
      story says a group chat runs on v1.1 as-is.
- [x] `docs/SDK-API.md`: the awareness passthrough row confirmed; candidate
      future surface (profiles, presence, `on('moment')` if the chat hit it)
      listed as *parked with evidence*, not built.
- [x] README: the room joins the mixtape in the clients list, with its URL.

## Acceptance criteria

- Brief closed, §5/§6 finalized with measured numbers in place of estimates,
  the SPEC decision recorded with its reasoning, and INDEX shows M11 complete.

## Notes / open questions

- **The headline call (owner, Aug 2026): SPEC v1.1 stands untouched — and
  even the candidate non-normative reserved-kind sentence was declined.**
  The thesis is the finding: a Messenger-class chat shipped entirely on app
  conventions (seats in `data`, `room:*` reserved kinds resolved
  newest-wins, sealed awareness payloads), the SDK changed exactly once
  (`get awareness()`, D5's plan), and nothing ever needed protocol. The
  README's clients row says the sentence out loud; the `sig`/seat ladder
  stays banked in DESIGN_DOC §6.
- Brief closed with a full close-out block (deviations: D3/D4 amended to
  ephemeral receipts on the quadratic measurement; the added `room:edit`
  kind; the moments-are-~73-B correction; T-124's K=8 + 24 PUTs/min; the
  two AA token nudges). §5's M11 rows were finalized as the decisions
  landed (mutable-state row rewritten by T-110, relay-knobs row added by
  T-124); §6's chat-scale bullet carries the measured crossing
  (~26 500 messages); the seat-ladder and asset-pointer banked sentences
  were checked against the app — it never parses a seat id and never puts
  an asset in the doc, so both stand unchanged.
- SDK-API gains a "parked with evidence" list (profiles/seats, presence
  payload conventions, ephemeral read markers, pocket ring tag
  persistence) — named so promotion later starts from this milestone's
  evidence, not from scratch.
- M11 closes with one ticket deliberately still `doing`: T-125's
  real-hardware audit (plus TESTING.md's H1–H5, which include milestone
  acceptance #1's three-real-devices run) — owner at keyboard, checklist
  ready, deployed client current.

---
id: T-168
title: "Pocket eviction order and namespace creation cap — sign-off"
status: doing
milestone: M15
depends: [T-161]
---
## Goal

A stranger can't cheaply evict real deposits from the canonical pocket.

## Context

`ensureBudget` evicts the stalest namespaces first, and namespaces are free
to create: any room and any token that match the charset. At the stock knobs
one address can fill the relay-wide budget in minutes and evict every real
deposit. Review finding F3. Any default change on the canonical relay follows
T-124's precedent: sign-off, README honesty section updated.

## Tasks

- [x] Track reads per namespace (a GET count; on disk as a sidecar or
      encoded in the touch file). Evict **never-read** namespaces first, then
      stalest — a deposit nobody ever collected is worth nothing.
- [x] Per-IP cap on *new* namespaces per hour (needs T-161's real IP).
      *(`POCKET_NEW_NAMESPACES_PER_HOUR`, default 0 = off.)*
- [ ] Lower size cap for a namespace's first deposit until it has been read
      once (proposal: 1 MiB; **sign-off** — a canonical default).
      *(The knob `POCKET_FIRST_MAX_BYTES` is shipped; its default equals
      `POCKET_MAX_BYTES`, i.e. no change. Sign-off on 1 MiB pending.)*
- [x] Tests: a tiny budget, 20 junk namespaces, 1 real namespace that was read
      → the real one survives.
- [x] README honesty section: *"a determined stranger can still fill the
      pocket; devices remain the spool's home."*

## Acceptance criteria

- The survival test passes *(done)*; the README knob table matches the code
  *(done)*; the canonical relay runs the agreed defaults *(pending: nothing
  is agreed yet — sign-off below — and no default changed)*.

## Notes / open questions

- **Shipped without changing a single effective default (relay lane,
  3 Sep 2026).** Three things: (1) eviction order — `ensureBudget` now
  picks its victim by (never-read first, then oldest `touchedAt`) via a
  small `evictsBefore(a, b)`; a namespace's `reads` is bumped on every GET
  that finds it. (2) `POCKET_NEW_NAMESPACES_PER_HOUR`, per `clientIp`
  (T-161), default 0 = off; checked *before* the body is read (a refused
  PUT costs nothing), recorded only when a first deposit is actually
  stored (a 400/413/507 burns no slot); 429 `too many new namespaces`
  (the SDK keeps a 429'd deposit pending and re-paces, same as the put
  bucket). (3) `POCKET_FIRST_MAX_BYTES`, the per-deposit cap while a
  namespace has `reads === 0`, `min()`'d with `POCKET_MAX_BYTES` and equal
  to it by default; the 413 body's `maxBytes` reports the cap in force.
- **Disk mode: the sidecar is `<room>/<token>/.reads`**, a plain decimal
  count written on every GET (fire-and-forget), read back at boot; the
  boot rescan now skips dotfiles when collecting tags, so the sidecar can
  never be served as a deposit (tags are 8 hex chars; the test proves the
  GET count after restart). Bonus that fell out: the sidecar's mtime is
  folded into `touchedAt` at boot, so **touch-on-read now survives a
  restart** — before, T-101 documented touch times restarting as deposit
  times, which silently shortened the 60-day courtesy for read-but-quiet
  spools across every deploy. Nothing about a namespace is logged.
- What this buys, honestly: a stranger now needs a GET per junk namespace
  to promote it past never-read (two requests instead of one), and with
  the creation cap on, N new namespaces an hour per address. Both are
  costs, not walls — hence the README sentence, verbatim from this ticket:
  *a determined stranger can still fill the pocket; devices remain the
  spool's home.* The eviction-order change is the one that protects real
  deposits in the common case: a real spool has been collected by someone;
  junk almost never has.
- **Sign-off pending (owner):** (a) `POCKET_FIRST_MAX_BYTES` — the ticket
  proposes 1 MiB. Trade-off to weigh: a writer who builds a big spool
  alone (a mixtape assembled for a week before sharing) would get 413 on
  every deposit until *someone* reads the namespace — their own reload
  counts, since the SDK fetches on open, so in practice it's one reload;
  but the SDK treats 413 as `depositError: 'too-big'` and stops, so the
  first cold-open of that spool from another device would find an empty
  pocket. (b) `POCKET_NEW_NAMESPACES_PER_HOUR` on the canonical relay — a
  value like 60 is invisible to a household and needs `TRUST_PROXY` first
  (T-161's flip). Neither is set anywhere; the canonical relay is
  untouched. This ticket stays `doing` until the owner decides both.
- Tests (`test/hardening.test.js`, 24/24 with the rest): survival (340 B
  budget, 67 B deposits, one collected namespace + twenty junk → the
  collected one survives as the stalest-touched of all, junk0 went first,
  junk19 remains, five deposits held); disk restart (`.reads` = `"2"`
  beside the deposits, no sidecar for a never-read namespace, and after a
  restart with a two-deposit budget the never-read namespace is the one
  evicted); creation cap (third new namespace from one forwarded address →
  429, re-deposit OK, other address OK, a 400'd PUT burns no slot);
  first-deposit cap (207 B → 413 with `maxBytes: 100`, 57 B OK, one GET,
  207 B OK; and on stock knobs a 2 MiB first deposit into a fresh
  namespace is accepted exactly as before). Lab note: the default test
  `deposit()` is 47 B (7 + 40), not the 67 B the older budget test's
  60-byte variant uses — my first cut of the arithmetic assumed 67 and
  two assertions failed for it; the relay was right both times.
- **Review at merge (3 Sep 2026), one limit said plainly:** a real deposit
  nobody has collected yet — the mixtape wound last night, not yet opened by
  the friend — ranks *with* junk in eviction order (never-read), and being
  older than a junk flood that arrived after it, it goes before the junk
  under budget pressure. Not worse than before (stalest-first did the same),
  but "never-read first" must not be read as "junk first": the order protects
  collected spools; the creation cap (off until `TRUST_PROXY`) is what
  protects the uncollected one.
- **5 Sep 2026 (sync-up):** the "off until `TRUST_PROXY`" caveat above is
  stale — T-161 turned `TRUST_PROXY` on in production on 3 Sep (`9ed7fdc`),
  so the creation cap has a real address to count. Nothing code-shaped
  remains here; the ticket is exactly two canonical-relay defaults away
  from done: `POCKET_FIRST_MAX_BYTES` (1 MiB, or leave it at the full cap)
  and `POCKET_NEW_NAMESPACES_PER_HOUR` (60 proposed, or leave it off). A
  "keep the shipped defaults" answer closes it with no keyboard step; either
  knob turned on is one `railway variables --set` and a restart.

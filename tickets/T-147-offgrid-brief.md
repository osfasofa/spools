---
id: T-147
title: "off-grid kit riffed → the vessel brief (docs/vessels/off-grid.md)"
status: done
milestone: M13
depends: [T-144]
---

## Goal

Build-order slot #2 gets the lore treatment: the no-internet story riffed
against shipped mechanics and landed as a brief the vessel repo starts
from.

## Context

Fourth M13 session (Aug 2026), while T-130 runs in a parallel instance
(this ticket deliberately touches no release files). The riff's findings:
the link's `relay=` makes a LAN address a first-class home for a spool
(the spec's "the link, not the client, decides"); the honesty clause
turns physical off-grid — *you can see your relay, it's the laptop on the
desk*; E2E means running the room's infrastructure grants no right to
read the rooms; `POCKET_DIR` makes the kit laptop the village archive;
and export → walk → import is a real third transport (sneakernet as CRDT
reconciliation, no clobber path).

## Tasks

- [x] docs/vessels/off-grid.md — claim, mechanism map, the shape (an
      archive + a field-manual README; QR as the link's LAN handshake;
      address honesty; clock-skew carried), register, refusals (no LAN
      discovery, no cloud fallback, no fleet manager), what it proves,
      open threads (name candidates: lantern / matchbox / waystation).
- [x] ECOSYSTEM.md — row + build-order link the brief; sneakernet claim
      added to the row.

## Acceptance criteria

- The brief stands alone and claims nothing untested beyond packaging:
  every mechanism cited (LAN relay=, ws: on LAN with sealed frames,
  pocket on disk, import-without-relay) is shipped SDK/relay behavior.
- file:// is never promised — the client serves over LAN per the ES-module
  reality recorded in the session guide.

## Notes / open questions

- The register call worth keeping: the README is the product as much as
  the archive — field-manual prose, printable, "a good camping checklist,"
  because the place with no internet is also the place with no docs site.
- Keyless spools are plaintext on a LAN wire; the kit README prescribes
  keyed spools rather than pretending TLS was ever the privacy layer.

---
id: T-167
title: "Static hosting: leave Vercel, fix the gh-pages 404 — sign-off, owner at keyboard"
status: doing
milestone: M15
depends: [T-160]
---
## Goal

The room and mixtape are hosted somewhere free, and every URL the docs cite
returns 200.

## Context

`chat.spools.lol` is a CNAME to Vercel; the team is on the **Pro** plan; the
deploy is prebuilt static (`scratch/deploy-room.sh`) and needs nothing Vercel
sells. The `gh-pages` branch still holds the mixtape at root and the room
under `/room/`, but both URLs 404 today — Pages was most likely disabled
around the "take lore off the public site" commit. README, WHITEPAPER, and the
M11 brief all cite those URLs as live (review finding F10). The
`osfasofa/spools-chat` repo the deploy script once named was never created;
the Vercel project `spools-chat` is, oddly, linked to the `lore` repo (harmless
— deploys are CLI-prebuilt).

The relay is **not** part of this ticket: it needs an always-on process with a
disk, which Vercel doesn't sell (its June 2026 WebSocket beta pins
connections to a function instance for at most 5–30 minutes and doesn't route
a room's members to the same instance; the relay's rooms are in-memory
fan-out). Railway stays; see docs/M15-ship-review.md §hosting.

## Options (owner decides)

- **A. GitHub Pages + custom domain.** Free. The deploy script already pushes
  `gh-pages`; add a `CNAME` file; DNS `chat → osfasofa.github.io`. Costs: no
  response headers (T-171's CSP becomes a `<meta>` tag with no
  `frame-ancestors`); the room lives at `/room/` unless the branch is
  restructured (room at root, mixtape under `/mixtape/`).
- **B. Cloudflare Pages.** Free; a `_headers` file gives T-171 real headers.
  One more provider on the bill of accounts, if not the bill of money.
- **C. Stay on Vercel, downgrade to Hobby.** Free if nothing on the team is
  commercial (Hobby's terms). Keeps `vercel.json` headers. The deciding
  question is whether any *other* project on the team needs Pro.

Recommendation: A or C. The relay hostname (T-160) lands first so this
ticket never touches links.

## Tasks

- [x] Owner picks; record the call here. *(C — stay on Vercel, downgrade to
      Hobby. 7 Sep 2026.)*
- [ ] Re-enable Pages (A), or move (B), or downgrade (C); DNS as needed.
      *(The downgrade is a billing action in the dashboard — owner at
      keyboard. No DNS change: the domain stays where it is.)*
- [ ] `deploy-room.sh`: keep the target that survives, delete the other half.
- [ ] Fix or drop the three doc citations of `osfasofa.github.io/spools/…`.
- [ ] If leaving Vercel: delete the `spools-chat` project.

## Acceptance criteria

- `chat.spools.lol` serves the current build from the chosen host.
- Every URL in README, WHITEPAPER, and docs/M11-room-brief.md returns 200.

## Notes

**Decided 7 Sep 2026: option C — stay on Vercel, downgrade the team to
Hobby.** "Leave Vercel" in this ticket's title was always about leaving the
*paid plan*, not the provider: the ship review's own sentence is "Vercel's
own Hobby tier does for free if nothing on the team is commercial." The
owner confirmed nothing on the team is commercial, and then, plainly, not
to leave Vercel.

**What the review's framing got wrong by the time we looked (checked 7 Sep):**

- **The 404 half was already fixed.** `chat.spools.lol`, the gh-pages root
  and `/room/` all return 200 — Pages is on, and T-177's deploy refreshed
  the last two. So this ticket was never a repair; it was a bill.
- **There is no `apps/room/vercel.json`.** The live response carries only
  Vercel's default HSTS, so option C does not "keep `vercel.json` headers" —
  nothing is set today. All three options were equally header-less; the real
  difference was only whether T-171 *could* set real ones.
- **Five projects on the Pro team** — `spools-chat`, `blackpeople-lol`,
  `spools.lore`, `tape-vibes`, `souls-guru` — so the plan is an account-wide
  decision, not a spools one. Worth knowing: `spools-chat` is still linked to
  the `lore` GitHub repo (harmless; deploys are CLI-prebuilt), as this
  ticket's Context already noted.
- **Hobby keeps the custom domain.** Vercel's docs put the Hobby limit at 50
  custom domains per project; the `custom_domain_needs_upgrade` error and the
  "free domain" perk are about *registering* a domain through Vercel, not
  attaching one you already own. So `chat.spools.lol` needs no DNS change and
  no re-verification.

**Why C over A and B, on the record.** A (GitHub Pages alone) is the
tempting one — half of it already runs, the deploy script pushes `gh-pages`
every time — but it permanently forecloses response headers, which costs
T-171 its `frame-ancestors` and would cost T-177's option 3 its rewrite. B
(Cloudflare Pages) buys real headers for free but adds a provider to the
bill of accounts and a second deploy path to keep working, for something
Vercel already does. C costs one billing click and changes nothing else.

**The costs of C, stated:** Hobby forbids commercial use going forward — if
any of those five projects ever monetizes, the team goes back to Pro
(`vercel buy pro`, reversible). Hobby also allows no team members, so a
collaborator means Pro again. Neither is load-bearing for spools today.

**Keyboard step left (owner):** Vercel dashboard → the `osfasofa's projects`
team → Settings → Billing → change plan to Hobby. Nothing else moves: the
deploy script, `apps/room/.vercel`, the DNS record, and the domain all stay
as they are. This ticket stays `doing` until that lands and its Notes say so
— the T-168 precedent, and the M12 lesson that the record lags the keyboard.

**For T-171, which this unblocks now.** The header mechanism is settled as
`vercel.json`, and it does not depend on the plan — Hobby and Pro both serve
it — so T-171 can start before the downgrade happens. One wrinkle to decide
there, not here: the room is served from **two** hosts, and the gh-pages
mirror can never carry real headers. Either T-171 accepts the split (real
headers on chat.spools.lol, a `<meta>` CSP with no `frame-ancestors` on the
mirror) or the mirror gets demoted to a fallback the docs stop citing.


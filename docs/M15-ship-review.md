# M15 — the ship review (the hardening)

*Design record, 3 Sep 2026. The owner asked for a hardcore product, technical,
security, legal, and ethics read of this repo and the live room, to decide
between private, public, hand-to-many, and one-at-a-time. This file is the
in-repo record of that review; the rail it produced is M15 in
[tickets/INDEX.md](../tickets/INDEX.md). Nothing here is protocol-shaping; the
sign-off items are conventions and canonical-relay defaults, each with its
trade-offs in its ticket.*

## The verdict

**Keep it public. Don't promote it. Hand it out one room at a time, to groups
who already trust each other.** That is the only distribution model under
which the security model is true: the link is total power, so the trust
boundary is the group, and a group is what you hand a link to.

| Question | Answer | Why |
|---|---|---|
| Make it private? | No. | MIT on npm and GitHub; the manifesto forbids the opposite of open. The code stays public; the front door stays unlisted. |
| Make it public? | It already is. | The live question is promotion: no launch, no post, no listing. Hand-to-hand is the brand's rule and the threat model's assumption. |
| Give it to people? | Yes, keep going. | After the "before the next handful" rail, always with the three sentences said out loud. |
| A lot of people? | Not yet. | The no-permissions model only holds inside pre-existing trust; the relay is a soft target shared by four apps; every link minted so far pins a hostname Railway owns. |
| One at a time? | One room at a time. | The unit is a group, not a person. |

## What holds

The cryptography is textbook (secretbox, random 24-byte nonces per frame /
row / deposit, key from `getRandomValues`, domain-separated pocket token,
three magic-byte envelope families, wrong keys fail loud). Sealing sits below
the y-protocols layer, so presence is ciphertext on the wire — tested, not
asserted. The relay is blind by construction and a test enforces it. The live
bundle carries one relay URL and zero trackers. 120 tests green, dependency
audit clean, registry matches the repo, no keyed links in the git history.

## Findings → tickets

| # | Sev | Finding | Ticket |
|---|---|---|---|
| F1 | high | Every link minted pins `spools-relay-production.up.railway.app`, a hostname we don't own; `relay.spools.lol` has no DNS. | T-160 |
| F2 | high | The pocket's per-IP rate limit keys on `remoteAddress`, which behind Railway's proxy is the proxy: one global 24/min bucket, trivially starved. | T-161 |
| F3 | med | Budget eviction is stalest-first and namespaces are free to create: one address can evict every real deposit in minutes. | T-168 |
| F4 | med | 64 sockets per room, no per-IP cap, codes are public; the 65th connection spins instead of erroring. | T-169 |
| F5 | med | No `bufferedAmount` backpressure; 8 MiB junk frames fan out ×63. | T-170 |
| F6 | med | The key leaks via browser sync and non-E2E messengers; "never sent to any server" is true of ours only. | T-165 |
| F7 | med | "Remove" is a soft hide anyone can restore; MANIFESTO §2 says no delete that doesn't delete. | T-162 |
| F8 | med | The room has no Export and no Forget; §1 calls them first-class. | T-163 |
| F9 | low | Google Fonts phones home on every load (constitution #6; LG München 2022). | T-166 |
| F10 | low | README, WHITEPAPER, M11 brief cite gh-pages URLs that 404. | T-167 |
| F11 | low | No CSP / Referrer-Policy / nosniff / frame-ancestors on chat.spools.lol. | T-171 |
| F12 | low | "renamed by anonymous", always — the renamer's seat isn't stamped. | T-172 |
| F13 | low | Notifications carry message text into OS history. | T-173 |
| F14 | note | Seats and audit trails are self-declared; say so if strangers ever arrive. | T-174 |
| F15 | note | No forward secrecy, no revocation. Documented; keep saying it. | — |
| F16 | note | No "start over without them" gesture for ETHOS rule 10's exception. | T-164 |
| F17 | med | The WebRTC path asks Google's and Twilio's STUN for the visitor's address on every keyed open (simple-peer defaults; confirmed in the live chunk). Unmentioned in any honesty clause. | T-175 |
| F18 | med | `crypto.randomUUID()` and the Clipboard API are secure-context only; a plain-http LAN client throws on the first wind. The off-grid brief doesn't know. | T-176 |
| F19 | — | Links are ~150 chars, mostly the encoded relay param. Prettier is possible; a namer service is refused. | T-177 |
| — | legal | No honesty page on the web, no abuse contact; the host may log pocket paths. | T-174 |

## Hosting — Railway or Vercel?

The relay needs one always-on process with a disk: rooms are in-memory fan-out
(every member of a room must be on the same process) and the pocket is files.
Vercel's WebSocket beta (June 2026) pins a connection to a function instance
for 5 minutes by default (30 on Pro, in beta) and does not route later
connections to the same instance, so a room's members would land on different
instances and never meet without a Redis bus between them — more moving parts
and more money than the one small box the relay is. **Vercel cannot be the
relay; Railway (or Fly, or a small VPS) stays.** What Vercel *is* doing for
spools is serving prebuilt static files, which GitHub Pages or Cloudflare
Pages do for free, or Vercel's own Hobby tier does for free if nothing on the
team is commercial. The team is on Pro today. T-167 holds the options.
T-160 goes first regardless: with an owned relay hostname a provider move is
a DNS change; without it, a move strands every link.

## Are we peer-to-peer?

Partly, and the docs say so honestly. Content flows browser-to-browser over
WebRTC when it connects (y-webrtc, sealed with the link's key); the relay is
always the meeting point (signaling), and the websocket path is the reliable
fallback where the relay forwards ciphertext. Over the internet it works
today, with two gaps: the WebRTC attempt reveals the visitor's address to
Google's and Twilio's STUN servers (F17), and there is no TURN, so strict NATs
fall back to the relay (by design). On a LAN with no internet — the most
differentiated thing this project can do — WebRTC works *best* (host
candidates, no STUN needed), but the shipped code has two secure-context
landmines (F18). Fix those and the off-grid kit is, as its brief says,
packaging and prose.

## Prettier links

Four honest levers, one refusal — see T-177. The refusal, recorded: no
server-side namer or short-link service, because it would hold keys or the
mapping to them, and a directory is a feed in a trenchcoat. The client-side
"pick your two words" is the namer that fits: the grammar already allows it.

## Ethics, held against its own manifesto

Promises kept: relay blindness is a test; no accounts, feed, analytics, or
growth loop; the bare URL mints a fresh private room per visitor, so the
public address can be dropped as bait without ever putting strangers in a
room together; ephemera never persist. Promises the labels outrun: remove
(F7), export/forget (F8), phone-home (F9, F17), "never sent to any server"
(F6), the 404'd URLs (F10). Tensions the design must own out loud: no
recourse against a bad actor (the remedy is a new room — F16); permanence
versus regret (every copy keeps everything; the fine print should say so);
retroactive renaming as a weapon (a bit is allowed only on people who are in
on it, which is why distribution stays hand-to-hand); the operator is in the
friend group (keep "run your own relay" one click away, never add logging).

## The rails

**Before the next handful:** T-160, T-161, T-162, T-163, T-165 (the sentence),
T-166, T-167 (the 404s at least), T-176 (the UUID fallback).
**Before it goes wider:** T-143, T-174, T-168, T-169, T-170, T-171, T-164,
T-165 (the decision), T-175, T-177, T-125's hardware pass.
**Never, and the manifesto agrees:** accounts, a moderation backend,
analytics, a launch, server-side plaintext, a permission system the relay
can't enforce.

## What was checked

Every top-level doc, the full SDK/relay/keeper source, every file in
`apps/room/src`, the brand repo. Ran `pnpm -r test` (107 + 12 + 1 green) and
`pnpm audit --prod` (clean). Probed chat.spools.lol headers and the live
bundle, the relay's health JSON, the gh-pages URLs, DNS for `spools.lol`,
`chat.` and `relay.`, the Vercel team's project list. Not done: any write to
production; any load test against the live relay. The F2 proxy claim rests on
Railway's documented behavior and the relay source, not on a production log
line — T-161 confirms it first.

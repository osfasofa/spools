# Handoff: Spools Room Client (M11)

## Overview
Mobile-first group chat UI for the `spools` SDK — the M11 "room" milestone. Messenger-class UX (left/right bubbles, reactions, inline replies, presence, read receipts) with a token-driven skin system. Aesthetic: near-monochrome white-on-black, hard edges, no rounded-pill softness, mono type reserved for machine-ish things. Dry, minimal copy.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code. The task is to **recreate them in `apps/room`** (Vite + React, `base: './'`, forked from the mixtape's `useSpool` pattern, per the M11 brief §6). Do not ship the HTML.

## Fidelity
**High-fidelity.** Colors, spacing, radii, and type below are final. Recreate pixel-perfectly.

## Design Tokens — the core deliverable
The UI must never hard-code a color, font, or radius. Everything reads 8 CSS custom properties + a radius scalar. A theme = one set of values, stored per device in `localStorage` (key precedent: `spool-view`, app.js:81). Themes sync nothing.

| token | blackout (default) | terminal | daylight | paper |
|---|---|---|---|---|
| `--bg` (page) | `#000000` | `#0A0D0A` | `#FAFAF7` | `#F4EEE1` |
| `--sf` (surface: bubbles-them, inputs, cards) | `#161616` | `#141B13` | `#EFEFEA` | `#EAE1CD` |
| `--tx` (text) | `#F2F2F2` | `#D9E7D9` | `#171717` | `#29221A` |
| `--dim` (secondary text) | `#9A9A9A` | `#7A8C7A` | `#6E6E6A` | `#6F6355` |
| `--ac` (accent: bubbles-mine, send, dots) | `#D6D6D6` | `#00E653` | `#0B8F3C` | `#C9553E` |
| `--acTx` (text on accent) | `#0D0D0D` | `#04220E` | `#FFFFFF` | `#FFF6EC` |
| `--ln` (hairlines/borders) | `#1F1F1F` | `#1B231B` | `#E3E3DE` | `#D9CFB8` |
| `--bodyfont` (message bodies) | system sans | JetBrains Mono | system sans | Georgia/serif |

- Radius scalar: **6px** default, **1px** "tail" corner (see Bubbles). Skinnable 0–18px.
- *(T-122 note: as built, four values are minimally darkened to satisfy this document's own WCAG AA rule below, which the literal values missed at 14px body size — daylight `--dim` `#6D6D69`, `--ac` `#0B893A`; paper `--dim` `#6E6254`, `--ac` `#BB4F3A`. Measured 4.05–4.44 before, ≥4.5 after; visually near-identical.)*
- Font stacks: sans `-apple-system,system-ui,'Helvetica Neue',sans-serif`; mono `'JetBrains Mono',ui-monospace,monospace`; serif `ui-serif,'Iowan Old Style',Georgia,serif`.
- Every theme must pass **WCAG AA** for text + essential UI (T-122 acceptance criterion).
- Skins change tokens, never layout.

## Typography
- Headers: system sans, weight 800, 16px (room header) / 24px (stash title), letter-spacing -0.01em, lowercase.
- Message bodies: `--bodyfont`, 400, 14px, line-height 1.4.
- Sender name: sans 600, 10.5px, `--dim`; timestamp beside it: mono 9px.
- Section labels (settings): mono 10px, uppercase, letter-spacing .14em, `--dim`.
- Meta/seat ids/links/labels: mono 9–12px. **Mono is reserved for machine-ish things** (timestamps, seat ids, labels); human words get `--bodyfont`.

## Screens / Views

### 1. Room feed (main)
Layout: full-height column — header (hairline bottom) → optional people drawer → scrollable feed (padding 12px 14px) → composer (hairline top). Feed opens pinned to newest message and follows new ones.
- **Header**: back chevron ‹ (44px hit target, `--dim`), room name (800/16px, tap → settings), presence line below (11px `--dim`): 6px accent dot + "3 active ▼", tap toggles the people drawer. "⋯" (44px) also → settings.
- **People drawer** (collapsed by default): slides out under header (150ms ease-out fade/slide). Horizontal row, 18px gap: 30px seat tile + name (9.5px `--dim`) per person; 9px accent dot bottom-right of tile when online; offline seats at 45% opacity; typing shows "typing…" as the label. Tap anywhere to collapse.
- **Message rows**: max-width 80%. Others left, mine right.
  - Others: sender line (name 600 10.5px `--dim` + mono 9px time, left padding 34px) on group start; 20px seat tile bottom-aligned beside the **last** bubble of a group; 26px spacer column otherwise.
  - Group spacing: 10px before a group start, 2px within a group.
- **Bubbles**: padding 9px 13px, 14px/1.4 `--bodyfont`. Them: `--sf`/`--tx`. Mine: `--ac`/`--acTx`. Corners: 6px all, except the group-end corner nearest the sender = 1px (bottom-left for them, bottom-right for mine).
- **Reply quote** (inside bubble, above body): 11px, 75% opacity, "name: snippet…" (snippet truncated ~34 chars), separated by 1px bottom border (`--ln`; on my bubbles `rgba(0,0,0,.18)`), 6px padding-bottom, 7px margin-bottom.
- **Reactions**: chips under the bubble, aligned to its side. Chip: emoji + count (10px), padding 2px 8px, radius 4px, bg `--sf`, border 1px `--ln` — accent border when I reacted. Tap toggles mine.
- **Read receipts**: row of 9px solid seat-color squares (radius 2px), right-aligned under the last message each participant has seen. One marker per participant, never per message.
- **Edited marker**: " · edited" 9px, 55% opacity, inline after body.
- **Hidden** *(T-162 wording note — was "Removed"/"removed")*: bubble keeps its slot; italic 12px 60% opacity "hidden · anyone can restore".
- **System line**: centered 10.5px `--dim`, e.g. `nadia renamed z44d to "the intern"`.
- **Day divider**: centered mono 10px `--dim`, letter-spacing .08em, "today".
- **Typing indicator**: left-side bubble (`--sf`, radius 6/6/6/1) with three 6px bouncing dots (1.1s loop, 0.15s stagger) + 20px seat tile.
- **Composer**: input flex-1, `--sf` bg, 1px `--ln` border, radius 6px, 14px text, padding 12px 16px, min-height 44px, placeholder "Message". Send: 44×44px, radius 6px, `--ac` bg, `--acTx` "↑" 18px/700. Reply/edit banner rides above as one dismissible 11px line with ✕.

### 2. Stash (spool list)
Title "stash" 800/24px. Rows (min 44px, hover `--sf`): 40px room tile (initial), name 700/14px + mono 10px time right, snippet 12px `--dim` below, accent unread badge (10px/700, pill) when unread. Below list: full-width accent button "+ new spool" (radius 10px) and a centered mono input "paste a link".

### 3. Settings
Back header. Sections spaced 24px, each with a mono uppercase label:
- **name** — text input (shared room name); caption "named by nadia · anyone can rename it" (newest wins).
- **people** — one row per seat: 20px tile, editable name input, mono seat id `#k7f2` (+ " · you"). Caption: "anyone can rename anyone — it applies everywhere".
- **theme** — 2×2 grid of cards, each rendered in its own theme's bg/tx with 3 swatch dots (ac/tx/dim) and label; 2px accent border on the active one. Caption: "yours only — themes don't sync".
- **link** — truncated mono link + "copy" button (border `--ln`, accent on hover). Caption: "the link is the key — share it with people you trust".
- **fine print** — surface card, 12px/1.6: "anyone with the link can edit or delete anything. no push, no server that knows you. rewind never forgets."

### 4. Message action sheet
Bottom sheet over rgba(0,0,0,.55) backdrop (fade 150ms, sheet slides up 180ms). Radius 18px top. Content: dim preview line ("name — snippet"), quick-react row (👍 😆 💀 🔥 ❤️ as 46px tiles, radius 12px, accent border on hover), then Reply / Edit / Hide rows (44px, hairline-separated; T-162: the hide row reads "✕ hide for everyone", tombstones offer "↺ restore"). No emoji picker — the OS keyboard is the picker; the quick row is just recents.

### 5. Arrival states
Full-screen overlay in `--bg`, mono 12.5px lines appearing sequentially (~550ms apart) with a blinking accent block cursor; tap to skip: `checking the pocket…` → `catching up…` → `connected — 2 others here`. Never show a bare empty state that looks like data loss.

## Seat identity (visual)
- **Seat tile**: sharp square (radius 2px), 1.5px border + initial in the seat's color, transparent fill. Initial = first letter of the current display name, uppercase, mono 700, font-size ≈ 50% of tile.
- **Seat color**: `palette[hash(seatId) % 6]` where palette = `#00E653 #FF6A2B #4DC4FF #C79BFF #FFD43B #FF8FB3`. Stable through renames — duplicate nicknames stay legible without uniqueness rules.
- Read-receipt marker: 9px solid square in the seat color.

## Interactions & Behavior
- Tap bubble → action sheet. Reply/Edit prefill the composer banner; Enter or ↑ sends.
- Edit rewrites the entry **body** (bodies are mutable, metadata write-once) and shows "· edited". Hide (T-162; was "Remove") = soft delete (`deletedAt`), leaves the "hidden · anyone can restore" tombstone. Anyone can edit/hide anything — that's the honest contract, stated once in settings, never a surprise dialog.
- *Wording note (T-162, from the M15 ship review):* no user-facing string says remove/removed. The mechanism is a soft hide anyone can restore from the same sheet, present in every peer's copy and in `rewind()` forever — MANIFESTO §2 forbids a delete that doesn't delete, so the label says what the button does. The first hide on a device adds one line under the feed, once (localStorage `room-hide-explained`): "this hides it everywhere, but every copy keeps it and rewind still shows it."
- Renames (room or person) are live inputs, no save button; newest-wins at render.
- Theme pick applies instantly, persists to localStorage.
- Feed: pin to bottom on open and on new messages. Use a mount/update split so rerenders never eat composer focus (T-030 trap).

## State Management (mapping to the SDK — M11 brief §6)
- message → `wind({ kind:'message', body, data:{ seat }, parent? })`
- nickname → `wind({ kind:'room:profile', body: name, data:{ seat: target } })`, newest wins per seat, resolved at render — **never denormalize a name into a message**
- room name → `wind({ kind:'room:name', body })`, newest wins
- seen → ~~one `room:read` entry per seat, body rewritten under the T-110 throttle~~ **superseded (T-110, Aug 2026): ephemeral awareness-only** — "seen" rides the awareness `room` field beside typing; nothing about reading is wound into the doc (the body-rewrite cursor measured quadratic; DESIGN_DOC §5 M11 mutable-state row). The read-receipt *visuals* above are unchanged
- presence/typing → awareness (`room` field), sealed; keyed to peers, never `synced`; typing debounced hard
- theme → localStorage only; not an entry, never synced
- Render from `spool.entries` then subscribe (no event replay on load). Normalize emoji variants before grouping reactions (👍 vs 👍🏽).

## Assets
None. No icon font, no images — glyphs are text characters (‹ ⋯ ↑ ✕ ▼ ↩) and CSS shapes. JetBrains Mono via Google Fonts (400/500/700); body sans is the system stack.

## Files
- `Spools Room v2.dc.html` — the approved interactive prototype (all screens + behaviors).
- `Spools System.dc.html` — the design-system one-pager (tokens, type, parts, rules).
- `Spools Room.dc.html` — earlier flush-row/IRC direction, kept for reference only.
- `ios-frame.jsx`, `support.js` — prototype scaffolding (device frame + runtime), not part of the design.

Prototype demo copy (names, "midnight picnic", message content) is placeholder. UI copy that IS the design: "Message", "hidden · anyone can restore" (T-162; was "removed"), "· edited", the arrival lines, the fine-print sentence, the settings captions.

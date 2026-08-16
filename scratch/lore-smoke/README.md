# lore smoke drivers (M14)

The scripted verification suite behind apps/lore/TESTING.md's checked rows.
Playwright-core + headless Chromium (fake mic/display), written against
`python3 -m http.server 8765` in `apps/lore` — and for `test-sync.mjs`, a
local relay (`PORT=9876 node packages/spools-relay/server.js`) plus
`python3 -m http.server 8767` in `apps/` for the reference-client row.

    npm i playwright-core   # anywhere; set executablePath to your Chromium
    node test-store.mjs     # reel store: dedup, courier verify, peaks
    node test-tape.mjs      # playback physics, ghosts
    node test-record.mjs    # punch in/out on the fake mic
    node test-feel.mjs      # varispeed, scrub grains, spooling
    node test-cut.mjs       # cut/mend/saying/gloss through the real UI
    node test-bake.mjs      # offline mixdown + pack/unpack round trip
    node test-import.mjs    # file sourcing (needs grandma-392.wav — any wav)
    node test-telling.mjs   # told-time log + playable memory (~20 s: moment debounce)
    node test-sync.mjs      # two devices, local relay, both ways
    node shot.mjs <url> <png>   # screenshot + console-error probe
    node hero.mjs           # stage a lived-in reel for screenshots

Container notes that cost an hour, recorded in TESTING.md: sandbox proxies
may eat WebSocket CONNECT (pass --no-proxy-server for localhost work), and a
link's relay URL carries its path (`…/yjs`) — a bare host lands on the
signaling endpoint forever `connecting`.

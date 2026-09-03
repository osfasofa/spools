---
id: T-171
title: "Security headers on the room"
status: todo
milestone: M15
depends: [T-166, T-167]
---
## Goal

CSP, Referrer-Policy, nosniff, and frame-ancestors on chat.spools.lol.

## Context

Only HSTS today (Vercel's default). React escapes rendered text; CSP is what
bounds the blast radius if that ever changes, and the key sits in the page's
address. `connect-src` must stay `wss: https:` because the link decides the
relay. Review finding F11. Mechanism depends on T-167's host: `vercel.json`
(Vercel), `_headers` (Cloudflare), or a `<meta http-equiv>` tag (GitHub
Pages — no `frame-ancestors` possible there).

## Tasks

- [ ] Policy: `default-src 'self'; script-src 'self'; style-src 'self'
      'unsafe-inline'` (seat colors are inline styles — or hash them);
      `img-src 'self' data:` (the favicon badge is a data URL);
      `connect-src 'self' wss: https:`; `font-src 'self'`;
      `frame-ancestors 'none'`.
- [ ] `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`,
      `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- [ ] Run the smoke suite against the deployed build with the policy live.

## Acceptance criteria

- `curl -I https://chat.spools.lol/` shows the headers (or the meta tag is
  present, on Pages); room works end to end.

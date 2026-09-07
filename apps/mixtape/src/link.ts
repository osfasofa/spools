/**
 * What a link handed out of this tape looks like (T-177, option 2 —
 * DESIGN_DOC §5 "Link shape").
 *
 * `relay=` is dropped when it is the SDK's own default: the client opening
 * it falls back to that same host, so the link means the same thing about
 * 25 characters shorter — and it pins no hostname, which makes moving the
 * canonical relay a client redeploy rather than a stranded link. A tape on
 * any other relay keeps carrying it: there the fallback would land the
 * people it was handed to somewhere else (SPEC §1 — "the link, not the client, decides where
 * a spool lives", and links SHOULD carry `relay` for exactly that reason).
 *
 * Only what leaves this app is shortened. `spool.share()` — what the SDK
 * stamps into the stash — keeps the relay, so a bare reload still resolves
 * through the stash to a fully pinned link (T-165).
 *
 * (Prose and code copied from apps/room, per the apps' rule: they copy each
 * other, they never import each other.)
 */
import { DEFAULT_RELAY, buildSpoolLink, parseSpoolLink } from 'spools'

/** the relay to put in a link built here — undefined when the fallback says the same thing */
export const carriedRelay = (relay: string | undefined): string | undefined =>
  relay && relay !== DEFAULT_RELAY ? relay : undefined

/** shorten a link the SDK built (`spool.share()`) for handing to a person */
export const handOut = (link: string): string => {
  const { code, relay, key } = parseSpoolLink(link)
  const hash = link.indexOf('#')
  return buildSpoolLink({
    code,
    relay: carriedRelay(relay),
    key,
    base: hash >= 0 ? link.slice(0, hash) : undefined,
  })
}

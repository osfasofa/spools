/**
 * Spool identity: codes, keys, and the one link shape.
 *
 *   https://anyhost.example/#spool=<code>&relay=<wss-url>&k=<key>
 *
 * Exactly one grammar — fosho's format sniffing (note.ts:241) is the
 * cautionary tale. The fragment never reaches a server; the key rides there.
 * Zero dependencies.
 */

/** adjective-noun-NNN. ~2.5M combos: a rendezvous name, not a security boundary — the key is the secret. */
const CODE_PATTERN = /^[a-z]+-[a-z]+-\d{3}$/

// prettier-ignore
const ADJECTIVES = [
  'amber', 'analog', 'brave', 'calico', 'candid', 'cedar', 'chrome', 'cobalt',
  'copper', 'crooked', 'dusty', 'faded', 'foggy', 'gentle', 'gilded', 'groovy',
  'hazel', 'hidden', 'hollow', 'humble', 'indigo', 'ivory', 'jade', 'lucid',
  'lunar', 'mellow', 'midnight', 'minor', 'misty', 'mossy', 'muted', 'neon',
  'nimble', 'ochre', 'olive', 'opal', 'paper', 'pearl', 'quiet', 'rusty',
  'sable', 'sepia', 'silver', 'slate', 'sleepy', 'tidal', 'umber', 'velvet',
  'violet', 'wistful',
]

// prettier-ignore
const NOUNS = [
  'anchor', 'arrow', 'atlas', 'attic', 'bell', 'bloom', 'booth', 'bridge',
  'cabin', 'canyon', 'cassette', 'cellar', 'cinder', 'circuit', 'comet',
  'creek', 'crow', 'deck', 'drift', 'dune', 'echo', 'ember', 'fern', 'flare',
  'fox', 'garden', 'groove', 'harbor', 'heron', 'island', 'kite', 'lantern',
  'ledger', 'marble', 'meadow', 'moth', 'needle', 'nova', 'orchard', 'otter',
  'parlor', 'pine', 'prism', 'quill', 'raven', 'ribbon', 'river', 'signal',
  'sparrow', 'willow',
]

export class SpoolLinkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpoolLinkError'
  }
}

export const generateCode = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${adjective}-${noun}-${number}`
}

export const isValidCode = (code: string): boolean => CODE_PATTERN.test(code)

/** URL-safe unpadded base64 (fosho encryption.ts) */
export const encodeKey = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export const decodeKey = (str: string): Uint8Array => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '==='.slice(0, (4 - (base64.length % 4)) % 4)
  let raw: string
  try {
    raw = atob(padded)
  } catch {
    throw new SpoolLinkError(`the k= key is not valid base64: ${str.slice(0, 12)}…`)
  }
  const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0))
  if (bytes.length !== 32) {
    throw new SpoolLinkError(`the k= key must decode to 32 bytes, got ${bytes.length}`)
  }
  return bytes
}

export const generateKey = (): Uint8Array => crypto.getRandomValues(new Uint8Array(32))

export interface ParsedLink {
  code: string
  relay?: string
  key?: Uint8Array
}

/**
 * Accepts a full URL, a bare fragment (`#spool=…` / `spool=…`), or a bare
 * code. Returns only what the link actually says — defaults (relay) are
 * applied by openSpool, not here, so parse/build round-trip cleanly.
 */
export const parseSpoolLink = (input: string): ParsedLink => {
  const trimmed = input.trim()
  if (trimmed === '') throw new SpoolLinkError('empty link')

  if (isValidCode(trimmed)) return { code: trimmed }

  const hashAt = trimmed.indexOf('#')
  const fragment = hashAt >= 0 ? trimmed.slice(hashAt + 1) : trimmed
  if (!fragment.includes('spool=')) {
    throw new SpoolLinkError(
      `not a spool link (no spool= in the fragment, and not a bare code): ${trimmed.slice(0, 40)}`
    )
  }

  const params = new URLSearchParams(fragment)
  const code = params.get('spool')
  if (!code || !isValidCode(code)) {
    throw new SpoolLinkError(`bad spool code in link: ${code ?? '(missing)'}`)
  }

  const parsed: ParsedLink = { code }
  const relay = params.get('relay')
  if (relay) {
    if (!/^wss?:\/\//.test(relay)) {
      throw new SpoolLinkError(`relay must be a ws:// or wss:// URL, got: ${relay.slice(0, 40)}`)
    }
    parsed.relay = relay
  }
  const k = params.get('k')
  if (k) parsed.key = decodeKey(k)
  return parsed
}

export interface BuildLinkInput {
  code: string
  relay?: string
  key?: Uint8Array
  /** page that hosts the client; default: current page in browsers, bare fragment elsewhere */
  base?: string
}

export const buildSpoolLink = ({ code, relay, key, base }: BuildLinkInput): string => {
  if (!isValidCode(code)) throw new SpoolLinkError(`bad spool code: ${code}`)
  const params = new URLSearchParams({ spool: code })
  if (relay) params.set('relay', relay)
  if (key) params.set('k', encodeKey(key))
  const prefix =
    base ??
    (typeof location !== 'undefined' ? location.origin + location.pathname : '')
  return `${prefix}#${params.toString()}`
}

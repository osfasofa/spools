import { describe, expect, it } from 'vitest'
import {
  buildSpoolLink,
  decodeKey,
  encodeKey,
  generateCode,
  generateKey,
  isValidCode,
  parseSpoolLink,
  SpoolLinkError,
} from './link'

describe('codes', () => {
  it('generates valid codes', () => {
    for (let i = 0; i < 200; i++) expect(isValidCode(generateCode())).toBe(true)
  })

  it('rejects malformed codes', () => {
    for (const bad of ['', 'Nope-nope-123', 'one-two', 'one-two-12', 'one-two-1234', 'a_b-c-123', '@name', 'x'.repeat(200)]) {
      expect(isValidCode(bad), bad).toBe(false)
    }
  })
})

describe('keys', () => {
  it('round-trips 32 bytes through url-safe unpadded base64', () => {
    const key = generateKey()
    const encoded = encodeKey(key)
    expect(encoded).not.toMatch(/[+/=]/)
    expect(decodeKey(encoded)).toEqual(key)
  })

  it('rejects wrong-length and garbage keys', () => {
    expect(() => decodeKey('AAAA')).toThrow(SpoolLinkError)
    expect(() => decodeKey('!!!not-base64!!!')).toThrow(SpoolLinkError)
  })
})

describe('parse/build round-trip', () => {
  const key = generateKey()
  const full = { code: 'quiet-harbor-042', relay: 'wss://relay.example/yjs', key }

  it('full URL form', () => {
    const link = buildSpoolLink({ ...full, base: 'https://client.example/app' })
    expect(link).toMatch(/^https:\/\/client\.example\/app#spool=/)
    expect(parseSpoolLink(link)).toEqual(full)
  })

  it('bare fragment form', () => {
    const link = buildSpoolLink({ ...full, base: '' })
    expect(link.startsWith('#spool=')).toBe(true)
    expect(parseSpoolLink(link)).toEqual(full)
  })

  it('code + relay, no key', () => {
    const input = { code: 'misty-groove-777', relay: 'ws://localhost:4444' }
    expect(parseSpoolLink(buildSpoolLink({ ...input, base: '' }))).toEqual(input)
  })

  it('bare code form', () => {
    expect(parseSpoolLink('quiet-harbor-042')).toEqual({ code: 'quiet-harbor-042' })
    expect(parseSpoolLink('  quiet-harbor-042  ')).toEqual({ code: 'quiet-harbor-042' })
  })

  it('relay URL survives URL-encoding', () => {
    const link = buildSpoolLink(full)
    expect(link).toContain('relay=wss%3A%2F%2Frelay.example%2Fyjs')
  })
})

describe('garbage in', () => {
  it.each([
    ['empty', ''],
    ['whitespace', '   '],
    ['random prose', 'hello there friend'],
    ['url without fragment', 'https://example.com/page'],
    ['fragment without spool', '#n=old-fosho-format&k=abc'],
    ['bad code in fragment', '#spool=NOT_A_CODE'],
    ['http relay', '#spool=quiet-harbor-042&relay=https%3A%2F%2Fevil.example'],
    ['truncated key', '#spool=quiet-harbor-042&k=AAAA'],
  ])('%s → SpoolLinkError', (_name, input) => {
    expect(() => parseSpoolLink(input)).toThrow(SpoolLinkError)
  })

  it('build rejects bad codes', () => {
    expect(() => buildSpoolLink({ code: 'Bad Code', base: '' })).toThrow(SpoolLinkError)
  })
})

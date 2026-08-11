import { describe, expect, it } from 'vitest'
import { NONCE_LENGTH, decrypt, encrypt, keyFingerprint } from './crypto'
import { generateKey } from './link'

const msg = () => new TextEncoder().encode('hello, sealed world')

describe('crypto primitives (M5)', () => {
  it('round-trips', () => {
    const key = generateKey()
    const out = decrypt(encrypt(msg(), key), key)
    expect(out).not.toBeNull()
    expect(new TextDecoder().decode(out!)).toBe('hello, sealed world')
  })

  it('wrong key fails (null, not garbage)', () => {
    expect(decrypt(encrypt(msg(), generateKey()), generateKey())).toBeNull()
  })

  it('tampering fails: any flipped byte kills authentication', () => {
    const key = generateKey()
    const sealed = encrypt(msg(), key)
    for (const index of [0, NONCE_LENGTH, sealed.length - 1]) {
      const tampered = sealed.slice()
      tampered[index]! ^= 0x01
      expect(decrypt(tampered, key)).toBeNull()
    }
  })

  it('truncation fails cleanly', () => {
    const key = generateKey()
    expect(decrypt(encrypt(msg(), key).slice(0, 10), key)).toBeNull()
    expect(decrypt(new Uint8Array(0), key)).toBeNull()
  })

  it('nonces are fresh: same plaintext seals differently', () => {
    const key = generateKey()
    expect(encrypt(msg(), key)).not.toEqual(encrypt(msg(), key))
  })

  it('fingerprint: 8 chars, stable per key, distinct across keys', () => {
    const key = generateKey()
    expect(keyFingerprint(key)).toHaveLength(8)
    expect(keyFingerprint(key)).toBe(keyFingerprint(key))
    expect(keyFingerprint(key)).not.toBe(keyFingerprint(generateKey()))
  })
})

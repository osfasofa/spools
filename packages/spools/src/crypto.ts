/**
 * Encryption primitives (M5, lifted from fosho encryption.ts and trimmed).
 *
 * XSalsa20-Poly1305 via tweetnacl's secretbox: 32-byte key, 24-byte random
 * nonce, wire format `nonce||ciphertext`. Authenticated — tampering and
 * wrong keys both fail decryption, indistinguishably.
 *
 * No KDF, on purpose: the 32 random bytes from the link's `k=` ARE the key.
 * Key strength lives entirely in the RNG (a documented v1 property). Key
 * rotation is not a thing — a new key is a new spool.
 *
 * fosho's URL side-effects (getSessionKey/setSessionKey reading location)
 * are deliberately not carried: in Spool the key flows through the instance.
 */
import nacl from 'tweetnacl'
import { encodeKey } from './link'

export const KEY_LENGTH = 32
export const NONCE_LENGTH = 24

/** the key in a link cannot decrypt what's stored locally under that spool code */
export class SpoolKeyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpoolKeyError'
  }
}

/** encrypt: random nonce, returns `nonce||ciphertext` */
export const encrypt = (data: Uint8Array, key: Uint8Array): Uint8Array => {
  const nonce = nacl.randomBytes(NONCE_LENGTH)
  const ciphertext = nacl.secretbox(data, nonce, key)
  const combined = new Uint8Array(NONCE_LENGTH + ciphertext.length)
  combined.set(nonce, 0)
  combined.set(ciphertext, NONCE_LENGTH)
  return combined
}

/** decrypt `nonce||ciphertext`; null on wrong key, tampering, or truncation */
export const decrypt = (data: Uint8Array, key: Uint8Array): Uint8Array | null => {
  if (data.length < NONCE_LENGTH + nacl.secretbox.overheadLength) return null
  return nacl.secretbox.open(data.slice(NONCE_LENGTH), data.slice(0, NONCE_LENGTH), key)
}

/**
 * Short fingerprint of a key for "are we on the same key?" UX. Not a secret,
 * not a MAC — just the first 8 base64 chars, enough for two humans to compare
 * out loud.
 */
export const keyFingerprint = (key: Uint8Array): string => encodeKey(key).slice(0, 8)

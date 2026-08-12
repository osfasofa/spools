/** standard base64 (RFC 4648 §4, padded) for bytes riding inside JSON — history moments and export files */

export const b64encode = (bytes: Uint8Array): string => {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

export const b64decode = (s: string): Uint8Array => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

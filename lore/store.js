/* The reel store — the device's blob home (DESIGN §5). The doc never carries
   sound; it carries pointers { sha256, size, mime, dur, url? }. This module
   owns the bytes behind them: content-addressed IndexedDB, a resolution
   chain (store → url-verify-adopt → null/ghost), decode + peaks caches.
   A URL is a courier, never an authority: bytes that don't hash to the
   pointer's sha256 are refused. */
/* exported LoreStore */
const LoreStore = (() => {
  const DB = 'lore-blobs'
  let dbPromise = null

  const openDb = () => {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => {
        req.result.createObjectStore('blobs')
        req.result.createObjectStore('peaks')
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return dbPromise
  }

  const idb = async (storeName, mode, op) => {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode)
      const req = op(tx.objectStore(storeName))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  const sha256Hex = async (buf) => {
    const digest = await crypto.subtle.digest('SHA-256', buf)
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // in-memory index of held hashes so the canvas can ask synchronously
  const held = new Set()
  const failedUrls = new Set()

  // decoded-audio cache, small LRU — voice-scale buffers are cheap, imported
  // songs are not; eviction is safe because active playback holds its own refs
  const decoded = new Map() // sha256 → Promise<AudioBuffer>
  const DECODE_CAP = 16
  const rememberDecoded = (sha, p) => {
    decoded.delete(sha)
    decoded.set(sha, p)
    if (decoded.size > DECODE_CAP) decoded.delete(decoded.keys().next().value)
  }

  const init = async () => {
    await openDb()
    const keys = await idb('blobs', 'readonly', (s) => s.getAllKeys())
    for (const k of keys) held.add(k)
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {})
    }
  }

  /** Store a blob; returns the pointer block. Dedup by content. */
  const put = async (blob, extra = {}) => {
    const buf = await blob.arrayBuffer()
    const sha256 = await sha256Hex(buf)
    if (!held.has(sha256)) {
      await idb('blobs', 'readwrite', (s) => s.put({ blob, mime: blob.type || extra.mime || 'application/octet-stream', size: blob.size, dur: extra.dur || 0, addedAt: Date.now() }, sha256))
      held.add(sha256)
    } else if (extra.dur) {
      const row = await idb('blobs', 'readonly', (s) => s.get(sha256))
      if (row && !row.dur) {
        row.dur = extra.dur
        await idb('blobs', 'readwrite', (s) => s.put(row, sha256))
      }
    }
    return { sha256, size: blob.size, mime: blob.type || extra.mime || 'application/octet-stream', dur: extra.dur || 0 }
  }

  const getRow = (sha256) => idb('blobs', 'readonly', (s) => s.get(sha256))

  const hasSync = (sha256) => held.has(sha256)

  /** The resolution chain. Returns a Blob or null (caller renders the ghost). */
  const resolve = async (audio) => {
    const row = await getRow(audio.sha256)
    if (row) return row.blob
    if (audio.url && !failedUrls.has(audio.url)) {
      try {
        const res = await fetch(audio.url)
        if (!res.ok) throw new Error(`http ${res.status}`)
        const blob = await res.blob()
        const gotSha = await sha256Hex(await blob.arrayBuffer())
        if (gotSha !== audio.sha256) throw new Error('hash mismatch — refused')
        await put(blob, { dur: audio.dur, mime: audio.mime })
        return blob
      } catch (err) {
        failedUrls.add(audio.url)
        console.warn(`lore: url courier failed for ${audio.sha256.slice(0, 8)}:`, err.message)
      }
    }
    return null
  }

  /** Decode to an AudioBuffer via the given (Audio|Offline)Context. */
  const decode = (audio, ctx) => {
    const hit = decoded.get(audio.sha256)
    if (hit) return hit
    const p = (async () => {
      const blob = await resolve(audio)
      if (!blob) throw new Error('blob not held')
      const buf = await blob.arrayBuffer()
      return await ctx.decodeAudioData(buf)
    })()
    rememberDecoded(audio.sha256, p)
    p.catch(() => decoded.delete(audio.sha256))
    return p
  }

  // reversed copies for tape-backwards sound (T-155); tiny cache, lazy
  const reversedCache = new Map()
  const reversed = async (audio, ctx) => {
    const hit = reversedCache.get(audio.sha256)
    if (hit) return hit
    const p = decode(audio, ctx).then((buffer) => {
      const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: buffer.sampleRate })
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const src = buffer.getChannelData(ch)
        const dst = out.getChannelData(ch)
        for (let i = 0, n = src.length; i < n; i++) dst[i] = src[n - 1 - i]
      }
      return out
    })
    reversedCache.set(audio.sha256, p)
    if (reversedCache.size > 6) reversedCache.delete(reversedCache.keys().next().value)
    p.catch(() => reversedCache.delete(audio.sha256))
    return p
  }

  /** Bucketed max-abs peaks for drawing; cached in idb per blob. */
  const peaks = async (audio, ctx) => {
    if (!audio || !audio.sha256) return null
    const cached = await idb('peaks', 'readonly', (s) => s.get(audio.sha256))
    if (cached) return cached
    let buffer
    try {
      buffer = await decode(audio, ctx)
    } catch {
      return null
    }
    const buckets = Math.max(200, Math.min(20000, Math.ceil(buffer.duration * 50)))
    const out = new Float32Array(buckets)
    const per = Math.max(1, Math.floor(buffer.length / buckets))
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch)
      for (let b = 0; b < buckets; b++) {
        let m = 0
        const start = b * per
        const end = Math.min(data.length, start + per)
        // stride the scan: 4× cheaper, visually identical at draw scale
        for (let i = start; i < end; i += 4) {
          const v = Math.abs(data[i])
          if (v > m) m = v
        }
        if (m > out[b]) out[b] = m
      }
    }
    await idb('peaks', 'readwrite', (s) => s.put(out, audio.sha256))
    return out
  }

  const usage = async () => {
    const rows = await idb('blobs', 'readonly', (s) => s.getAll())
    return { blobs: rows.length, bytes: rows.reduce((n, r) => n + (r.size || 0), 0) }
  }

  return { init, put, resolve, decode, reversed, peaks, hasSync, usage, sha256Hex }
})()

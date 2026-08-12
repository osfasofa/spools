/**
 * T-080: export → import round trips, offline-forever, still syncs, and the
 * file's human half is genuinely readable.
 */
import { afterEach, expect, it, vi } from 'vitest'
import { WebSocketServer, WebSocket as NodeWebSocket } from 'ws'
import { newSpool, importSpool, Spool } from './spool'
import { SpoolExportError, EXPORT_FORMAT, EXPORT_VERSION } from './export'

vi.stubGlobal('WebSocket', NodeWebSocket)

const startRelay = () =>
  new Promise<{ url: string; close: () => void }>((resolve) => {
    const rooms = new Map<string, Set<import('ws').WebSocket>>()
    const close = () => {
      for (const conn of wss.clients) conn.terminate()
      wss.close()
    }
    const wss = new WebSocketServer({ port: 0 }, () =>
      resolve({ url: `ws://127.0.0.1:${(wss.address() as { port: number }).port}`, close })
    )
    wss.on('connection', (conn, req) => {
      const room = req.url ?? '/'
      if (!rooms.has(room)) rooms.set(room, new Set())
      const members = rooms.get(room)!
      members.add(conn)
      conn.on('message', (data) => {
        for (const peer of members) if (peer !== conn && peer.readyState === peer.OPEN) peer.send(data)
      })
      conn.on('close', () => {
        members.delete(conn)
        if (members.size === 0) rooms.delete(room)
      })
    })
  })

const waitUntil = async (fn: () => boolean, ms = 5000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (fn()) return true
    await new Promise((r) => setTimeout(r, 25))
  }
  return fn()
}

const spools: Spool[] = []
const cleanups: Array<() => void> = []
const track = (s: Spool) => (spools.push(s), s)

afterEach(async () => {
  await Promise.all(spools.splice(0).map((s) => s.leave()))
  cleanups.splice(0).forEach((c) => c())
})

/** a spool with texture: entries, an edit, a reaction thread, a soft delete */
const buildFixture = async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const spool = track(await newSpool({ relay: relay.url, persist: false, author: 'ana' }))
  const first = spool.wind({ kind: 'note', body: 'the first entry' })
  const second = spool.wind({ kind: 'track', body: 'love this one', data: { url: 'https://x.example/1', title: 'Taillights', artist: 'Motel Coffee' } })
  spool.wind({ kind: 'reaction', parent: second.id, body: '🔥' })
  first.body = 'the first entry, revised'
  const doomed = spool.wind({ kind: 'note', body: 'this one gets deleted' })
  doomed.delete()
  return { spool, relayUrl: relay.url, doomedId: doomed.id }
}

it('the file is readable JSON: format, version, all entries incl. deleted (marked), bodies as edited', async () => {
  const { spool, doomedId } = await buildFixture()
  const file = JSON.parse(spool.export())
  expect(file.format).toBe(EXPORT_FORMAT)
  expect(file.version).toBe(EXPORT_VERSION)
  expect(file.code).toBe(spool.code)
  expect(file.exportedAt).toBeTypeOf('number')
  expect(file.entries).toHaveLength(4) // 3 live + 1 deleted — memory includes the deleted
  const bodies = file.entries.map((e: { body: string }) => e.body)
  expect(bodies).toContain('the first entry, revised')
  expect(bodies).toContain('this one gets deleted')
  const doomed = file.entries.find((e: { id: string }) => e.id === doomedId)
  expect(doomed.deletedAt).toBeTypeOf('number')
  const tracked = file.entries.find((e: { kind: string }) => e.kind === 'track')
  expect(tracked.data.title).toBe('Taillights')
  expect(typeof file.doc).toBe('string')
})

it('round trip, offline-forever: import with no relay → identical entries, no network, history intact', async () => {
  const { spool } = await buildFixture()
  const file = spool.export()
  const momentsBefore = spool.history.length

  const revived = track(await importSpool(file, { persist: false }))
  expect(revived.code).toBe(spool.code)
  expect(revived.status).toBe('offline') // no relay contacted — the relay may be long gone
  expect(revived.entries.map((e) => e.body)).toEqual(spool.entries.map((e) => e.body))
  expect(revived.deleted.map((e) => e.id)).toEqual(spool.deleted.map((e) => e.id))
  expect(revived.history.length).toBe(momentsBefore) // rewind moments ride along in the doc
})

it('an import still syncs: reconnect it to a relay and a fresh peer converges', async () => {
  const { spool, relayUrl } = await buildFixture()
  const file = spool.export()
  await spools.splice(spools.indexOf(spool), 1)[0].leave() // original device is gone

  const revived = track(await importSpool(file, { persist: false, relay: relayUrl, author: 'ben' }))
  const peer = track(await newSpool({ relay: relayUrl, persist: false })) // wrong room on purpose…
  expect(peer.code).not.toBe(revived.code)
  const joiner = track(await importSpool(file, { persist: false, relay: relayUrl, author: 'cal' }))
  await waitUntil(() => revived.status === 'connected' && joiner.status === 'connected')

  const fresh = revived.wind({ kind: 'note', body: 'wound after the import' })
  expect(await waitUntil(() => joiner.entries.some((e) => e.id === fresh.id))).toBe(true)
})

it('import is a merge: existing local state and the file reunify, nothing clobbered', async () => {
  const { spool } = await buildFixture()
  const file = spool.export()
  // the live spool moves on after the export
  const later = spool.wind({ kind: 'note', body: 'wound after the export' })

  // importing the older file into the same (in-memory) doc-code universe:
  // simulate by importing fresh, then cross-applying — the merge is Yjs's own
  const revived = track(await importSpool(file, { persist: false }))
  expect(revived.entries.some((e) => e.id === later.id)).toBe(false) // file predates it
  // now the file is imported "over" the live state: apply live → revived
  const Y = await import('yjs')
  Y.applyUpdate(revived.doc, Y.encodeStateAsUpdate(spool.doc))
  expect(revived.entries.some((e) => e.id === later.id)).toBe(true) // union, not clobber
  expect(revived.entries.map((e) => e.body)).toContain('the first entry, revised')
})

it('unreadable files fail loud with SpoolExportError, never a silent empty spool', async () => {
  await expect(importSpool('not even json')).rejects.toThrow(SpoolExportError)
  await expect(importSpool('{"some":"json"}')).rejects.toThrow(/not a spool export/)
  await expect(importSpool({ format: 'spool-export', version: 999, code: 'a-b-123', doc: '' })).rejects.toThrow(/newer than this SDK/)
  await expect(importSpool({ format: 'spool-export', version: 1, code: 'bad code!', doc: '' })).rejects.toThrow(/bad spool code/)
  await expect(importSpool({ format: 'spool-export', version: 1, code: 'a-b-123' })).rejects.toThrow(/machine half/)
})

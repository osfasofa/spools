/**
 * T-060: rewind(ts) — wind → edit → delete, rewound to each phase; results
 * immutable; the present untouched; alien (unsynced) moments skipped; loud
 * errors before history begins.
 */
import { afterEach, expect, it, vi } from 'vitest'
import * as Y from 'yjs'
import { WebSocketServer, WebSocket as NodeWebSocket } from 'ws'
import { SpoolEngine } from './engine'
import { Spool } from './spool'
import { SpoolHistoryError } from './history'

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const spools: Spool[] = []
const cleanups: Array<() => void> = []

// test tuning: near-immediate moments so phases are quick and distinct
const mkSpool = (code: string, relay?: string) => {
  const engine = new SpoolEngine({
    code,
    persist: false,
    disableBc: true,
    webrtc: false,
    ...(relay ? { relay } : {}),
  })
  const spool = new Spool(engine, relay ?? '', undefined, 'tester', { debounceMs: 5, minGapMs: 0 })
  spools.push(spool)
  return spool
}

afterEach(async () => {
  await Promise.all(spools.splice(0).map((s) => s.leave()))
  cleanups.splice(0).forEach((c) => c())
})

it('spool docs run gc:false — the §5 price of memory', async () => {
  const spool = mkSpool('history-gc-101')
  expect(spool.doc.gc).toBe(false)
})

it('rewind shows the right world at each phase: winds, edits, soft deletes', async () => {
  const spool = mkSpool('history-phases-101')
  await spool.whenReady

  // phase 1: two entries (a beat apart — same-ms winds tie on createdAt and
  // fall to the random-id tie-break, which makes the expected order a coin flip)
  const first = spool.wind({ kind: 'note', body: 'the first draft' })
  await sleep(2)
  const second = spool.wind({ kind: 'note', body: 'a second thought' })
  expect(await waitUntil(() => spool.history.length === 1)).toBe(true)
  const t1 = spool.history[0]
  await sleep(10)

  // phase 2: edit a body, wind a third
  first.body = 'the final version'
  spool.wind({ kind: 'note', body: 'a third voice' })
  expect(await waitUntil(() => spool.history.length === 2)).toBe(true)
  const t2 = spool.history[1]
  await sleep(10)

  // phase 3: soft-delete the second
  second.delete()
  expect(await waitUntil(() => spool.history.length === 3)).toBe(true)
  const t3 = spool.history[2]

  const at1 = spool.rewind(t1)
  expect(at1.map((e) => e.body)).toEqual(['the first draft', 'a second thought'])
  expect(at1.every((e) => e.deletedAt === undefined)).toBe(true)

  const at2 = spool.rewind(t2)
  expect(at2.map((e) => e.body)).toEqual(['the final version', 'a second thought', 'a third voice'])

  const at3 = spool.rewind(t3)
  expect(at3).toHaveLength(3) // memory includes the deleted — it appears, marked
  expect(at3.find((e) => e.id === second.id)?.deletedAt).toBeTypeOf('number')

  // the present is never touched
  expect(spool.entries.map((e) => e.body)).toEqual(['the final version', 'a third voice'])
  expect(spool.deleted.map((e) => e.id)).toEqual([second.id])

  // a ts between moments resolves to the moment before it
  expect(spool.rewind((t1 + t2) / 2).map((e) => e.body)).toEqual(at1.map((e) => e.body))
})

it('rewind results are frozen plain records, not live handles', async () => {
  const spool = mkSpool('history-frozen-101')
  await spool.whenReady
  spool.wind({ kind: 'track', body: 'side a', data: { title: 'opener' } })
  await waitUntil(() => spool.history.length === 1)

  const past = spool.rewind(spool.history[0])
  expect(Object.isFrozen(past)).toBe(true)
  expect(Object.isFrozen(past[0])).toBe(true)
  expect(Object.isFrozen(past[0].data)).toBe(true)
  expect(() => {
    ;(past[0] as { body: string }).body = 'rewritten history'
  }).toThrow()
})

it('rewind before history began throws SpoolHistoryError, loud and specific', async () => {
  const spool = mkSpool('history-empty-101')
  await spool.whenReady
  expect(() => spool.rewind(Date.now())).toThrow(SpoolHistoryError)
  expect(() => spool.rewind(Date.now())).toThrow(/no recorded history/)

  spool.wind({ kind: 'note', body: 'now it begins' })
  await waitUntil(() => spool.history.length === 1)
  expect(() => spool.rewind(spool.history[0] - 60_000)).toThrow(/history starts at/)
})

it('no transactions → no new moments (the log does not feed itself)', async () => {
  const spool = mkSpool('history-quiet-101')
  await spool.whenReady
  spool.wind({ kind: 'note', body: 'one' })
  await waitUntil(() => spool.history.length === 1)
  await sleep(60) // several debounce windows of silence
  expect(spool.history.length).toBe(1)
})

it("moments sync across peers: the reader rewinds through the writer's past", async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const a = mkSpool('history-peers-101', relay.url)
  const b = mkSpool('history-peers-101', relay.url)
  await a.whenReady
  await b.whenReady

  a.wind({ kind: 'note', body: 'written on a' })
  expect(await waitUntil(() => a.history.length === 1)).toBe(true)
  await sleep(10)
  a.wind({ kind: 'note', body: 'also on a' })
  expect(await waitUntil(() => a.history.length === 2)).toBe(true)

  // b receives entries AND the history log; only a logged (b never wrote)
  expect(await waitUntil(() => b.history.length === 2 && b.entries.length === 2)).toBe(true)
  const past = b.rewind(b.history[0])
  expect(past.map((e) => e.body)).toEqual(['written on a'])
})

it('a moment referencing unsynced peer state is skipped, falling back to an earlier one', async () => {
  const spool = mkSpool('history-alien-101')
  await spool.whenReady
  spool.wind({ kind: 'note', body: 'mine' })
  await waitUntil(() => spool.history.length === 1)

  // craft an alien moment: a snapshot of a doc whose structs this spool never saw
  const alien = new Y.Doc({ gc: false })
  alien.getText('entry:x').insert(0, 'unseen content')
  const snapBytes = Y.encodeSnapshot(Y.snapshot(alien))
  let b64 = ''
  for (const byte of snapBytes) b64 += String.fromCharCode(byte)
  const alienTs = Date.now() + 1000
  spool.doc.getArray('history').push([{ ts: alienTs, snap: btoa(b64) }])

  // latest ≤ ts is the alien — unsatisfiable, so rewind falls back to our own past
  const past = spool.rewind(alienTs)
  expect(past.map((e) => e.body)).toEqual(['mine'])
  alien.destroy()
})

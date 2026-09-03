// Shared test scaffolding: the relay has no build step and its tests have no
// framework, just node:test spawning the real server as a child process with
// per-test knobs. Test files run in parallel processes — and `pnpm -r test`
// runs the SDK's suites (which spawn this same server.js) at the same time —
// so each file hands `relayPool` its own port range. Taken: 15100
// (pocket.test.js), 15300 and 15500 (packages/spools pocket-*.test.ts),
// 15700 (hardening.test.js). Pick the next free 200-block.
import { spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', 'server.js')

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** a spawner bound to a port range; call `stop()` from the file's `after` hook */
export const relayPool = (firstPort) => {
  let nextPort = firstPort
  const children = []
  const start = async (env = {}) => {
    const port = nextPort++
    const child = spawn(process.execPath, [SERVER], {
      env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ...env },
      stdio: 'ignore',
    })
    children.push(child)
    const base = `http://127.0.0.1:${port}`
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(base)).ok) return { base, port, child }
      } catch {
        await sleep(50)
      }
    }
    throw new Error('relay did not come up')
  }
  const stop = () => children.forEach((c) => c.kill())
  return { start, stop }
}

/** a minimal valid deposit: magic ‖ version ‖ tag(4) ‖ opaque payload */
export const deposit = (tag = [1, 2, 3, 4], payloadBytes = 40) =>
  Buffer.concat([Buffer.from([0xe2, 0xe3, 1, ...tag]), Buffer.alloc(payloadBytes, 7)])

export const put = async (base, ns, blob, headers = {}) =>
  fetch(`${base}/pocket/${ns}`, { method: 'PUT', body: blob, headers }).then(async (r) => ({ status: r.status, json: await r.json() }))

export const get = async (base, ns, headers = {}) =>
  fetch(`${base}/pocket/${ns}`, { headers }).then(async (r) => ({ status: r.status, json: await r.json() }))

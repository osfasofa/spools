#!/usr/bin/env node
// Placeholder (T-001). The real relay — dumb byte broadcaster + WebRTC
// signaling — lands in T-040, gated by the T-003 feasibility spike.
import { createServer } from 'node:http'

const port = Number(process.env.PORT ?? 4444)

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('ok\n')
    return
  }
  res.writeHead(404)
  res.end()
})

server.listen(port, () => {
  console.log(`spools-relay (placeholder) listening on :${port}`)
})

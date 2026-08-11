// T-021: the spike relay as a killable child process. SIGKILL = the relay
// dies for real — every client socket drops, unlike wss.close() which waits.
import { startRelay } from '../spike-dumb-relay/relay.js'

const port = Number(process.argv[2] ?? 9401)
await startRelay({ port })
console.log(`relay up on ${port}`)

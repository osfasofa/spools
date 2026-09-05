// Bundle entry for the tape-deck rig: the SDK surface plus the *same* yjs
// module instance it uses (the rig applies updates itself over a
// BroadcastChannel, so it needs Y.applyUpdate from the SDK's own copy).
export * from '../../../packages/spools/src/index'
export * as Y from '../../../packages/spools/node_modules/yjs/dist/yjs.mjs'

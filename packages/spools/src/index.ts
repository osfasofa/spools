// SDK surface grows here: openSpool/newSpool land in T-011, the entry layer
// in T-012 (docs/SDK-API.md). SpoolEngine is exported for now; it becomes
// internal once the Spool handle wraps it.
export { SpoolEngine } from './engine'
export type { SpoolEngineOptions, SpoolStatus } from './engine'

// The spools SDK. Entry layer (wind/entries/events) lands in T-012
// (docs/SDK-API.md is the map).
export { newSpool, openSpool, Spool, DEFAULT_RELAY } from './spool'
export type { NewSpoolOptions, OpenSpoolOptions } from './spool'
export { parseSpoolLink, buildSpoolLink, generateCode, isValidCode, SpoolLinkError } from './link'
export type { ParsedLink, BuildLinkInput } from './link'
export { SpoolEngine } from './engine'
export type { SpoolEngineOptions, SpoolStatus } from './engine'

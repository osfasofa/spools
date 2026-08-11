import { expect, it } from 'vitest'
import { SpoolEngine } from './index'

it('module imports cleanly in Node and exposes the engine', () => {
  expect(typeof SpoolEngine).toBe('function')
})

import { expect, it } from 'vitest'
import { version } from './index'

it('exports a version', () => {
  expect(version).toBe('0.0.0')
})

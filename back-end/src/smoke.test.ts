// back-end/src/smoke.test.ts
import { describe, expect, it } from 'vitest'

describe('vitest setup', () => {
  it('runs TypeScript tests with the ~ alias resolvable', () => {
    expect(1 + 1).toBe(2)
  })
})

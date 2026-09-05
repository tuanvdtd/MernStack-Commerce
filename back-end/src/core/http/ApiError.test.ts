import { describe, expect, it } from 'vitest'
import { ApiError } from '~/core/http/ApiError'

describe('ApiError', () => {
  it('carries an optional code alongside statusCode/message/details', () => {
    const err = ApiError.Conflict('Insufficient stock', { variantId: 'v1' }, 'INSUFFICIENT_STOCK')
    expect(err.statusCode).toBe(409)
    expect(err.message).toBe('Insufficient stock')
    expect(err.details).toEqual({ variantId: 'v1' })
    expect(err.code).toBe('INSUFFICIENT_STOCK')
  })

  it('leaves code undefined when not provided (backward compatible)', () => {
    const err = ApiError.NotFound('Product not found')
    expect(err.code).toBeUndefined()
  })
})

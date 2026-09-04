import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '~/core/http/ApiError'
import { requireIdempotencyKey, type IdempotentRequest } from '~/core/http/requireIdempotencyKey'

function makeReq(headerValue: string | undefined): IdempotentRequest {
  return {
    header: () => headerValue,
  } as unknown as IdempotentRequest
}

describe('requireIdempotencyKey', () => {
  it('throws ApiError.BadRequest when the header is missing', () => {
    const req = makeReq(undefined)
    expect(() => requireIdempotencyKey(req, {} as never, vi.fn())).toThrow(ApiError)
  })

  it('throws when the header is blank', () => {
    const req = makeReq('   ')
    expect(() => requireIdempotencyKey(req, {} as never, vi.fn())).toThrow(ApiError)
  })

  it('sets req.idempotencyKey and calls next when present', () => {
    const req = makeReq(' abc-123 ')
    const next = vi.fn()
    requireIdempotencyKey(req, {} as never, next)
    expect(req.idempotencyKey).toBe('abc-123')
    expect(next).toHaveBeenCalledOnce()
  })
})

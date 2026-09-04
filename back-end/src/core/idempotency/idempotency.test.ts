import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

import { idempotency } from '~/core/idempotency/idempotency'
import { redis } from '~/lib/redis'

describe('idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('namespaces the key by user and reads via redis.get', async () => {
    vi.mocked(redis.get).mockResolvedValue('order-123')
    const result = await idempotency.getOrderId('user-1', 'key-abc')
    expect(redis.get).toHaveBeenCalledWith('checkout:idem:user-1:key-abc')
    expect(result).toBe('order-123')
  })

  it('saves the order id with a 24h TTL', async () => {
    await idempotency.saveOrderId('user-1', 'key-abc', 'order-123')
    expect(redis.set).toHaveBeenCalledWith(
      'checkout:idem:user-1:key-abc',
      'order-123',
      60 * 60 * 24,
    )
  })
})

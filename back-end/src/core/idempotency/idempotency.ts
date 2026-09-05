import { redis } from '~/lib/redis'

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24

function buildKey(userId: string, key: string): string {
  return `checkout:idem:${userId}:${key}`
}

export const idempotency = {
  async getOrderId(userId: string, key: string): Promise<string | null> {
    return redis.get(buildKey(userId, key))
  },

  async saveOrderId(userId: string, key: string, orderId: string): Promise<void> {
    await redis.set(buildKey(userId, key), orderId, IDEMPOTENCY_TTL_SECONDS)
  },
}

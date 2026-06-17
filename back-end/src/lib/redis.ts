import { createClient, type RedisClientType } from 'redis'

import { env } from '~/config/env'
import { logger } from '~/config/logger'

/**
 * Redis client tùy chọn cho attribute dictionary cache.
 * - Khi REDIS_URL không cấu hình: mọi thao tác là no-op, dictionary đọc thẳng DB.
 * - Mọi lỗi Redis được nuốt (swallow) để không làm fail luồng search.
 */

let client: RedisClientType | null = null
let connecting: Promise<RedisClientType | null> | null = null

const isConfigured = (): boolean => Boolean(env.REDIS_URL && env.REDIS_URL.trim())

async function getClient(): Promise<RedisClientType | null> {
  if (!isConfigured()) return null
  if (client?.isOpen) return client
  if (connecting) return connecting

  connecting = (async () => {
    try {
      const instance: RedisClientType = createClient({ url: env.REDIS_URL })
      instance.on('error', (err) => {
        logger.warn({ err }, 'Redis client error')
      })
      await instance.connect()
      client = instance
      logger.info('Redis connected (attribute dictionary cache enabled)')
      return client
    } catch (err) {
      logger.warn({ err }, 'Redis connection failed — falling back to MySQL dictionary')
      client = null
      return null
    } finally {
      connecting = null
    }
  })()

  return connecting
}

export const redis = {
  async get(key: string): Promise<string | null> {
    try {
      const c = await getClient()
      if (!c) return null
      return await c.get(key)
    } catch (err) {
      logger.warn({ err, key }, 'Redis GET failed')
      return null
    }
  },

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      const c = await getClient()
      if (!c) return
      await c.set(key, value, { EX: ttlSeconds })
    } catch (err) {
      logger.warn({ err, key }, 'Redis SET failed')
    }
  },

  async del(key: string): Promise<void> {
    try {
      const c = await getClient()
      if (!c) return
      await c.del(key)
    } catch (err) {
      logger.warn({ err, key }, 'Redis DEL failed')
    }
  },
}

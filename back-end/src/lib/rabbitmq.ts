import amqp from 'amqplib'

import { env } from '~/config/env'
import { logger } from '~/config/logger'

/**
 * RabbitMQ — bus đồng bộ MySQL → Elasticsearch.
 * - API (publisher): bắn event sau khi admin tạo/sửa/xóa product.
 * - Worker (consumer): nhận event và index ES (file src/worker.ts).
 *
 * Contract message giữ nguyên như bản NestJS gốc:
 *   exchange `product.events` (topic) · queue `sync-product-to-es-queue` · key `product.*`
 */

export const PRODUCT_EXCHANGE = 'product.events'
export const PRODUCT_EXCHANGE_TYPE = 'topic'
export const PRODUCT_QUEUE = 'sync-product-to-es-queue'
export const PRODUCT_ROUTING_PATTERN = 'product.*'

export type ProductEventAction = 'upsert' | 'delete'

export type ProductEvent = {
  productId: string
  action: ProductEventAction
}

export function routingKeyFor(action: ProductEventAction): string {
  return action === 'delete' ? 'product.delete' : 'product.upsert'
}

export function isRabbitConfigured(): boolean {
  return Boolean(env.RABBITMQ_URI && env.RABBITMQ_URI.trim())
}

// Type-derive để không phụ thuộc tên type giữa các version @types/amqplib.
type RabbitConnection = Awaited<ReturnType<typeof amqp.connect>>
type RabbitChannel = Awaited<ReturnType<RabbitConnection['createChannel']>>

let connection: RabbitConnection | null = null
let channel: RabbitChannel | null = null
let connecting: Promise<RabbitChannel | null> | null = null

/** Mở connection mới — dùng chung cho publisher và worker. */
export async function createRabbitConnection(): Promise<RabbitConnection> {
  if (!isRabbitConfigured()) {
    throw new Error('RABBITMQ_URI is not configured')
  }
  return amqp.connect(env.RABBITMQ_URI as string)
}

async function openPublisherChannel(): Promise<RabbitChannel | null> {
  if (!isRabbitConfigured()) return null

  const conn = await createRabbitConnection()
  conn.on('error', (err) => logger.error({ err }, 'RabbitMQ connection error'))
  conn.on('close', () => {
    logger.warn('RabbitMQ publisher connection closed')
    connection = null
    channel = null
  })

  const ch = await conn.createChannel()
  await ch.assertExchange(PRODUCT_EXCHANGE, PRODUCT_EXCHANGE_TYPE, {
    durable: true,
  })

  connection = conn
  channel = ch
  logger.info('RabbitMQ connected (publisher channel ready)')
  return ch
}

/** Lấy publisher channel (lazy + dedupe in-flight + tự reset khi mất kết nối). */
async function getPublisherChannel(): Promise<RabbitChannel | null> {
  if (!isRabbitConfigured()) return null
  if (channel) return channel
  if (connecting) return connecting

  connecting = openPublisherChannel()
    .catch((err) => {
      logger.error({ err }, 'RabbitMQ publisher connect failed')
      connection = null
      channel = null
      return null
    })
    .finally(() => {
      connecting = null
    })

  return connecting
}

/** Ping/khởi tạo publisher lúc bootstrap (best-effort). */
export async function connectRabbitMQ(): Promise<boolean> {
  if (!isRabbitConfigured()) {
    logger.warn('RABBITMQ_URI not set — product events will sync in-process')
    return false
  }
  const ch = await getPublisherChannel()
  return Boolean(ch)
}

/**
 * Publish event product.* . Trả về false khi chưa cấu hình hoặc publish lỗi,
 * để caller có thể fallback sync in-process (không mất dữ liệu).
 */
export async function publishProductEvent(event: ProductEvent): Promise<boolean> {
  const ch = await getPublisherChannel()
  if (!ch) return false

  try {
    return ch.publish(
      PRODUCT_EXCHANGE,
      routingKeyFor(event.action),
      Buffer.from(JSON.stringify(event)),
      { persistent: true, contentType: 'application/json' },
    )
  } catch (err) {
    logger.error({ err, event }, 'Failed to publish product event')
    return false
  }
}

export async function closeRabbitMQ(): Promise<void> {
  try {
    await channel?.close()
  } catch {
    /* ignore */
  }
  try {
    await connection?.close()
  } catch {
    /* ignore */
  }
  channel = null
  connection = null
}

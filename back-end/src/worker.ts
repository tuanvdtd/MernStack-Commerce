import { logger } from './config/logger'
import { connectElasticsearch } from './lib/elasticsearch'
import { connectDatabase, prisma } from './lib/prisma'
import {
  createRabbitConnection,
  isRabbitConfigured,
  PRODUCT_EXCHANGE,
  PRODUCT_EXCHANGE_TYPE,
  PRODUCT_QUEUE,
  PRODUCT_ROUTING_PATTERN,
  type ProductEvent,
} from './lib/rabbitmq'
import { ensureProductIndex } from './modules/search/search.es'
import { SyncService } from './modules/search/sync.service'

/**
 * Worker process độc lập: lắng nghe RabbitMQ và đồng bộ product sang Elasticsearch.
 * Chạy: `npm run worker:dev` (dev) hoặc `npm run worker` (sau build).
 */
async function bootstrap() {
  if (!isRabbitConfigured()) {
    throw new Error(
      'RABBITMQ_URI is not configured — worker requires RabbitMQ to run',
    )
  }

  await connectDatabase()
  await connectElasticsearch()
  await ensureProductIndex()

  const connection = await createRabbitConnection()
  const channel = await connection.createChannel()

  await channel.assertExchange(PRODUCT_EXCHANGE, PRODUCT_EXCHANGE_TYPE, {
    durable: true,
  })
  const { queue } = await channel.assertQueue(PRODUCT_QUEUE, { durable: true })
  await channel.bindQueue(queue, PRODUCT_EXCHANGE, PRODUCT_ROUTING_PATTERN)
  await channel.prefetch(1)

  logger.info(
    { queue, exchange: PRODUCT_EXCHANGE, pattern: PRODUCT_ROUTING_PATTERN },
    'Worker waiting for product events...',
  )

  await channel.consume(queue, async (msg) => {
    if (!msg) return

    let event: ProductEvent
    try {
      event = JSON.parse(msg.content.toString()) as ProductEvent
    } catch (err) {
      logger.error({ err }, 'Invalid product event payload — discarding')
      channel.nack(msg, false, false)
      return
    }

    logger.info({ event }, 'Received product event')
    try {
      if (event.action === 'delete') {
        await SyncService.deleteSpu(event.productId)
      } else {
        await SyncService.syncSpu(event.productId)
      }
      channel.ack(msg)
      logger.info({ event }, 'Processed product event')
    } catch (err) {
      // Lần đầu lỗi → requeue thử lại; lỗi lần 2 (đã redelivered) → bỏ tránh loop độc.
      const requeue = !msg.fields.redelivered
      logger.error({ err, event, requeue }, 'Failed to process product event')
      channel.nack(msg, false, requeue)
    }
  })

  // Mất kết nối broker → thoát để process manager (pm2/docker) tự restart.
  connection.on('close', () => {
    logger.error('RabbitMQ connection closed — exiting worker')
    process.exit(1)
  })
  connection.on('error', (err) => {
    logger.error({ err }, 'RabbitMQ connection error')
  })

  const shutdown = async () => {
    logger.info('Worker shutting down...')
    try {
      await channel.close()
    } catch {
      /* ignore */
    }
    try {
      await connection.close()
    } catch {
      /* ignore */
    }
    try {
      await prisma.$disconnect()
    } catch {
      /* ignore */
    }
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Worker failed to start')
  process.exit(1)
})

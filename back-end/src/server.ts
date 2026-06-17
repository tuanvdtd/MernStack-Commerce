import { createApp } from './app'
// import { connectMongo } from './config/db'
import { env } from './config/env'
import { logger } from './config/logger'
import { startOtpCleanupJob } from './jobs/otpCleanup.job'
import { connectElasticsearch } from './lib/elasticsearch'
import { connectDatabase } from './lib/prisma'
import { connectRabbitMQ } from './lib/rabbitmq'
import { ensureProductIndex } from './modules/search/search.es'

(async () => {
  // LƯU ÝP: Thực tế sẽ cần mở được connection và khởi tạo DB trước khi create express app
  // await connectMongo(env.MONGO_URI)

  await connectDatabase()
  startOtpCleanupJob()

  // Search bootstrap (best-effort): ping ES rồi đảm bảo index products_v2 tồn tại.
  if (await connectElasticsearch()) {
    try {
      await ensureProductIndex()
    } catch (err) {
      logger.error({ err }, 'Failed to ensure Elasticsearch product index')
    }
  }

  // RabbitMQ publisher (best-effort): kết nối sớm để log lỗi cấu hình.
  await connectRabbitMQ()

  const app = createApp()
  app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`)
  })
})().catch((e) => {
   
  console.error(e)
  process.exit(1)
})

import { createApp } from './app'
// import { connectMongo } from './config/db'
import { env } from './config/env'
import { logger } from './config/logger'
import { startOtpCleanupJob } from './jobs/otpCleanup.job'
import { connectDatabase } from './lib/prisma'

(async () => {
  // LƯU ÝP: Thực tế sẽ cần mở được connection và khởi tạo DB trước khi create express app
  // await connectMongo(env.MONGO_URI)

  await connectDatabase()
  startOtpCleanupJob()

  const app = createApp()
  app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`)
  })
})().catch((e) => {
   
  console.error(e)
  process.exit(1)
})

import cron from 'node-cron'

import { logger } from '~/config/logger'
import { OtpService } from '~/modules/otp/otp.service'

const CONNECTION_ERROR_LOG_INTERVAL_MS = 60_000

let isRunning = false
let lastConnectionErrorLoggedAt = 0

function isDatabaseConnectionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const message =
    'message' in err && typeof err.message === 'string' ? err.message : String(err)
  return (
    message.includes('pool timeout') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('ER_ACCESS_DENIED_ERROR') ||
    message.includes('connect ETIMEDOUT')
  )
}

function logDatabaseUnavailable(err: unknown) {
  const now = Date.now()
  if (now - lastConnectionErrorLoggedAt < CONNECTION_ERROR_LOG_INTERVAL_MS) return
  lastConnectionErrorLoggedAt = now
  logger.warn(
    { err },
    'OTP cleanup skipped — database unavailable (start MySQL and verify DATABASE_* in .env)',
  )
}

/** Chạy mỗi 5 phút để xóa OTP đã hết hạn */
export function startOtpCleanupJob() {
  cron.schedule('*/5 * * * *', async () => {
    if (isRunning) return

    isRunning = true
    try {
      const { count } = await OtpService.cleanupExpired()
      if (count > 0) {
        logger.info({ count }, 'Deleted expired OTP records')
      }
    } catch (err) {
      if (isDatabaseConnectionError(err)) {
        logDatabaseUnavailable(err)
      } else {
        logger.error({ err }, 'OTP cleanup job failed')
      }
    } finally {
      isRunning = false
    }
  })

  logger.info('OTP cleanup cron job started (every 5 minutes)')
}

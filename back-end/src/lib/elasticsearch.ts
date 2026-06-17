import { Client } from '@elastic/elasticsearch'

import { env } from '~/config/env'
import { logger } from '~/config/logger'

/** Singleton Elasticsearch client — endpoint đọc từ ELASTIC_ENDPOINT. */
export const esClient = new Client({ node: env.ELASTIC_ENDPOINT })

/**
 * Ping ES để xác nhận kết nối lúc bootstrap. Trả về false (không throw) khi
 * ES chưa sẵn sàng để API vẫn chạy được các tính năng khác.
 */
export async function connectElasticsearch(): Promise<boolean> {
  try {
    await esClient.info()
    logger.info({ node: env.ELASTIC_ENDPOINT }, 'Elasticsearch connected')
    return true
  } catch (err) {
    logger.error(
      { err, node: env.ELASTIC_ENDPOINT },
      'Elasticsearch connection failed — search features will be degraded',
    )
    return false
  }
}

import { logger } from '~/config/logger'
import { connectElasticsearch } from '~/lib/elasticsearch'
import { ensureProductIndex } from '~/modules/search/search.es'
import { SyncService } from '~/modules/search/sync.service'

/**
 * Reindex toàn bộ product active từ MySQL → Elasticsearch (products_v2).
 * Chạy: `npm run search:reindex`
 */
async function main() {
  const connected = await connectElasticsearch()
  if (!connected) {
    throw new Error('Cannot connect to Elasticsearch — check ELASTIC_ENDPOINT')
  }

  await ensureProductIndex()
  const skuCount = await SyncService.reindexAll()
  logger.info({ skuCount }, 'Reindex completed')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, 'Reindex failed')
    process.exit(1)
  })

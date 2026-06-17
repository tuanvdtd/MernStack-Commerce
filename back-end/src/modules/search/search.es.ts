import type { estypes } from '@elastic/elasticsearch'

import { logger } from '~/config/logger'
import { ApiError } from '~/core/http/ApiError'
import { esClient } from '~/lib/elasticsearch'
import type { ParsedQuery, SkuEsDocument } from '~/modules/search/search.types'

/** Index SKU-level đang dùng cho search production (scenario 3). */
export const PRODUCTS_INDEX = 'products_v2'

/**
 * Tạo index `products_v2` nếu chưa tồn tại.
 * - vietnamese_analyzer: standard tokenizer + lowercase + asciifolding (tìm không dấu).
 * - attrs là nested để filter chính xác theo từng SKU.
 */
export async function ensureProductIndex(): Promise<void> {
  const exists = await esClient.indices.exists({ index: PRODUCTS_INDEX })
  if (exists) return

  logger.info(`Index "${PRODUCTS_INDEX}" not found. Creating with SKU-based mapping...`)
  await esClient.indices.create({
    index: PRODUCTS_INDEX,
    settings: {
      analysis: {
        analyzer: {
          vietnamese_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding'],
          },
        },
      },
    },
    mappings: {
      properties: {
        skuId: { type: 'keyword' },
        spuId: { type: 'keyword' },
        skuTitle: {
          type: 'text',
          analyzer: 'vietnamese_analyzer',
          fields: { keyword: { type: 'keyword' } },
        },
        skuPrice: { type: 'double' },
        skuImg: { type: 'keyword', index: false },
        hasStock: { type: 'boolean' },
        hotScore: { type: 'double' },
        saleCount: { type: 'long' },
        brandId: { type: 'keyword' },
        brandName: { type: 'keyword' },
        catalogId: { type: 'keyword' },
        catalogName: { type: 'keyword' },
        attrs: {
          type: 'nested',
          properties: {
            attrId: { type: 'keyword' },
            attrName: { type: 'keyword' },
            attrValue: { type: 'keyword' },
          },
        },
      },
    },
  })
  logger.info(`Index "${PRODUCTS_INDEX}" created.`)
}

/** Bulk index nhiều SKU document (refresh ngay để search thấy liền). */
export async function bulkIndexSkus(documents: SkuEsDocument[]): Promise<void> {
  if (documents.length === 0) return

  const operations = documents.flatMap((doc) => [
    { index: { _index: PRODUCTS_INDEX, _id: doc.skuId } },
    doc,
  ])

  const result = await esClient.bulk({ refresh: true, operations })
  if (result.errors) {
    const firstError = result.items.find((item) => item.index?.error)?.index?.error
    logger.error({ firstError }, 'Bulk index returned errors')
  }
}

/** Xóa toàn bộ SKU của một SPU khỏi index (dùng khi update/delete product). */
export async function deleteSkusBySpu(spuId: string): Promise<void> {
  try {
    await esClient.deleteByQuery({
      index: PRODUCTS_INDEX,
      query: { term: { spuId } },
      refresh: true,
    })
  } catch (err) {
    logger.warn({ err, spuId }, `Failed to delete SKUs for SPU ${spuId}`)
  }
}

/**
 * Search SKU-level (scenario 3).
 * - q rỗng → match_all; ngược lại match `skuTitle` (operator AND, fuzziness AUTO).
 * - options[] → nested filter chính xác trên attrs.
 * - collapse theo spuId để gom biến thể cùng SPU; sort _score rồi hotScore.
 */
export async function searchSkus(parsed: ParsedQuery): Promise<SkuEsDocument[]> {
  const { q, options } = parsed

  const mustClauses: estypes.QueryDslQueryContainer[] = []
  if (typeof q === 'string' && q.trim() !== '') {
    mustClauses.push({
      match: {
        skuTitle: { query: q, operator: 'and', fuzziness: 'AUTO' },
      },
    })
  } else {
    mustClauses.push({ match_all: {} })
  }

  const filterClauses: estypes.QueryDslQueryContainer[] = []
  if (Array.isArray(options) && options.length > 0) {
    for (const opt of options) {
      filterClauses.push({
        nested: {
          path: 'attrs',
          query: {
            bool: {
              must: [
                { term: { 'attrs.attrName': opt.name } },
                { term: { 'attrs.attrValue': opt.value } },
              ],
            },
          },
        },
      })
    }
  }

  const sort: estypes.Sort = [
    { _score: { order: 'desc' as estypes.SortOrder } },
    { hotScore: { order: 'desc' as estypes.SortOrder } },
  ]

  try {
    const response = await esClient.search<SkuEsDocument>({
      index: PRODUCTS_INDEX,
      query: {
        bool: {
          must: mustClauses,
          filter: filterClauses.length > 0 ? filterClauses : undefined,
        },
      },
      collapse: { field: 'spuId' },
      sort,
      size: 20,
    })

    return response.hits.hits
      .map((hit) => hit._source)
      .filter((source): source is SkuEsDocument => source !== undefined)
  } catch (err) {
    logger.error({ err }, 'Elasticsearch search failed')
    throw ApiError.Internal('An error occurred while searching for products.')
  }
}

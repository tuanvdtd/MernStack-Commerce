import { QueryParserService } from '~/modules/search/query-parser.service'
import { searchSkus } from '~/modules/search/search.es'
import type { SkuEsDocument } from '~/modules/search/search.types'

export const SearchService = {
  /**
   * Scenario 3 — production search flow:
   * raw query → QueryParser (dictionary) → Elasticsearch products_v2.
   */
  async searchScenario3(rawQuery: string): Promise<{
    query: { raw: string; q: string; options: { name: string; value: string }[] }
    total: number
    items: SkuEsDocument[]
  }> {
    const parsed = await QueryParserService.parse(rawQuery ?? '')
    const items = await searchSkus(parsed)

    return {
      query: { raw: rawQuery ?? '', q: parsed.q, options: parsed.options },
      total: items.length,
      items,
    }
  },
}

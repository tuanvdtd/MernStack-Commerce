import { logger } from '~/config/logger'
import { AttributeDictionaryService } from '~/modules/search/attribute-dictionary.service'
import type { ParsedOption, ParsedQuery } from '~/modules/search/search.types'

export const QueryParserService = {
  /**
   * Tách query thô thành { q, options }:
   * - Token khớp synonyms của một option value → đưa vào options (đánh dấu đã dùng).
   * - Token còn lại ghép thành q (text search trên skuTitle).
   */
  async parse(rawQuery: string): Promise<ParsedQuery> {
    const dictionary = await AttributeDictionaryService.getDictionary()
    const tokens = rawQuery.toLowerCase().split(' ').filter(Boolean)

    const searchTextParts: string[] = []
    const foundOptions: ParsedOption[] = []
    const consumedTokens = new Set<string>()

    for (const token of tokens) {
      if (consumedTokens.has(token)) continue

      let found = false
      for (const [optionName, values] of dictionary.entries()) {
        const match = values.find((v) => v.synonyms.includes(token))
        if (match) {
          foundOptions.push({ name: optionName, value: match.normalizedValue })
          consumedTokens.add(token)
          found = true
          break
        }
      }

      if (!found) searchTextParts.push(token)
    }

    const result: ParsedQuery = {
      q: searchTextParts.join(' '),
      options: foundOptions,
    }

    logger.info(
      { q: result.q, options: result.options },
      'Parsed search query',
    )
    return result
  },
}

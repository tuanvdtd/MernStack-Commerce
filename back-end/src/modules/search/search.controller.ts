import { Request, Response } from 'express'

import { SearchService } from '~/modules/search/search.service'

export const SearchController = {
  /** GET /search/scenario3?q= — production search (parse query + Elasticsearch). */
  scenario3: async (req: Request, res: Response) => {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q : ''
    const result = await SearchService.searchScenario3(rawQuery)
    return res.json(result)
  },
}

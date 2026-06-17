import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

/** GET /search/scenario3?q=... — q optional (rỗng → match_all). */
export const SearchScenario3Schema = z.object({
  body: ZodEmptyObject,
  query: z.object({
    q: z.string().trim().max(255).optional().default(''),
  }),
  params: ZodEmptyObject,
})

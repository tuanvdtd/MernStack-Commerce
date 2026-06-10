import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

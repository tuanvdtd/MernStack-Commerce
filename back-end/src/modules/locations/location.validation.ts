import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const ListWardsSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({
    code: z.string().trim().min(1),
  }),
})

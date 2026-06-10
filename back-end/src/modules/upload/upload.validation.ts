import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const DeleteProductImageSchema = z.object({
  body: z.object({
    publicId: z.string().trim().min(1),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

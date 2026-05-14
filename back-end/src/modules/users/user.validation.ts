import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const RegisterSchema = z.object({
  body: z.object({
    email: z.email(),
    name: z.string().min(2),
    password: z.string().min(8),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

export const LoginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

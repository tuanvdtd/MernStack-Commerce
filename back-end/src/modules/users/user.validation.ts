import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const RegisterSchema = z.object({
  body: z.object({
    email: z.email(),
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

export const VerifyOtpSchema = z.object({
  body: z
    .object({
      email: z.email(),
      code: z.string().length(6).regex(/^\d+$/),
      password: z.string().min(8),
      verifyPassword: z.string().min(8),
    })
    .refine((data) => data.password === data.verifyPassword, {
      message: 'Password confirmation does not match',
      path: ['verifyPassword'],
    }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

export const ResendOtpSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

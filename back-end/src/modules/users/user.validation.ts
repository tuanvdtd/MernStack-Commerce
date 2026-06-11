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

const vietnamesePhoneSchema = z
  .string()
  .trim()
  .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0')

const patchProfileBodySchema = z
  .object({
    name: z.string().trim().min(1, 'Họ tên không được để trống').max(100).optional(),
    phone: vietnamesePhoneSchema.optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Cần ít nhất một trường để cập nhật',
  })

export const PatchProfileSchema = z.object({
  body: patchProfileBodySchema,
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

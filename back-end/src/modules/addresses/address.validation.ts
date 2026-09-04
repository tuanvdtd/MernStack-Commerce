import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/

const phoneSchema = z.string().trim().regex(VN_PHONE_REGEX, 'Invalid Vietnamese phone number')

const upsertBodySchema = z.object({
  label: z.string().trim().max(50).optional(),
  recipientName: z.string().trim().min(1).max(100),
  phone: phoneSchema,
  provinceCode: z.string().trim().min(1),
  wardCode: z.string().trim().min(1),
  detail: z.string().trim().min(1).max(255),
  isDefault: z.boolean().optional(),
})

export const CreateAddressSchema = z.object({
  body: upsertBodySchema,
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

const patchBodySchema = upsertBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field is required',
  })

export const PatchAddressSchema = z.object({
  body: patchBodySchema,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const AddressIdParamSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

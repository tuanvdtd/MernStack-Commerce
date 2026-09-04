import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const AddCartItemSchema = z.object({
  body: z.object({
    variantId: z.string().trim().min(1),
    quantity: z.coerce.number().int().min(1).max(100),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

export const UpdateCartItemSchema = z.object({
  body: z
    .object({
      quantity: z.coerce.number().int().min(1).max(100).optional(),
      selected: z.boolean().optional(),
    })
    .refine((b) => b.quantity !== undefined || b.selected !== undefined, {
      message: 'At least one field is required',
    }),
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const RemoveCartItemSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const SelectAllCartItemsSchema = z.object({
  body: z.object({ selected: z.boolean() }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

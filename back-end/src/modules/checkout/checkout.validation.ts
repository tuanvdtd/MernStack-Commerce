import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const buyNowItemSchema = z.object({
  variantId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(100),
})

const checkoutBodySchema = z.object({
  addressId: z.string().trim().min(1),
  paymentMethod: z.enum(['cod', 'online']),
  discountCode: z.string().trim().min(1).optional(),
  buyNowItem: buyNowItemSchema.optional(),
})

export const CheckoutSchema = z.object({
  body: checkoutBodySchema,
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

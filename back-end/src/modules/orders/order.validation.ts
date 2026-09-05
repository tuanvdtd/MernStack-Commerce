import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const orderStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
const paymentStatusEnum = z.enum(['UNPAID', 'PAID', 'FAILED', 'REFUNDED'])
const shipmentStatusEnum = z.enum(['NOT_SHIPPED', 'SHIPPED', 'DELIVERED', 'RETURNED'])

export const listMyOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  orderStatus: orderStatusEnum.optional(),
})

export const ListMyOrdersSchema = z.object({
  body: ZodEmptyObject,
  query: listMyOrdersQuerySchema,
  params: ZodEmptyObject,
})

export const GetOrderSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const trackOrderQuerySchema = z.object({
  orderNumber: z.string().trim().min(1),
  phone: z.string().trim().min(1),
})

export const TrackOrderSchema = z.object({
  body: ZodEmptyObject,
  query: trackOrderQuerySchema,
  params: ZodEmptyObject,
})

export const listAdminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  orderStatus: orderStatusEnum.optional(),
  paymentMethod: z.enum(['COD', 'ONLINE']).optional(),
  search: z.string().trim().min(1).optional(),
})

export const ListAdminOrdersSchema = z.object({
  body: ZodEmptyObject,
  query: listAdminOrdersQuerySchema,
  params: ZodEmptyObject,
})

export const UpdateOrderStatusSchema = z.object({
  body: z
    .object({
      orderStatus: orderStatusEnum.optional(),
      paymentStatus: paymentStatusEnum.optional(),
      shipmentStatus: shipmentStatusEnum.optional(),
    })
    .refine((b) => b.orderStatus ?? b.paymentStatus ?? b.shipmentStatus, {
      message: 'At least one status field is required',
    }),
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

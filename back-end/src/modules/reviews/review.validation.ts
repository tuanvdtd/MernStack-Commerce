import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const ratingSchema = z.number().int().min(1).max(5)

const commentSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value === '' ? undefined : value))

export const listProductReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const ListProductReviewsSchema = z.object({
  body: ZodEmptyObject,
  query: listProductReviewsQuerySchema,
  params: z.object({
    productId: z.string().trim().min(1),
  }),
})

export const CreateProductReviewSchema = z.object({
  body: z.object({
    rating: ratingSchema,
    comment: commentSchema,
  }),
  query: ZodEmptyObject,
  params: z.object({
    productId: z.string().trim().min(1),
  }),
})

export const PatchReviewSchema = z.object({
  body: z
    .object({
      rating: ratingSchema.optional(),
      comment: z.union([commentSchema, z.null()]).optional(),
    })
    .refine((body) => body.rating != null || body.comment !== undefined, {
      message: 'At least one field is required',
    }),
  query: ZodEmptyObject,
  params: z.object({
    reviewId: z.string().trim().min(1),
  }),
})

export const DeleteReviewSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({
    reviewId: z.string().trim().min(1),
  }),
})

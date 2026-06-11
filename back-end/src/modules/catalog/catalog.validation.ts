import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const listCatalogProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.string().trim().min(1).optional(),
  categorySlug: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
})

export const ListCatalogProductsSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: listCatalogProductsQuerySchema,
})

export const GetCatalogProductSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({
    slugOrId: z.string().trim().min(1),
  }),
})

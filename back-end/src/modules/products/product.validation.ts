import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const imageUrlSchema = z
  .string()
  .min(1)
  .refine((val) => /^https?:\/\/.+/i.test(val), 'Invalid image URL')

const optionalImageUrlSchema = z.union([z.literal(''), imageUrlSchema]).optional()

const productImageSchema = z.object({
  url: imageUrlSchema,
  publicId: z.string().trim().min(1),
  sortOrder: z.coerce.number().int().min(0),
  alt: z.string().trim().max(255).optional(),
})

const variantOptionSchema = z.object({
  optionName: z.string().trim().min(1),
  value: z.string().trim().min(1),
})

const variantSchema = z.object({
  id: z.string().trim().min(1).optional(),
  price: z.coerce.number().min(1000),
  stockQuantity: z.coerce.number().int().min(0),
  imgUrl: optionalImageUrlSchema,
  options: z.array(variantOptionSchema),
})

function refineOptionAxes(data: { optionAxes: string[] }, ctx: z.RefinementCtx) {
  if (new Set(data.optionAxes).size !== data.optionAxes.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Duplicate option axes',
      path: ['optionAxes'],
    })
  }
}

function refineVariantsAgainstAxes(
  data: { optionAxes: string[]; variants: z.infer<typeof variantSchema>[] },
  ctx: z.RefinementCtx,
) {
  const variantIds = data.variants.map((v) => v.id).filter(Boolean) as string[]
  if (new Set(variantIds).size !== variantIds.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Duplicate variant ids in request',
      path: ['variants'],
    })
  }

  const combos = data.variants.map((variant) =>
    data.optionAxes
      .map((axis) => {
        const match = variant.options.find((o) => o.optionName === axis)
        return `${axis}:${match?.value ?? ''}`
      })
      .join('|'),
  )
  if (new Set(combos).size !== combos.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Duplicate variant option combinations',
      path: ['variants'],
    })
  }

  for (let i = 0; i < data.variants.length; i++) {
    const variant = data.variants[i]
    for (const axis of data.optionAxes) {
      const match = variant.options.find((o) => o.optionName === axis)
      if (!match?.value.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: `Missing value for option axis "${axis}" on variant ${i + 1}`,
          path: ['variants', i, 'options'],
        })
      }
    }
  }
}

function refineProductImages(
  images: z.infer<typeof productImageSchema>[],
  ctx: z.RefinementCtx,
  path: (string | number)[],
) {
  if (images.length > 9) {
    ctx.addIssue({
      code: 'custom',
      message: 'Product gallery supports at most 9 images',
      path,
    })
  }

  const sortOrders = images.map((img) => img.sortOrder)
  if (new Set(sortOrders).size !== sortOrders.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Duplicate image sortOrder values',
      path,
    })
  }

  const publicIds = images.map((img) => img.publicId)
  if (new Set(publicIds).size !== publicIds.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Duplicate image publicId values',
      path,
    })
  }
}

const productBodySchema = z
  .object({
    name: z.string().trim().min(3).max(255),
    description: z.string().trim().min(10),
    categoryId: z.string().trim().min(1),
    brand: z.string().trim().min(1).max(100),
    images: z.array(productImageSchema).min(1).max(9),
    isActive: z.boolean().default(true),
    optionAxes: z.array(z.string().trim().min(1)).default([]),
    variants: z.array(variantSchema).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.optionAxes.length === 0) {
      if (data.variants.length !== 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Simple product must have exactly one SKU',
          path: ['variants'],
        })
      }

      if (data.variants.some((variant) => variant.options.length > 0)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Simple product SKU must not include option values',
          path: ['variants'],
        })
      }
    } else {
      refineOptionAxes(data, ctx)
      refineVariantsAgainstAxes(data, ctx)
    }

    refineProductImages(data.images, ctx, ['images'])
  })

/** PATCH SPU: ít nhất một field; optionAxes validate khi có gửi. */
const patchSpuBodySchema = z
  .object({
    name: z.string().trim().min(3).max(255).optional(),
    description: z.string().trim().min(10).optional(),
    categoryId: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).max(100).optional(),
    images: z.array(productImageSchema).min(1).max(9).optional(),
    isActive: z.boolean().optional(),
    optionAxes: z.array(z.string().trim().min(1)).optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one SPU field is required',
        path: [],
      })
    }
    if (data.optionAxes && data.optionAxes.length > 0) {
      refineOptionAxes({ optionAxes: data.optionAxes }, ctx)
    }
    if (data.images) {
      refineProductImages(data.images, ctx, ['images'])
    }
  })

/** PUT variants: bắt buộc optionAxes + variants đầy đủ, validate combo không trùng. */
const updateVariantsBodySchema = z
  .object({
    optionAxes: z.array(z.string().trim().min(1)).default([]),
    variants: z.array(variantSchema).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.optionAxes.length === 0) {
      if (data.variants.length !== 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Simple product must have exactly one SKU',
          path: ['variants'],
        })
      }

      if (data.variants.some((variant) => variant.options.length > 0)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Simple product SKU must not include option values',
          path: ['variants'],
        })
      }

      return
    }

    refineOptionAxes(data, ctx)
    refineVariantsAgainstAxes(data, ctx)
  })

export const CreateProductSchema = z.object({
  body: productBodySchema,
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

export const PatchProductSpuSchema = z.object({
  body: patchSpuBodySchema,
  query: ZodEmptyObject,
  params: z.object({
    id: z.string().trim().min(1),
  }),
})

export const UpdateProductVariantsSchema = z.object({
  body: updateVariantsBodySchema,
  query: ZodEmptyObject,
  params: z.object({
    id: z.string().trim().min(1),
  }),
})

export const GetProductSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({
    id: z.string().trim().min(1),
  }),
})

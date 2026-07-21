import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const imageUrlSchema = z
  .string()
  .min(1)
  .refine((val) => /^https?:\/\/.+/i.test(val), 'Invalid image URL')

const optionalImageUrlSchema = z.union([z.literal(''), imageUrlSchema]).optional()

const variantOptionSchema = z.object({
  optionName: z.string().trim().min(1),
  value: z.string().trim().min(1),
})

const variantSchema = z.object({
  id: z.string().trim().min(1).optional(),
  price: z.coerce.number().min(1000),
  stockQuantity: z.coerce.number().int().min(0),
  imgUrl: optionalImageUrlSchema,
  options: z.array(variantOptionSchema).min(1),
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

const productBodySchema = z
  .object({
    name: z.string().trim().min(3).max(255),
    description: z.string().trim().min(10),
    categoryId: z.string().trim().min(1),
    brand: z.string().trim().min(1).max(100),
    imgUrl: z.union([z.literal(''), imageUrlSchema]).default(''),
    isActive: z.boolean().default(true),
    optionAxes: z.array(z.string().trim().min(1)).min(1),
    variants: z.array(variantSchema).min(1),
  })
  .superRefine((data, ctx) => {
    refineOptionAxes(data, ctx)
    refineVariantsAgainstAxes(data, ctx)
  })

/** PATCH SPU: ít nhất một field; optionAxes validate khi có gửi. */
const patchSpuBodySchema = z
  .object({
    name: z.string().trim().min(3).max(255).optional(),
    description: z.string().trim().min(10).optional(),
    categoryId: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).max(100).optional(),
    imgUrl: z.union([z.literal(''), imageUrlSchema]).optional(),
    isActive: z.boolean().optional(),
    optionAxes: z.array(z.string().trim().min(1)).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one SPU field is required',
        path: [],
      })
    }
    if (data.optionAxes) {
      refineOptionAxes({ optionAxes: data.optionAxes }, ctx)
    }
  })

/** PUT variants: bắt buộc optionAxes + variants đầy đủ, validate combo không trùng. */
const updateVariantsBodySchema = z
  .object({
    optionAxes: z.array(z.string().trim().min(1)).min(1),
    variants: z.array(variantSchema).min(1),
  })
  .superRefine((data, ctx) => {
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

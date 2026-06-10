import { prisma } from '~/lib/prisma'
import type { CreateProductInput } from '~/modules/products/product.types'

const productInclude = {
  category: true,
  variants: {
    include: {
      options: {
        include: {
          optionValue: {
            include: { option: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const

export type ProductWithRelations = Awaited<
  ReturnType<typeof ProductRepo.findById>
>

export const ProductRepo = {
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude,
    })
  },

  async findBySku(sku: string, excludeProductId?: string) {
    return prisma.productVariant.findFirst({
      where: {
        sku,
        ...(excludeProductId ? { productId: { not: excludeProductId } } : {}),
      },
    })
  },

  async list() {
    return prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    })
  },

  async create(data: CreateProductInput, slug: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          categoryId: data.categoryId,
          brand: data.brand,
          imgUrl: data.imgUrl?.trim() || null,
          isActive: data.isActive,
        },
      })

      for (const variant of data.variants) {
        const optionValueIds: string[] = []

        for (const axis of data.optionAxes) {
          const match = variant.options.find((o) => o.optionName === axis)
          if (!match) continue

          const option = await tx.option.upsert({
            where: { name: axis },
            create: { name: axis },
            update: {},
          })

          const optionValue = await tx.optionValue.upsert({
            where: {
              optionId_value: {
                optionId: option.id,
                value: match.value,
              },
            },
            create: {
              optionId: option.id,
              value: match.value,
            },
            update: {},
          })

          optionValueIds.push(optionValue.id)
        }

        await tx.productVariant.create({
          data: {
            sku: variant.sku,
            price: variant.price,
            stockQuantity: variant.stockQuantity,
            imgUrl: variant.imgUrl?.trim() || null,
            productId: product.id,
            options: {
              create: optionValueIds.map((optionValueId) => ({
                optionValueId,
              })),
            },
          },
        })
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: productInclude,
      })
    })
  },

  async update(id: string, data: CreateProductInput) {
    return prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          brand: data.brand,
          imgUrl: data.imgUrl?.trim() || null,
          isActive: data.isActive,
        },
      })

      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true, sku: true },
      })

      const incomingSkus = new Set(data.variants.map((v) => v.sku))
      const toRemove = existingVariants.filter((v) => !incomingSkus.has(v.sku))

      for (const variant of toRemove) {
        await tx.productVariant.delete({ where: { id: variant.id } })
      }

      for (const variant of data.variants) {
        const optionValueIds: string[] = []

        for (const axis of data.optionAxes) {
          const match = variant.options.find((o) => o.optionName === axis)
          if (!match) continue

          const option = await tx.option.upsert({
            where: { name: axis },
            create: { name: axis },
            update: {},
          })

          const optionValue = await tx.optionValue.upsert({
            where: {
              optionId_value: {
                optionId: option.id,
                value: match.value,
              },
            },
            create: {
              optionId: option.id,
              value: match.value,
            },
            update: {},
          })

          optionValueIds.push(optionValue.id)
        }

        const existing = existingVariants.find((v) => v.sku === variant.sku)

        if (existing) {
          await tx.productVariantOptionValue.deleteMany({
            where: { productVariantId: existing.id },
          })

          await tx.productVariant.update({
            where: { id: existing.id },
            data: {
              price: variant.price,
              stockQuantity: variant.stockQuantity,
              imgUrl: variant.imgUrl?.trim() || null,
              options: {
                create: optionValueIds.map((optionValueId) => ({
                  optionValueId,
                })),
              },
            },
          })
        } else {
          await tx.productVariant.create({
            data: {
              sku: variant.sku,
              price: variant.price,
              stockQuantity: variant.stockQuantity,
              imgUrl: variant.imgUrl?.trim() || null,
              productId: id,
              options: {
                create: optionValueIds.map((optionValueId) => ({
                  optionValueId,
                })),
              },
            },
          })
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: productInclude,
      })
    })
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  },
}

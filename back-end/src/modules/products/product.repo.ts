import { prisma } from '~/lib/prisma'
import type {
  CreateProductInput,
  PatchProductSpuInput,
  UpdateProductVariantsInput,
  VariantOptionInput,
} from '~/modules/products/product.types'

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

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

/** Upsert Option/OptionValue rồi trả id — dùng chung cho create, patch SPU và replace variants. */
async function resolveOptionValueIds(
  tx: Tx,
  optionAxes: string[],
  options: VariantOptionInput[],
) {
  const optionValueIds: string[] = []

  for (const axis of optionAxes) {
    const match = options.find((o) => o.optionName === axis)
    if (!match?.value.trim()) continue

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

  return optionValueIds
}

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
        const optionValueIds = await resolveOptionValueIds(
          tx,
          data.optionAxes,
          variant.options,
        )

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

  /**
   * PATCH partial SPU. Khi optionAxes đổi, remap options SKU hiện có
   * (giữ giá trị trục trùng tên; trục mới chưa có giá trị thì bỏ qua đến bước lưu SKU).
   */
  async patchSpu(id: string, data: PatchProductSpuInput) {
    return prisma.$transaction(async (tx) => {
      const productUpdate: Record<string, unknown> = {}

      if (data.name !== undefined) productUpdate.name = data.name
      if (data.description !== undefined) {
        productUpdate.description = data.description
      }
      if (data.categoryId !== undefined) productUpdate.categoryId = data.categoryId
      if (data.brand !== undefined) productUpdate.brand = data.brand
      if (data.imgUrl !== undefined) {
        productUpdate.imgUrl = data.imgUrl?.trim() || null
      }
      if (data.isActive !== undefined) productUpdate.isActive = data.isActive

      if (Object.keys(productUpdate).length > 0) {
        await tx.product.update({
          where: { id },
          data: productUpdate,
        })
      }

      if (data.optionAxes !== undefined) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
          include: {
            options: {
              include: {
                optionValue: {
                  include: { option: true },
                },
              },
            },
          },
        })

        for (const variant of existingVariants) {
          const currentOptions = variant.options.map((link) => ({
            optionName: link.optionValue.option.name,
            value: link.optionValue.value,
          }))

          const alignedOptions = data.optionAxes!.map((axis) => ({
            optionName: axis,
            value:
              currentOptions.find((o) => o.optionName === axis)?.value ?? '',
          }))

          const optionValueIds = await resolveOptionValueIds(
            tx,
            data.optionAxes!,
            alignedOptions,
          )

          await tx.productVariantOptionValue.deleteMany({
            where: { productVariantId: variant.id },
          })

          if (optionValueIds.length > 0) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                options: {
                  create: optionValueIds.map((optionValueId) => ({
                    optionValueId,
                  })),
                },
              },
            })
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: productInclude,
      })
    })
  },

  /** PUT variants: thêm/sửa theo mã SKU, xóa SKU không còn trong payload. */
  async replaceVariants(id: string, data: UpdateProductVariantsInput) {
    return prisma.$transaction(async (tx) => {
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
        const optionValueIds = await resolveOptionValueIds(
          tx,
          data.optionAxes,
          variant.options,
        )

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

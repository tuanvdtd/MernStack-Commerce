import type { ProductWithRelations } from '~/modules/products/product.repo'

function deriveOptionAxes(
  product: NonNullable<ProductWithRelations>,
): string[] {
  const axes: string[] = []
  const seen = new Set<string>()

  for (const variant of product.variants) {
    for (const link of variant.options) {
      const name = link.optionValue.option.name
      if (!seen.has(name)) {
        seen.add(name)
        axes.push(name)
      }
    }
  }

  return axes
}

export function toAdminProduct(product: NonNullable<ProductWithRelations>) {
  const optionAxes = deriveOptionAxes(product)
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    productId: product.id,
    sku: variant.sku,
    price: Number(variant.price),
    imgUrl: variant.imgUrl ?? undefined,
    stockQuantity: variant.stockQuantity,
    options: variant.options.map((link) => ({
      optionName: link.optionValue.option.name,
      value: link.optionValue.value,
    })),
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  }))

  const prices = variants.map((v) => v.price)
  const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    categoryId: product.categoryId,
    categoryName: product.category.name,
    brand: product.brand,
    optionAxes,
    imgUrl: product.imgUrl ?? undefined,
    isActive: product.isActive,
    skus: variants,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    totalStock,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  }
}

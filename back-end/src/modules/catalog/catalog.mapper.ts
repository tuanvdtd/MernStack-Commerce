import type { CatalogProductWithRelations } from '~/modules/catalog/catalog.repo'
import type {
  CatalogProductDetail,
  CatalogProductListItem,
} from '~/modules/catalog/catalog.types'

/** Suy ra thứ tự trục option từ danh sách SKU. */
function deriveOptionAxes(
  product: NonNullable<CatalogProductWithRelations>,
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

/** Map entity Prisma sang item rút gọn cho list/grid. */
export function toCatalogProductListItem(
  product: NonNullable<CatalogProductWithRelations>,
): CatalogProductListItem {
  const prices = product.variants.map((variant) => Number(variant.price))
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0,
  )

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    imgUrl: product.imgUrl ?? undefined,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    inStock: totalStock > 0,
    averageRating: Number(product.averageRating),
    reviewCount: product.reviewCount,
  }
}

/** Map entity Prisma sang chi tiết SPU + SKU cho storefront. */
export function toCatalogProductDetail(
  product: NonNullable<CatalogProductWithRelations>,
): CatalogProductDetail {
  const listItem = toCatalogProductListItem(product)
  const optionAxes = deriveOptionAxes(product)

  const variants = product.variants.map((variant) => ({
    id: variant.id,
    price: Number(variant.price),
    imgUrl: variant.imgUrl ?? undefined,
    stockQuantity: variant.stockQuantity,
    inStock: variant.stockQuantity > 0,
    options: variant.options.map((link) => ({
      optionName: link.optionValue.option.name,
      value: link.optionValue.value,
    })),
  }))

  return {
    ...listItem,
    description: product.description ?? '',
    optionAxes,
    variants,
  }
}

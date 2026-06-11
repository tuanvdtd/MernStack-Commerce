import { prisma } from '~/lib/prisma'
import type { CatalogListFilters } from '~/modules/catalog/catalog.types'

const catalogProductInclude = {
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

export type CatalogProductWithRelations = Awaited<
  ReturnType<typeof CatalogRepo.findActiveBySlugOrId>
>

/** Ghép điều kiện WHERE cho catalog — chỉ sản phẩm đang bán. */
function buildListWhere(filters: CatalogListFilters) {
  const where: {
    isActive: true
    categoryId?: string
    category?: { slug: string }
    brand?: string
    name?: { contains: string }
    variants?: { some: { price: { gte?: number; lte?: number } } }
  } = { isActive: true }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug }
  }

  if (filters.brand) {
    where.brand = filters.brand
  }

  if (filters.search?.trim()) {
    where.name = { contains: filters.search.trim() }
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    const price: { gte?: number; lte?: number } = {}
    if (filters.minPrice != null) price.gte = filters.minPrice
    if (filters.maxPrice != null) price.lte = filters.maxPrice
    where.variants = { some: { price } }
  }

  return where
}

/** Lấy giá thấp nhất trong các SKU của một SPU — dùng để sort theo giá. */
function getMinVariantPrice(
  product: Awaited<
    ReturnType<typeof prisma.product.findMany<{ include: typeof catalogProductInclude }>>
  >[number],
) {
  if (!product.variants.length) return 0
  return Math.min(...product.variants.map((variant) => Number(variant.price)))
}

/** Sắp xếp danh sách SPU theo giá min SKU (sort in-memory, đúng phân trang). */
function sortProductsByPrice(
  products: Awaited<
    ReturnType<typeof prisma.product.findMany<{ include: typeof catalogProductInclude }>>
  >,
  sort: CatalogListFilters['sort'],
) {
  return [...products].sort((left, right) => {
    const diff = getMinVariantPrice(left) - getMinVariantPrice(right)
    return sort === 'price_asc' ? diff : -diff
  })
}

export const CatalogRepo = {
  /** Danh sách SPU đang active, có phân trang và lọc. */
  async list(filters: CatalogListFilters) {
    const where = buildListWhere(filters)
    const skip = (filters.page - 1) * filters.limit

    if (filters.sort === 'newest') {
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: catalogProductInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take: filters.limit,
        }),
        prisma.product.count({ where }),
      ])

      return { items, total }
    }

    const [matchedProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: catalogProductInclude,
      }),
      prisma.product.count({ where }),
    ])

    const items = sortProductsByPrice(matchedProducts, filters.sort).slice(
      skip,
      skip + filters.limit,
    )

    return { items, total }
  },

  /** Tìm SPU active theo slug (URL thân thiện). */
  async findActiveBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      include: catalogProductInclude,
    })
  },

  /** Tìm SPU active theo id (tương thích route /product/:id hiện tại). */
  async findActiveById(id: string) {
    return prisma.product.findFirst({
      where: { id, isActive: true },
      include: catalogProductInclude,
    })
  },

  /** Ưu tiên slug, fallback id — một endpoint cho cả hai kiểu URL. */
  async findActiveBySlugOrId(slugOrId: string) {
    const bySlug = await this.findActiveBySlug(slugOrId)
    if (bySlug) return bySlug
    return this.findActiveById(slugOrId)
  },
}

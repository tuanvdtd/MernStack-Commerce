import { ApiError } from '~/core/http/ApiError'
import {
  toCatalogProductDetail,
  toCatalogProductListItem,
} from '~/modules/catalog/catalog.mapper'
import { CatalogRepo } from '~/modules/catalog/catalog.repo'
import type { CatalogListFilters } from '~/modules/catalog/catalog.types'

export const CatalogService = {
  /** Danh sách sản phẩm public — guest và user đều dùng chung. */
  async listProducts(filters: CatalogListFilters) {
    const { items, total } = await CatalogRepo.list(filters)
    const totalPages = total === 0 ? 0 : Math.ceil(total / filters.limit)

    return {
      items: items.map(toCatalogProductListItem),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    }
  },

  /** Chi tiết sản phẩm theo slug hoặc id — chỉ trả về SPU đang active. */
  async getProductBySlugOrId(slugOrId: string) {
    const product = await CatalogRepo.findActiveBySlugOrId(slugOrId)
    if (!product) {
      throw ApiError.NotFound('Product not found')
    }

    return toCatalogProductDetail(product)
  },
}

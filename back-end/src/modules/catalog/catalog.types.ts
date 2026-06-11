/** Bộ lọc danh sách sản phẩm public (guest/user). */
export type CatalogListFilters = {
  page: number
  limit: number
  categoryId?: string
  categorySlug?: string
  brand?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort: 'newest' | 'price_asc' | 'price_desc'
}

/** Item rút gọn cho grid danh mục / homepage. */
export type CatalogProductListItem = {
  id: string
  name: string
  slug: string
  brand: string
  imgUrl?: string
  category: {
    id: string
    name: string
    slug: string
  }
  minPrice: number
  maxPrice: number
  inStock: boolean
  averageRating: number
  reviewCount: number
}

/** Chi tiết SPU + SKU cho trang sản phẩm / quick view. */
export type CatalogProductDetail = CatalogProductListItem & {
  description: string
  optionAxes: string[]
  variants: Array<{
    id: string
    price: number
    imgUrl?: string
    stockQuantity: number
    inStock: boolean
    options: Array<{
      optionName: string
      value: string
    }>
  }>
}

export type CatalogProductListResult = {
  items: CatalogProductListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

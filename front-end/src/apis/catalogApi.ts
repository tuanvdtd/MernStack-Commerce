import api from "./axiosConfig"

export type CatalogCategoryRef = {
  id: string
  name: string
  slug: string
}

export type CatalogProductListItem = {
  id: string
  name: string
  slug: string
  brand: string
  imgUrl?: string
  category: CatalogCategoryRef
  minPrice: number
  maxPrice: number
  inStock: boolean
}

export type CatalogProductVariant = {
  id: string
  price: number
  imgUrl?: string
  stockQuantity: number
  inStock: boolean
  options: Array<{
    optionName: string
    value: string
  }>
}

export type CatalogProductDetail = CatalogProductListItem & {
  description: string
  optionAxes: string[]
  variants: CatalogProductVariant[]
}

export type CatalogProductListParams = {
  page?: number
  limit?: number
  categoryId?: string
  categorySlug?: string
  brand?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: "newest" | "price_asc" | "price_desc"
}

export type CatalogProductListResponse = {
  items: CatalogProductListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/** Lấy danh sách sản phẩm public — guest/user, không cần token. */
export async function fetchCatalogProducts(
  params?: CatalogProductListParams
): Promise<CatalogProductListResponse> {
  const response = await api.get<CatalogProductListResponse>("/catalog/products", {
    params,
  })
  return response.data
}

/** Lấy chi tiết sản phẩm theo slug hoặc id — guest/user. */
export async function fetchCatalogProduct(
  slugOrId: string
): Promise<CatalogProductDetail> {
  const response = await api.get<CatalogProductDetail>(
    `/catalog/products/${encodeURIComponent(slugOrId)}`
  )
  return response.data
}

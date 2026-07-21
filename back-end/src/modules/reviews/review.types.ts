/** Body tạo đánh giá mới cho một SPU. */
export type CreateReviewInput = {
  rating: number
  comment?: string
}

/** Body cập nhật đánh giá — tất cả optional. */
export type PatchReviewInput = {
  rating?: number
  comment?: string | null
}

/** Bộ lọc danh sách review theo sản phẩm. */
export type ReviewListFilters = {
  productId: string
  page: number
  limit: number
}

/** Review trả về cho storefront / API public. */
export type ReviewItem = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export type ReviewListResult = {
  items: ReviewItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

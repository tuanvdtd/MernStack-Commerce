import { ApiError } from '~/core/http/ApiError'
import { toReviewItem } from '~/modules/reviews/review.mapper'
import { ReviewRepo } from '~/modules/reviews/review.repo'
import type {
  CreateReviewInput,
  PatchReviewInput,
  ReviewListFilters,
} from '~/modules/reviews/review.types'
import { CatalogRepo } from '~/modules/catalog/catalog.repo'

export const ReviewService = {
  /** Danh sách review công khai theo SPU — chỉ sản phẩm đang bán. */
  async listByProduct(filters: ReviewListFilters) {
    const product = await CatalogRepo.findActiveById(filters.productId)
    if (!product) {
      throw ApiError.NotFound('Product not found')
    }

    const { items, total } = await ReviewRepo.listByProduct(filters)
    const totalPages = total === 0 ? 0 : Math.ceil(total / filters.limit)

    return {
      items: items.map(toReviewItem),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    }
  },

  /** User đăng nhập tạo đánh giá — mỗi user một review / SPU. */
  async create(userId: number, productId: string, input: CreateReviewInput) {
    const product = await CatalogRepo.findActiveById(productId)
    if (!product) {
      throw ApiError.NotFound('Product not found')
    }

    try {
      const review = await ReviewRepo.create(userId, productId, input)
      return toReviewItem(review)
    } catch (error) {
      if (ReviewRepo.isUniqueViolation(error)) {
        throw ApiError.Conflict('You have already reviewed this product')
      }
      throw error
    }
  },

  /** User sửa review của chính mình. */
  async update(userId: number, reviewId: string, input: PatchReviewInput) {
    const existing = await ReviewRepo.findById(reviewId)
    if (!existing) {
      throw ApiError.NotFound('Review not found')
    }

    if (existing.userId !== userId) {
      throw ApiError.Forbidden('You can only edit your own review')
    }

    const review = await ReviewRepo.update(reviewId, input)
    return toReviewItem(review)
  },

  /** User xóa review của chính mình. */
  async delete(userId: number, reviewId: string) {
    const existing = await ReviewRepo.findById(reviewId)
    if (!existing) {
      throw ApiError.NotFound('Review not found')
    }

    if (existing.userId !== userId) {
      throw ApiError.Forbidden('You can only delete your own review')
    }

    await ReviewRepo.delete(reviewId)
    return { message: 'Review deleted' }
  },
}

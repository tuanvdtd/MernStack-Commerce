import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { ReviewService } from '~/modules/reviews/review.service'
import type {
  CreateReviewInput,
  PatchReviewInput,
} from '~/modules/reviews/review.types'
import { listProductReviewsQuerySchema } from '~/modules/reviews/review.validation'

export const ReviewController = {
  /** GET /reviews/products/:productId — danh sách review công khai. */
  listByProduct: async (req: AuthRequest, res: Response) => {
    const query = listProductReviewsQuerySchema.parse(req.query)
    const result = await ReviewService.listByProduct({
      productId: String(req.params.productId),
      page: query.page,
      limit: query.limit,
    })
    return res.json(result)
  },

  /** POST /reviews/products/:productId — tạo review (yêu cầu đăng nhập). */
  create: async (req: AuthRequest, res: Response) => {
    const review = await ReviewService.create(
      req.user!.id,
      String(req.params.productId),
      req.body as CreateReviewInput,
    )
    return res.status(201).json(review)
  },

  /** PATCH /reviews/:reviewId — sửa review của chính mình. */
  update: async (req: AuthRequest, res: Response) => {
    const review = await ReviewService.update(
      req.user!.id,
      String(req.params.reviewId),
      req.body as PatchReviewInput,
    )
    return res.json(review)
  },

  /** DELETE /reviews/:reviewId — xóa review của chính mình. */
  delete: async (req: AuthRequest, res: Response) => {
    const result = await ReviewService.delete(
      req.user!.id,
      String(req.params.reviewId),
    )
    return res.json(result)
  },
}

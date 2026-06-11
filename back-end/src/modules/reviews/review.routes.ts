import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { ReviewController } from '~/modules/reviews/review.controller'
import {
  CreateProductReviewSchema,
  DeleteReviewSchema,
  ListProductReviewsSchema,
  PatchReviewSchema,
} from '~/modules/reviews/review.validation'

const r = Router()

r.get(
  '/products/:productId',
  validateRequest(ListProductReviewsSchema),
  asyncHandler(ReviewController.listByProduct),
)

r.post(
  '/products/:productId',
  authenticate,
  requirePermission(permissions.VIEW_USER),
  validateRequest(CreateProductReviewSchema),
  asyncHandler(ReviewController.create),
)

r.patch(
  '/:reviewId',
  authenticate,
  requirePermission(permissions.VIEW_USER),
  validateRequest(PatchReviewSchema),
  asyncHandler(ReviewController.update),
)

r.delete(
  '/:reviewId',
  authenticate,
  requirePermission(permissions.VIEW_USER),
  validateRequest(DeleteReviewSchema),
  asyncHandler(ReviewController.delete),
)

export default r

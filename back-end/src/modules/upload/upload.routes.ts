import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { multerUploadMiddleware } from '~/core/upload/multer'
import { validateRequest } from '~/core/validate/validateRequest'
import { UploadController } from '~/modules/upload/upload.controller'
import { DeleteProductImageSchema } from '~/modules/upload/upload.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_ADMIN))

r.post(
  '/product-image',
  multerUploadMiddleware.upload.single('productImage'),
  asyncHandler(UploadController.uploadProductImage),
)

r.delete(
  '/product-image',
  validateRequest(DeleteProductImageSchema),
  asyncHandler(UploadController.deleteProductImage),
)

export default r

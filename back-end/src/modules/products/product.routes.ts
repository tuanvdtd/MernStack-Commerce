import { Router } from 'express'

import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { permissions } from '~/config/rbacConfig'
import { ProductController } from '~/modules/products/product.controller'
import {
  assertProductImages,
  parseProductFormData,
  productMultipartUpload,
} from '~/modules/products/product.middleware'
import {
  CreateProductSchema,
  GetProductSchema,
  UpdateProductSchema,
} from '~/modules/products/product.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_ADMIN))

r.get('/', asyncHandler(ProductController.list))
r.get(
  '/:id',
  validateRequest(GetProductSchema),
  asyncHandler(ProductController.getById),
)
r.post(
  '/',
  productMultipartUpload,
  parseProductFormData,
  validateRequest(CreateProductSchema),
  assertProductImages,
  asyncHandler(ProductController.create),
)
r.put(
  '/:id',
  productMultipartUpload,
  parseProductFormData,
  validateRequest(UpdateProductSchema),
  assertProductImages,
  asyncHandler(ProductController.update),
)
r.delete(
  '/:id',
  validateRequest(GetProductSchema),
  asyncHandler(ProductController.remove),
)

export default r

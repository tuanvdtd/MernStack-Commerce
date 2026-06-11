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
  PatchProductSpuSchema,
  UpdateProductVariantsSchema,
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
// Bước 1 edit: partial SPU
r.patch(
  '/:id',
  productMultipartUpload,
  parseProductFormData,
  validateRequest(PatchProductSpuSchema),
  asyncHandler(ProductController.patchSpu),
)
// Bước 2 edit: đồng bộ toàn bộ SKU
r.put(
  '/:id/variants',
  productMultipartUpload,
  parseProductFormData,
  validateRequest(UpdateProductVariantsSchema),
  asyncHandler(ProductController.updateVariants),
)
r.delete(
  '/:id',
  validateRequest(GetProductSchema),
  asyncHandler(ProductController.remove),
)

export default r

import { Router } from 'express'

import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { permissions } from '~/config/rbacConfig'
import { ProductController } from '~/modules/products/product.controller'
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
  validateRequest(CreateProductSchema),
  asyncHandler(ProductController.create),
)
r.patch(
  '/:id',
  validateRequest(PatchProductSpuSchema),
  asyncHandler(ProductController.patchSpu),
)
r.put(
  '/:id/variants',
  validateRequest(UpdateProductVariantsSchema),
  asyncHandler(ProductController.updateVariants),
)
r.delete(
  '/:id',
  validateRequest(GetProductSchema),
  asyncHandler(ProductController.remove),
)

export default r

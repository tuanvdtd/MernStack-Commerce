import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CategoryController } from '~/modules/categories/category.controller'
import { CreateCategorySchema } from '~/modules/categories/category.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_ADMIN))

r.get('/', asyncHandler(CategoryController.list))
r.post(
  '/',
  validateRequest(CreateCategorySchema),
  asyncHandler(CategoryController.create),
)

export default r

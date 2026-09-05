import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { OrderController } from '~/modules/orders/order.controller'
import {
  GetOrderSchema,
  ListAdminOrdersSchema,
  UpdateOrderStatusSchema,
} from '~/modules/orders/order.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_ADMIN))

r.get('/', validateRequest(ListAdminOrdersSchema), asyncHandler(OrderController.listAdmin))
r.get('/:id', validateRequest(GetOrderSchema), asyncHandler(OrderController.getAdmin))
r.patch(
  '/:id/status',
  validateRequest(UpdateOrderStatusSchema),
  asyncHandler(OrderController.updateStatusAdmin),
)

export default r

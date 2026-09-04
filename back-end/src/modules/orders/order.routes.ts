import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { OrderController } from '~/modules/orders/order.controller'
import { GetOrderSchema, ListMyOrdersSchema, TrackOrderSchema } from '~/modules/orders/order.validation'

const r = Router()

// Public — no auth. Must come before the authenticate() gate below.
r.get('/track', validateRequest(TrackOrderSchema), asyncHandler(OrderController.track))

r.use(authenticate, requirePermission(permissions.VIEW_USER))

r.get('/', validateRequest(ListMyOrdersSchema), asyncHandler(OrderController.listMine))
r.get('/:id', validateRequest(GetOrderSchema), asyncHandler(OrderController.getMine))
r.post('/:id/cancel', validateRequest(GetOrderSchema), asyncHandler(OrderController.cancelMine))

export default r

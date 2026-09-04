import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CartController } from '~/modules/cart/cart.controller'
import {
  AddCartItemSchema,
  RemoveCartItemSchema,
  SelectAllCartItemsSchema,
  UpdateCartItemSchema,
} from '~/modules/cart/cart.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_USER))

r.get('/', asyncHandler(CartController.getMine))
r.post('/items', validateRequest(AddCartItemSchema), asyncHandler(CartController.addItem))
r.patch('/items/:id', validateRequest(UpdateCartItemSchema), asyncHandler(CartController.updateItem))
r.delete('/items/:id', validateRequest(RemoveCartItemSchema), asyncHandler(CartController.removeItem))
r.patch('/select-all', validateRequest(SelectAllCartItemsSchema), asyncHandler(CartController.selectAll))

export default r

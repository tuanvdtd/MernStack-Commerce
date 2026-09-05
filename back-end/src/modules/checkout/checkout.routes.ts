import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { requireIdempotencyKey } from '~/core/http/requireIdempotencyKey'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CheckoutController } from '~/modules/checkout/checkout.controller'
import { CheckoutSchema } from '~/modules/checkout/checkout.validation'

const r = Router()

r.post(
  '/',
  authenticate,
  requirePermission(permissions.VIEW_USER),
  requireIdempotencyKey,
  validateRequest(CheckoutSchema),
  asyncHandler(CheckoutController.checkout),
)

export default r

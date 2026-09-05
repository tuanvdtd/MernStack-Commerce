import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { AddressController } from '~/modules/addresses/address.controller'
import {
  AddressIdParamSchema,
  CreateAddressSchema,
  PatchAddressSchema,
} from '~/modules/addresses/address.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_USER))

r.get('/', asyncHandler(AddressController.list))
r.post('/', validateRequest(CreateAddressSchema), asyncHandler(AddressController.create))
r.patch('/:id', validateRequest(PatchAddressSchema), asyncHandler(AddressController.update))
r.patch(
  '/:id/default',
  validateRequest(AddressIdParamSchema),
  asyncHandler(AddressController.setDefault),
)
r.delete('/:id', validateRequest(AddressIdParamSchema), asyncHandler(AddressController.remove))

export default r

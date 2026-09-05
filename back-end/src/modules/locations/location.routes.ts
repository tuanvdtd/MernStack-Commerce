import { Router } from 'express'

import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { LocationController } from '~/modules/locations/location.controller'
import { ListWardsSchema } from '~/modules/locations/location.validation'

const r = Router()

r.get('/provinces', asyncHandler(LocationController.listProvinces))
r.get(
  '/provinces/:code/wards',
  validateRequest(ListWardsSchema),
  asyncHandler(LocationController.listWards),
)

export default r

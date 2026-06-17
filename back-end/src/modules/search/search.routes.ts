import { Router } from 'express'

import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { SearchController } from '~/modules/search/search.controller'
import { SearchScenario3Schema } from '~/modules/search/search.validation'

const r = Router()

// Storefront search — public, không yêu cầu auth.
r.get(
  '',
  validateRequest(SearchScenario3Schema),
  asyncHandler(SearchController.scenario3),
)

export default r

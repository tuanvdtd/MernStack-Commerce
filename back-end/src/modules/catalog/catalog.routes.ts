import { Router } from 'express'

import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CatalogController } from '~/modules/catalog/catalog.controller'
import {
  GetCatalogProductSchema,
  ListCatalogProductsSchema,
} from '~/modules/catalog/catalog.validation'

const r = Router()

r.get(
  '/products',
  validateRequest(ListCatalogProductsSchema),
  asyncHandler(CatalogController.listProducts),
)
r.get(
  '/products/:slugOrId',
  validateRequest(GetCatalogProductSchema),
  asyncHandler(CatalogController.getProduct),
)

export default r

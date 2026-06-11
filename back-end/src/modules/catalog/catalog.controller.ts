import { Request, Response } from 'express'

import { CatalogService } from '~/modules/catalog/catalog.service'
import { listCatalogProductsQuerySchema } from '~/modules/catalog/catalog.validation'

export const CatalogController = {
  /** GET /catalog/products — không yêu cầu đăng nhập. */
  listProducts: async (req: Request, res: Response) => {
    const filters = listCatalogProductsQuerySchema.parse(req.query)
    const result = await CatalogService.listProducts(filters)
    return res.json(result)
  },

  /** GET /catalog/products/:slugOrId — không yêu cầu đăng nhập. */
  getProduct: async (req: Request, res: Response) => {
    const product = await CatalogService.getProductBySlugOrId(
      String(req.params.slugOrId),
    )
    return res.json(product)
  },
}

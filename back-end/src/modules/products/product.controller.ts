import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { ProductService } from '~/modules/products/product.service'
import type {
  CreateProductInput,
  PatchProductSpuInput,
  UpdateProductVariantsInput,
} from '~/modules/products/product.types'

export const ProductController = {
  list: async (_req: AuthRequest, res: Response) => {
    const products = await ProductService.list()
    return res.json(products)
  },

  getById: async (req: AuthRequest, res: Response) => {
    const product = await ProductService.getById(String(req.params.id))
    return res.json(product)
  },

  create: async (req: AuthRequest, res: Response) => {
    const product = await ProductService.create(req.body as CreateProductInput)
    return res.status(201).json(product)
  },

  /** PATCH /products/:id */
  patchSpu: async (req: AuthRequest, res: Response) => {
    const product = await ProductService.patchSpu(
      String(req.params.id),
      req.body as PatchProductSpuInput,
    )
    return res.json(product)
  },

  /** PUT /products/:id/variants */
  updateVariants: async (req: AuthRequest, res: Response) => {
    const product = await ProductService.updateVariants(
      String(req.params.id),
      req.body as UpdateProductVariantsInput,
    )
    return res.json(product)
  },

  remove: async (req: AuthRequest, res: Response) => {
    const result = await ProductService.remove(String(req.params.id))
    return res.json(result)
  },
}

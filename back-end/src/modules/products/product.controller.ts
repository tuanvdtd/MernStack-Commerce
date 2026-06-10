import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { ProductService } from '~/modules/products/product.service'
import type { CreateProductInput } from '~/modules/products/product.types'

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
    const product = await ProductService.create(
      req.body as CreateProductInput,
      req.productImageUploads,
    )
    return res.status(201).json(product)
  },

  update: async (req: AuthRequest, res: Response) => {
    const product = await ProductService.update(
      String(req.params.id),
      req.body as CreateProductInput,
      req.productImageUploads,
    )
    return res.json(product)
  },

  remove: async (req: AuthRequest, res: Response) => {
    const result = await ProductService.remove(String(req.params.id))
    return res.json(result)
  },
}

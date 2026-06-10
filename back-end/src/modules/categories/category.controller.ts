import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { CategoryService } from '~/modules/categories/category.service'

export const CategoryController = {
  list: async (_req: AuthRequest, res: Response) => {
    const categories = await CategoryService.list()
    return res.json(categories)
  },

  create: async (req: AuthRequest, res: Response) => {
    const category = await CategoryService.create(req.body.name)
    return res.status(201).json(category)
  },
}

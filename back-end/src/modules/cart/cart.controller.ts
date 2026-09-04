import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { CartService } from '~/modules/cart/cart.service'
import type { AddCartItemInput, UpdateCartItemInput } from '~/modules/cart/cart.types'

export const CartController = {
  getMine: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.getMyCart(req.user!.id)
    return res.json(cart)
  },

  addItem: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.addItem(req.user!.id, req.body as AddCartItemInput)
    return res.status(201).json(cart)
  },

  updateItem: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.updateItem(
      req.user!.id,
      String(req.params.id),
      req.body as UpdateCartItemInput,
    )
    return res.json(cart)
  },

  removeItem: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.removeItem(req.user!.id, String(req.params.id))
    return res.json(cart)
  },

  selectAll: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.selectAll(req.user!.id, Boolean(req.body.selected))
    return res.json(cart)
  },
}

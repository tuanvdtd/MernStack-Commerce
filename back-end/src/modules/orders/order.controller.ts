import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { OrderService } from '~/modules/orders/order.service'
import {
  listAdminOrdersQuerySchema,
  listMyOrdersQuerySchema,
  trackOrderQuerySchema,
} from '~/modules/orders/order.validation'
import type { UpdateOrderStatusInput } from '~/modules/orders/order.types'

export const OrderController = {
  listMine: async (req: AuthRequest, res: Response) => {
    const query = listMyOrdersQuerySchema.parse(req.query)
    const result = await OrderService.listForUser({ userId: req.user!.id, ...query })
    return res.json(result)
  },

  getMine: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.getForUser(String(req.params.id), req.user!.id)
    return res.json(order)
  },

  cancelMine: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.cancelForUser(String(req.params.id), req.user!.id)
    return res.json(order)
  },

  track: async (req: AuthRequest, res: Response) => {
    const query = trackOrderQuerySchema.parse(req.query)
    const order = await OrderService.track(query.orderNumber, query.phone)
    return res.json(order)
  },

  listAdmin: async (req: AuthRequest, res: Response) => {
    const query = listAdminOrdersQuerySchema.parse(req.query)
    const result = await OrderService.listForAdmin(query)
    return res.json(result)
  },

  getAdmin: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.getForAdmin(String(req.params.id))
    return res.json(order)
  },

  updateStatusAdmin: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.updateStatusForAdmin(
      String(req.params.id),
      req.body as UpdateOrderStatusInput,
    )
    return res.json(order)
  },
}

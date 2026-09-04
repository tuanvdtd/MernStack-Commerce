import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import type { IdempotentRequest } from '~/core/http/requireIdempotencyKey'
import { CheckoutService } from '~/modules/checkout/checkout.service'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'

type Req = AuthRequest & IdempotentRequest

export const CheckoutController = {
  checkout: async (req: Req, res: Response) => {
    const order = await CheckoutService.checkout(
      req.user!.id,
      req.body as CheckoutInput,
      req.idempotencyKey!,
    )
    return res.status(201).json(order)
  },
}

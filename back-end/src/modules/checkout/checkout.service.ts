import { ApiError } from '~/core/http/ApiError'
import { idempotency } from '~/core/idempotency/idempotency'
import { CheckoutRepo } from '~/modules/checkout/checkout.repo'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'
import { toOrderDTO } from '~/modules/orders/order.mapper'
import { OrderRepo } from '~/modules/orders/order.repo'

export const CheckoutService = {
  async checkout(userId: string, input: CheckoutInput, idempotencyKey: string) {
    if (input.paymentMethod !== 'cod') {
      throw ApiError.NotImplemented(
        'Online payment is not implemented yet (Phase 3)',
        undefined,
        'PAYMENT_METHOD_NOT_IMPLEMENTED',
      )
    }

    const existingOrderId = await idempotency.getOrderId(userId, idempotencyKey)
    if (existingOrderId) {
      const existingOrder = await OrderRepo.findById(existingOrderId)
      if (existingOrder) return toOrderDTO(existingOrder)
      // Mapped order id no longer resolves (e.g. Redis TTL outlived a deleted test order) — fall through and reprocess.
    }

    const order = await CheckoutRepo.checkout(userId, input)
    await idempotency.saveOrderId(userId, idempotencyKey, order.id)
    return toOrderDTO(order)
  },
}

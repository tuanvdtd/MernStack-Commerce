import api from "./axiosConfig"
import type { Order } from "./orderApi"

export type CheckoutPayload = {
  addressId: string
  paymentMethod: "cod"
  discountCode?: string
}

export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const response = await api.post<Order>("/checkout", payload, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
  })
  return response.data
}

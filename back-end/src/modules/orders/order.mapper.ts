import type { Order, OrderItem } from '~/generated/prisma/client'
import type { OrderDTO, OrderItemDTO, OrderTrackingDTO } from '~/modules/orders/order.types'

type OrderWithItems = Order & { items: OrderItem[] }

function toOrderItemDTO(item: OrderItem): OrderItemDTO {
  return {
    id: item.id,
    variantId: item.variantId,
    productName: item.productName,
    variantLabel: item.variantLabel,
    imageUrl: item.imageUrl ?? undefined,
    price: Number(item.price),
    quantity: item.quantity,
    total: Number(item.price) * item.quantity,
  }
}

export function toOrderDTO(order: OrderWithItems): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    recipientName: order.recipientName,
    phone: order.phone,
    provinceName: order.provinceName,
    wardName: order.wardName,
    addressDetail: order.addressDetail,
    items: order.items.map(toOrderItemDTO),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discountAmount: Number(order.discountAmount),
    discountCode: order.discountCode ?? undefined,
    total: Number(order.total),
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    shipmentStatus: order.shipmentStatus,
    note: order.note ?? undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

/** Trimmed view for public order tracking — no unrelated PII beyond what's already order-facing. */
export function toOrderTrackingDTO(order: OrderWithItems): OrderTrackingDTO {
  const dto = toOrderDTO(order)
  return {
    orderNumber: dto.orderNumber,
    orderStatus: dto.orderStatus,
    shipmentStatus: dto.shipmentStatus,
    createdAt: dto.createdAt,
    items: dto.items,
    total: dto.total,
    provinceName: dto.provinceName,
    wardName: dto.wardName,
    addressDetail: dto.addressDetail,
  }
}

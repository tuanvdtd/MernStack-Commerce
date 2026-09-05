export type OrderItemDTO = {
  id: string
  variantId: string
  productName: string
  variantLabel: string
  imageUrl?: string
  price: number
  quantity: number
  total: number
}

export type OrderDTO = {
  id: string
  orderNumber: string
  userId: string
  recipientName: string
  phone: string
  provinceName: string
  wardName: string
  addressDetail: string
  items: OrderItemDTO[]
  subtotal: number
  shippingFee: number
  discountAmount: number
  discountCode?: string
  total: number
  orderStatus: string
  paymentMethod: string
  paymentStatus: string
  shipmentStatus: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type OrderTrackingDTO = Pick<
  OrderDTO,
  | 'orderNumber'
  | 'orderStatus'
  | 'shipmentStatus'
  | 'createdAt'
  | 'items'
  | 'total'
  | 'provinceName'
  | 'wardName'
  | 'addressDetail'
>

export type OrderListFilters = {
  userId: string
  page: number
  limit: number
  orderStatus?: string
}

export type AdminOrderListFilters = {
  page: number
  limit: number
  orderStatus?: string
  paymentMethod?: string
  search?: string
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export type UpdateOrderStatusInput = {
  orderStatus?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus?: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED'
  shipmentStatus?: 'NOT_SHIPPED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED'
}

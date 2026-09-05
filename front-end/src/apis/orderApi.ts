import api from "./axiosConfig"

export type OrderItem = {
  id: string
  variantId: string
  productName: string
  variantLabel: string
  imageUrl?: string
  price: number
  quantity: number
  total: number
}

export type Order = {
  id: string
  orderNumber: string
  userId: string
  recipientName: string
  phone: string
  provinceName: string
  wardName: string
  addressDetail: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  discountAmount: number
  discountCode?: string
  total: number
  orderStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  paymentMethod: "COD" | "ONLINE"
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED"
  shipmentStatus: "NOT_SHIPPED" | "SHIPPED" | "DELIVERED" | "RETURNED"
  note?: string
  createdAt: string
  updatedAt: string
}

export type PaginatedOrders = {
  items: Order[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export type OrderTrackingResult = {
  orderNumber: string
  orderStatus: Order["orderStatus"]
  shipmentStatus: Order["shipmentStatus"]
  createdAt: string
  items: OrderItem[]
  total: number
  provinceName: string
  wardName: string
  addressDetail: string
}

export async function fetchMyOrders(params?: {
  page?: number
  limit?: number
  orderStatus?: string
}): Promise<PaginatedOrders> {
  const response = await api.get<PaginatedOrders>("/orders", { params })
  return response.data
}

export async function fetchMyOrder(id: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`)
  return response.data
}

export async function cancelMyOrder(id: string): Promise<Order> {
  const response = await api.post<Order>(`/orders/${id}/cancel`)
  return response.data
}

export async function trackOrder(orderNumber: string, phone: string): Promise<OrderTrackingResult> {
  const response = await api.get<OrderTrackingResult>("/orders/track", {
    params: { orderNumber, phone },
  })
  return response.data
}

export async function fetchAdminOrders(params?: {
  page?: number
  limit?: number
  orderStatus?: string
  paymentMethod?: string
  search?: string
}): Promise<PaginatedOrders> {
  const response = await api.get<PaginatedOrders>("/admin/orders", { params })
  return response.data
}

export async function fetchAdminOrder(id: string): Promise<Order> {
  const response = await api.get<Order>(`/admin/orders/${id}`)
  return response.data
}

export async function updateAdminOrderStatus(
  id: string,
  data: Partial<Pick<Order, "orderStatus" | "paymentStatus" | "shipmentStatus">>
): Promise<Order> {
  const response = await api.patch<Order>(`/admin/orders/${id}/status`, data)
  return response.data
}

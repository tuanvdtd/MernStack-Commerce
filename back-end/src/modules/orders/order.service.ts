import { ApiError } from '~/core/http/ApiError'
import { toOrderDTO, toOrderTrackingDTO } from '~/modules/orders/order.mapper'
import { OrderRepo } from '~/modules/orders/order.repo'
import type {
  AdminOrderListFilters,
  OrderListFilters,
  PaginatedResult,
  UpdateOrderStatusInput,
} from '~/modules/orders/order.types'

const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED'])

// Allowed forward transitions for admin manual status updates. CANCELLED/DELIVERED are terminal.
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

function paginationOf(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) }
}

export const OrderService = {
  async listForUser(filters: OrderListFilters): Promise<PaginatedResult<ReturnType<typeof toOrderDTO>>> {
    const { items, total } = await OrderRepo.listForUser(filters)
    return { items: items.map(toOrderDTO), pagination: paginationOf(filters.page, filters.limit, total) }
  },

  async getForUser(id: string, userId: string) {
    const order = await OrderRepo.findByIdForUser(id, userId)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    return toOrderDTO(order)
  },

  async cancelForUser(id: string, userId: string) {
    const order = await OrderRepo.findByIdForUser(id, userId)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    if (!CANCELLABLE_STATUSES.has(order.orderStatus)) {
      throw ApiError.Conflict('Order can no longer be cancelled', undefined, 'ORDER_NOT_CANCELLABLE')
    }
    const cancelled = await OrderRepo.cancel(id)
    return toOrderDTO(cancelled)
  },

  async track(orderNumber: string, phone: string) {
    const order = await OrderRepo.findByOrderNumberAndPhone(orderNumber, phone)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    return toOrderTrackingDTO(order)
  },

  async listForAdmin(filters: AdminOrderListFilters) {
    const { items, total } = await OrderRepo.listForAdmin(filters)
    return { items: items.map(toOrderDTO), pagination: paginationOf(filters.page, filters.limit, total) }
  },

  async getForAdmin(id: string) {
    const order = await OrderRepo.findById(id)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    return toOrderDTO(order)
  },

  async updateStatusForAdmin(id: string, input: UpdateOrderStatusInput) {
    const existing = await OrderRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')

    if (input.orderStatus && input.orderStatus !== existing.orderStatus) {
      const allowed = ORDER_STATUS_TRANSITIONS[existing.orderStatus] ?? []
      if (!allowed.includes(input.orderStatus)) {
        throw ApiError.BadRequest(
          `Cannot transition order from ${existing.orderStatus} to ${input.orderStatus}`,
          undefined,
          'INVALID_ORDER_TRANSITION',
        )
      }
    }

    const updated = await OrderRepo.updateStatus(id, input)
    return toOrderDTO(updated)
  },
}

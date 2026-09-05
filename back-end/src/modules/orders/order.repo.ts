import { prisma } from '~/lib/prisma'
import type {
  AdminOrderListFilters,
  OrderListFilters,
  UpdateOrderStatusInput,
} from '~/modules/orders/order.types'

const orderInclude = { items: true } as const

export const OrderRepo = {
  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: orderInclude })
  },

  async findByIdForUser(id: string, userId: string) {
    return prisma.order.findFirst({ where: { id, userId }, include: orderInclude })
  },

  async findByOrderNumberAndPhone(orderNumber: string, phone: string) {
    return prisma.order.findFirst({ where: { orderNumber, phone }, include: orderInclude })
  },

  async listForUser(filters: OrderListFilters) {
    const where = {
      userId: filters.userId,
      ...(filters.orderStatus ? { orderStatus: filters.orderStatus as never } : {}),
    }
    const skip = (filters.page - 1) * filters.limit
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.order.count({ where }),
    ])
    return { items, total }
  },

  async listForAdmin(filters: AdminOrderListFilters) {
    const where: Record<string, unknown> = {}
    if (filters.orderStatus) where.orderStatus = filters.orderStatus
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod
    if (filters.search?.trim()) {
      where.OR = [
        { orderNumber: { contains: filters.search.trim() } },
        { recipientName: { contains: filters.search.trim() } },
      ]
    }
    const skip = (filters.page - 1) * filters.limit
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.order.count({ where }),
    ])
    return { items, total }
  },

  /** Cancel: restock items, reverse discount usage counters, mark CANCELLED — one transaction. */
  async cancel(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'CANCELLED' },
        include: orderInclude,
      })

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        })
      }

      if (order.discountCode) {
        const discount = await tx.discount.findUnique({ where: { code: order.discountCode } })
        if (discount) {
          await tx.discount.update({
            where: { id: discount.id },
            data: { usesCount: { decrement: 1 } },
          })
          await tx.discountUserUse.updateMany({
            where: { discountId: discount.id, userId: order.userId },
            data: { usesCount: { decrement: 1 } },
          })
        }
      }

      return order
    })
  },

  async updateStatus(id: string, input: UpdateOrderStatusInput) {
    return prisma.order.update({
      where: { id },
      data: {
        ...(input.orderStatus ? { orderStatus: input.orderStatus } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
        ...(input.shipmentStatus ? { shipmentStatus: input.shipmentStatus } : {}),
      },
      include: orderInclude,
    })
  },
}

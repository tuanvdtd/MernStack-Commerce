import { ApiError } from '~/core/http/ApiError'
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const variantInclude = {
  product: { select: { id: true, name: true } },
  options: { include: { optionValue: { include: { option: true } } } },
} as const

const cartInclude = {
  items: {
    include: { variant: { include: variantInclude } },
    orderBy: { createdAt: 'asc' as const },
  },
} as const

export type CartWithItems = Awaited<ReturnType<typeof CartRepo.findActiveByUser>>

async function getOrCreateActiveCart(tx: Tx, userId: string) {
  const existing = await tx.cart.findFirst({ where: { userId, state: 'ACTIVE' } })
  if (existing) return existing
  return tx.cart.create({ data: { id: newId(), userId, state: 'ACTIVE' } })
}

async function syncCountProduct(tx: Tx, cartId: string) {
  const count = await tx.cartItem.count({ where: { cartId } })
  await tx.cart.update({ where: { id: cartId }, data: { countProduct: count } })
}

async function findCartWithItems(tx: Tx, cartId: string) {
  return tx.cart.findUniqueOrThrow({ where: { id: cartId }, include: cartInclude })
}

export const CartRepo = {
  async findActiveByUser(userId: string) {
    return prisma.cart.findFirst({ where: { userId, state: 'ACTIVE' }, include: cartInclude })
  },

  async addItem(userId: string, variantId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const cart = await getOrCreateActiveCart(tx, userId)
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { product: { select: { name: true } } },
      })
      if (!variant) throw ApiError.NotFound('Product variant not found')

      const existingItem = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      })

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        })
      } else {
        await tx.cartItem.create({
          data: {
            id: newId(),
            cartId: cart.id,
            variantId,
            quantity,
            price: variant.price,
            name: variant.product.name,
          },
        })
      }

      await syncCountProduct(tx, cart.id)
      return findCartWithItems(tx, cart.id)
    })
  },

  async updateItem(userId: string, itemId: string, data: { quantity?: number; selected?: boolean }) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })
      if (!item) throw ApiError.NotFound('Cart item not found')

      await tx.cartItem.update({
        where: { id: itemId },
        data: {
          ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
          ...(data.selected !== undefined ? { selected: data.selected } : {}),
        },
      })

      return findCartWithItems(tx, item.cartId)
    })
  },

  async removeItem(userId: string, itemId: string) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })
      if (!item) throw ApiError.NotFound('Cart item not found')

      await tx.cartItem.delete({ where: { id: itemId } })
      await syncCountProduct(tx, item.cartId)
      return findCartWithItems(tx, item.cartId)
    })
  },

  async selectAll(userId: string, selected: boolean) {
    return prisma.$transaction(async (tx) => {
      const cart = await getOrCreateActiveCart(tx, userId)
      await tx.cartItem.updateMany({ where: { cartId: cart.id }, data: { selected } })
      return findCartWithItems(tx, cart.id)
    })
  },
}

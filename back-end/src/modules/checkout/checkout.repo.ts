import { Prisma } from '~/generated/prisma/client'
import { env } from '~/config/env'
import { ApiError } from '~/core/http/ApiError'
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'
import { generateOrderNumber } from '~/utils/orderNumber'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const variantInclude = {
  product: { select: { id: true, name: true } },
  options: { include: { optionValue: { include: { option: true } } } },
} as const

type VariantWithRelations = Awaited<ReturnType<Tx['productVariant']['findUnique']>> & {
  product: { id: string; name: string }
  options: Array<{ optionValue: { value: string } }>
}

function buildVariantLabel(variant: VariantWithRelations): string {
  return variant.options.map((o) => o.optionValue.value).join(' / ') || 'Default'
}

async function resolveLineItems(tx: Tx, userId: string, input: CheckoutInput) {
  if (input.buyNowItem) {
    const variant = await tx.productVariant.findUnique({
      where: { id: input.buyNowItem.variantId },
      include: variantInclude,
    })
    if (!variant) throw ApiError.NotFound('Product variant not found')
    return {
      lines: [{ variant: variant as VariantWithRelations, quantity: input.buyNowItem.quantity }],
      cartId: null as string | null,
      cartItemIds: [] as string[],
    }
  }

  const cart = await tx.cart.findFirst({
    where: { userId, state: 'ACTIVE' },
    include: { items: { where: { selected: true }, include: { variant: { include: variantInclude } } } },
  })

  const selectedItems = cart?.items ?? []
  if (selectedItems.length === 0) {
    throw ApiError.BadRequest('No items selected for checkout', undefined, 'CART_EMPTY')
  }

  return {
    lines: selectedItems.map((item) => ({
      variant: item.variant as VariantWithRelations,
      quantity: item.quantity,
    })),
    cartId: cart!.id,
    cartItemIds: selectedItems.map((item) => item.id),
  }
}

async function validateAndPriceStock(
  tx: Tx,
  lines: Array<{ variant: VariantWithRelations; quantity: number }>,
) {
  let subtotal = new Prisma.Decimal(0)

  for (const line of lines) {
    // Re-read live inside the transaction so two concurrent checkouts can't both succeed on the last unit.
    const fresh = await tx.productVariant.findUniqueOrThrow({ where: { id: line.variant.id } })
    if (fresh.stockQuantity < line.quantity) {
      throw ApiError.Conflict(
        `Insufficient stock for variant ${fresh.id}`,
        { variantId: fresh.id },
        'INSUFFICIENT_STOCK',
      )
    }
    subtotal = subtotal.add(fresh.price.mul(line.quantity))
  }

  return subtotal
}

async function validateDiscount(
  tx: Tx,
  userId: string,
  code: string | undefined,
  subtotal: Prisma.Decimal,
  productIds: string[],
) {
  if (!code) return { discount: null, discountAmount: new Prisma.Decimal(0) }

  const discount = await tx.discount.findUnique({ where: { code }, include: { products: true } })
  if (!discount || !discount.isActive) {
    throw ApiError.BadRequest('Discount code is invalid', undefined, 'DISCOUNT_INVALID')
  }

  const now = new Date()
  if (now < discount.startDate || now > discount.endDate) {
    throw ApiError.BadRequest('Discount code has expired', undefined, 'DISCOUNT_EXPIRED')
  }

  if (subtotal.lt(discount.minOrderValue)) {
    throw ApiError.BadRequest(
      'Order does not meet the minimum value for this discount',
      undefined,
      'DISCOUNT_INVALID',
    )
  }

  // appliesTo=SPECIFIC scopes the discount to certain products via DiscountProduct — enforce it,
  // otherwise a "specific products only" discount would incorrectly apply to any order.
  if (discount.appliesTo === 'SPECIFIC') {
    const eligible = discount.products.some((p) => productIds.includes(p.productId))
    if (!eligible) {
      throw ApiError.BadRequest(
        'Discount code does not apply to items in this order',
        undefined,
        'DISCOUNT_INVALID',
      )
    }
  }

  if (discount.usesCount >= discount.maxUses) {
    throw ApiError.Conflict('Discount code has reached its usage limit', undefined, 'DISCOUNT_LIMIT_REACHED')
  }

  const userUse = await tx.discountUserUse.findUnique({
    where: { discountId_userId: { discountId: discount.id, userId } },
  })
  if ((userUse?.usesCount ?? 0) >= discount.maxUsesPerUser) {
    throw ApiError.Conflict(
      'You have reached the usage limit for this discount',
      undefined,
      'DISCOUNT_LIMIT_REACHED',
    )
  }

  const rawAmount =
    discount.type === 'PERCENTAGE' ? subtotal.mul(discount.value).div(100) : discount.value
  const discountAmount = rawAmount.gt(discount.maxValue) ? discount.maxValue : rawAmount

  return { discount, discountAmount }
}

export const CheckoutRepo = {
  async checkout(userId: string, input: CheckoutInput) {
    return prisma.$transaction(async (tx) => {
      const { lines, cartId, cartItemIds } = await resolveLineItems(tx, userId, input)

      const address = await tx.address.findFirst({ where: { id: input.addressId, userId } })
      if (!address) {
        throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
      }

      const subtotal = await validateAndPriceStock(tx, lines)
      const productIds = lines.map((l) => l.variant.product.id)
      const { discount, discountAmount } = await validateDiscount(
        tx,
        userId,
        input.discountCode,
        subtotal,
        productIds,
      )

      const shippingFee = new Prisma.Decimal(env.SHIPPING_FLAT_FEE)
      const total = subtotal.sub(discountAmount).add(shippingFee)

      let order: Prisma.OrderGetPayload<{ include: { items: true } }> | undefined
      for (let attempt = 0; attempt < 3 && !order; attempt++) {
        try {
          order = await tx.order.create({
            data: {
              id: newId(),
              orderNumber: generateOrderNumber(),
              userId,
              recipientName: address.recipientName,
              phone: address.phone,
              provinceName: address.provinceName,
              wardName: address.wardName,
              addressDetail: address.detail,
              subtotal,
              shippingFee,
              discountAmount,
              discountCode: discount?.code,
              total,
              paymentMethod: 'COD',
              items: {
                create: lines.map((line) => ({
                  id: newId(),
                  variantId: line.variant.id,
                  productName: line.variant.product.name,
                  variantLabel: buildVariantLabel(line.variant),
                  imageUrl: line.variant.imgUrl ?? undefined,
                  price: line.variant.price,
                  quantity: line.quantity,
                })),
              },
            },
            include: { items: true },
          })
        } catch (error) {
          const isCollision =
            error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
          if (!isCollision) throw error
          // orderNumber collision — loop retries with a freshly generated number.
        }
      }
      if (!order) throw ApiError.Internal('Failed to generate a unique order number')

      for (const line of lines) {
        await tx.productVariant.update({
          where: { id: line.variant.id },
          data: { stockQuantity: { decrement: line.quantity } },
        })
      }

      if (discount) {
        await tx.discount.update({ where: { id: discount.id }, data: { usesCount: { increment: 1 } } })
        await tx.discountUserUse.upsert({
          where: { discountId_userId: { discountId: discount.id, userId } },
          create: { discountId: discount.id, userId, usesCount: 1 },
          update: { usesCount: { increment: 1 } },
        })
      }

      if (cartId && cartItemIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } })
        const remaining = await tx.cartItem.count({ where: { cartId } })
        await tx.cart.update({ where: { id: cartId }, data: { countProduct: remaining } })
      }

      return order
    })
  },
}

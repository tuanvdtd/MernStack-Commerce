import type { CartWithItems } from '~/modules/cart/cart.repo'
import type { CartDTO } from '~/modules/cart/cart.types'

function buildVariantLabel(options: Array<{ optionValue: { value: string } }>): string {
  return options.map((o) => o.optionValue.value).join(' / ') || 'Default'
}

export function toCartDTO(cart: NonNullable<CartWithItems>): CartDTO {
  return {
    id: cart.id,
    countProduct: cart.countProduct,
    items: cart.items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      productId: item.variant.product.id,
      productName: item.variant.product.name,
      variantLabel: buildVariantLabel(item.variant.options),
      imageUrl: item.variant.imgUrl ?? undefined,
      price: Number(item.variant.price),
      quantity: item.quantity,
      selected: item.selected,
      stockQuantity: item.variant.stockQuantity,
    })),
  }
}

export const EMPTY_CART_DTO: CartDTO = { id: null, items: [], countProduct: 0 }

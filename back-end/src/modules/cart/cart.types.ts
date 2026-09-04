export type AddCartItemInput = {
  variantId: string
  quantity: number
}

export type UpdateCartItemInput = {
  quantity?: number
  selected?: boolean
}

export type CartItemDTO = {
  id: string
  variantId: string
  productId: string
  productName: string
  variantLabel: string
  imageUrl?: string
  price: number
  quantity: number
  selected: boolean
  stockQuantity: number
}

export type CartDTO = {
  id: string | null
  items: CartItemDTO[]
  countProduct: number
}

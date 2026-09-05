export type CheckoutItemInput = {
  variantId: string
  quantity: number
}

export type CheckoutInput = {
  addressId: string
  paymentMethod: 'cod' | 'online'
  discountCode?: string
  buyNowItem?: CheckoutItemInput
}

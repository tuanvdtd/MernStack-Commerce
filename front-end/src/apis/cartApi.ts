import api from "./axiosConfig"

export type CartItem = {
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

export type Cart = {
  id: string | null
  items: CartItem[]
  countProduct: number
}

export async function fetchCart(): Promise<Cart> {
  const response = await api.get<Cart>("/cart")
  return response.data
}

export async function addCartItem(variantId: string, quantity: number): Promise<Cart> {
  const response = await api.post<Cart>("/cart/items", { variantId, quantity })
  return response.data
}

export async function updateCartItem(
  itemId: string,
  data: { quantity?: number; selected?: boolean }
): Promise<Cart> {
  const response = await api.patch<Cart>(`/cart/items/${itemId}`, data)
  return response.data
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await api.delete<Cart>(`/cart/items/${itemId}`)
  return response.data
}

export async function selectAllCartItems(selected: boolean): Promise<Cart> {
  const response = await api.patch<Cart>("/cart/select-all", { selected })
  return response.data
}

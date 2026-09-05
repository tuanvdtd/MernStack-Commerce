import { ApiError } from '~/core/http/ApiError'
import { EMPTY_CART_DTO, toCartDTO } from '~/modules/cart/cart.mapper'
import { CartRepo } from '~/modules/cart/cart.repo'
import type { AddCartItemInput, UpdateCartItemInput } from '~/modules/cart/cart.types'

export const CartService = {
  async getMyCart(userId: string) {
    const cart = await CartRepo.findActiveByUser(userId)
    if (!cart) return EMPTY_CART_DTO
    return toCartDTO(cart)
  },

  async addItem(userId: string, input: AddCartItemInput) {
    if (input.quantity < 1) {
      throw ApiError.BadRequest('Quantity must be at least 1', undefined, 'VALIDATION_ERROR')
    }
    const cart = await CartRepo.addItem(userId, input.variantId, input.quantity)
    return toCartDTO(cart)
  },

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    if (input.quantity !== undefined && input.quantity < 1) {
      throw ApiError.BadRequest('Quantity must be at least 1', undefined, 'VALIDATION_ERROR')
    }
    const cart = await CartRepo.updateItem(userId, itemId, input)
    return toCartDTO(cart)
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await CartRepo.removeItem(userId, itemId)
    return toCartDTO(cart)
  },

  async selectAll(userId: string, selected: boolean) {
    const cart = await CartRepo.selectAll(userId, selected)
    return toCartDTO(cart)
  },
}

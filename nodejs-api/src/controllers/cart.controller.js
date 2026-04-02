import { SuccessResponse } from "~/core/success.response"
import CartService from "~/services/cart.service"

class CartController {

  static addToCart = async (req, res, next) => {
    const result = await CartService.addToCart({ ...req.body })
    new SuccessResponse({
      message: 'Product added to cart successfully',
      metadata: result
    }).send(res)
  }
  static removeFromCart = async (req, res, next) => {
    const result = await CartService.removeFromCart({ ...req.body })
    new SuccessResponse({
      message: 'Product removed from cart successfully',
      metadata: result
    }).send(res)
  }

  // Lấy giỏ hàng của người dùng, tạm thời test postman nên gửi userId vào quẻyry
  static getCart = async (req, res, next) => {
    const result = await CartService.getCart({ ...req.query })
    new SuccessResponse({
      message: 'Get cart successfully',
      metadata: result
    }).send(res)
  }

  static updateCart = async (req, res, next) => {
    const result = await CartService.addToCartV2({ ...req.body })
    new SuccessResponse({
      message: 'Cart updated successfully',
      metadata: result
    }).send(res)
  }

}
export default CartController

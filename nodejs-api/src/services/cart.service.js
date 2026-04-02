import { cartModel } from "~/models/cart.model"
import { BadRequestError, NotFoundError } from "~/core/error.response"
import { getProductById } from "~/models/repositories/product.repo"

class CartService {
  // Tạo giỏ hàng mới cho người dùng
  static async createCart({ userId, product }) {
    const query = { cart_userId: userId , cart_state: 'active'}
    const updateSet = {
      $addToSet: { cart_products: product },
      $inc: { cart_count_product: 1 }
    }
    // upsert: nếu không tìm thấy thì tạo mới, new: trả về document mới tạo hoặc mới cập nhật
    const options = { upsert: true, new: true }
    return await cartModel.findOneAndUpdate(query, updateSet, options)
  }

  static async updateProductQuantityInCart({ userId, product }) {
    const {productId, quantity} = product
    const query = { cart_userId: userId , cart_state: 'active', 'cart_products.productId': productId }
    const updateSet = {
      $inc: { 'cart_products.$.quantity': quantity }
    }
    const options = { new: true }
    return await cartModel.findOneAndUpdate(query, updateSet, options)
  }

  static async addToCart({ userId, product = {} }) {
    const userCart = await cartModel.findOne({ cart_userId: userId })
    // Nếu chưa có giỏ hàng thì tạo mới
    if (!userCart) {
      return await this.createCart({ userId, product })
    }
    
    const { productId } = product
    
    // Nếu giỏ hàng rỗng thì thêm sản phẩm đầu tiên
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product]
      userCart.cart_count_product = 1
      return await userCart.save()
    }
    // Nếu có sản phầm rồi nhưng chưa có sản phẩm này thì thêm mới
    const isProductInCart = userCart.cart_products.some(item => item.productId.toString() === productId.toString())
    if (!isProductInCart) {
      userCart.cart_products.push(product)
      userCart.cart_count_product += 1
      return await userCart.save()
    }
    
    // Sản phẩm đã có → cập nhật số lượng
    return await this.updateProductQuantityInCart({ userId, product })
  }

  // xóa sản phẩm khỏi giỏ hàng
  static async removeFromCart({ userId, productId }) {
    if (!userId || !productId) {
      throw new BadRequestError('User ID and Product ID are required')
    }
    
    const query = { 
      cart_userId: userId, 
      cart_state: 'active' 
    }
    const updateSet = {
      $pull: { cart_products: { productId: productId } },
      $inc: { cart_count_product: -1 }
    }
    
    const updatedCart = await cartModel.findOneAndUpdate(query, updateSet, { new: true })
    
    if (!updatedCart) {
      throw new NotFoundError('Cart not found')
    }
    
    return updatedCart
  }

  // Lấy giỏ hàng của user
  static async getCart({ userId }) {
    if (!userId) {
      throw new NotFoundError('User not found')
    }
    
    const cart = await cartModel.findOne({ 
      cart_userId: userId,
      cart_state: 'active' 
    }).lean()
    
    return cart || { cart_products: [], cart_count_product: 0 }
  }
  // update cart
  /*
  shop_order_ids: 
  [{
    shopId: xxx,
    item_products: [
      { 
        productId,
        quantity,
        oldQuantity,
        price
      }
    ],
    version: xxx
  }]
  */
  static async addToCartV2({ userId, shop_order_ids = [] }) {
    const { productId, quantity, oldQuantity } = shop_order_ids[0]?.item_products[0]
    const foundProduct = await getProductById({ productId , unselect: ['__v']})
    if (!foundProduct) {
      throw new NotFoundError('Product not found')
    }
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId.toString()) {
      throw new BadRequestError('Product does not belong to the specified shop')
    }
    if (quantity === 0) {
      return await this.removeFromCart({ userId, productId })
    }
    // thực tế bên fe sẽ gọi hàm này mỗi lần user +- số lượng sản phẩm, nên không cần lo phần quantity bị trừ thành âm
    return await this.updateProductQuantityInCart({ userId, product:{
      productId,
      quantity: quantity - oldQuantity
    } })

  }
}

export default CartService
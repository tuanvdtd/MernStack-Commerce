import { cartModel } from "~/models/cart.model"
import { BadRequestError, NotFoundError } from "~/core/error.response"
import { checkProductByServer } from "~/models/repositories/product.repo"
import DiscountService from "./discount.service"
import { acquireLock, releaseLock } from "./redis.service"
import { orderModel } from "~/models/order.model"

export class CheckoutService {

  /*
  OrderIds : [
  {
    shopId,
    discounts: [ { code } ],
    orderItems: [ { productId, quantity } ]
  }
  ]
  */
  static async checkoutReview({ cartId, userId, OrderIds = [] }) {
    // check cart existence
    const userCart = await cartModel.findOne({ _id: cartId, cart_state: 'active' })
    if (!userCart) throw new NotFoundError('Cart not found')

    const checkoutOrder = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      finalPrice: 0,
    }, newOrderIds = [] // trả về danh sách orders đã tính toán lại
    
    for (const order of OrderIds) {
      const { shopId, discounts = [], orderItems = [] } = order
      // Tính toán price cho từng shop order, chứ không tin thông tin của fe
      const checkProducts = await checkProductByServer(orderItems)
      console.log({ checkProducts })
      
      // Tính tổng tiền hàng
      const checkoutPrice = checkProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
      checkoutOrder.totalPrice += checkoutPrice

      const newShopOrder = {
        shopId,
        discounts,
        priceBeforeDiscount: checkoutPrice,
        appliedDiscount: 0,
        priceAfterDiscount: checkoutPrice,
        orderItems: checkProducts,
      }
      // Tạm thời chỉ áp dụng 1 mã giảm giá cho mỗi đơn hàng, và discount này áp dụng cho tất cả các sản phẩm trong đơn hàng của shop đó
      if (discounts.length > 0) {
        // Tính toán lại giá sau khi áp dụng discount
        const { discount, totalPrice } = await DiscountService.getDiscountAmount({
          code: discounts[0].code,
          userId,
          products: checkProducts,
          shopId
        })

        newShopOrder.priceAfterDiscount = totalPrice
        newShopOrder.appliedDiscount = discount
        checkoutOrder.totalDiscount += discount
      }
      // Tính tổng tiền cuối cùng
      checkoutOrder.finalPrice += newShopOrder.priceAfterDiscount
      newOrderIds.push(newShopOrder)
    }
    return {
      OrderIds,
      checkoutOrder,
      newOrderIds,
    }
  }

  static async orderByUser({
    OrderIds,
    userId,
    cartId,
    userAddress= {},
    userPament = {}
  }) {
    // check lại cart
    const { checkoutOrder, newOrderIds } = await this.checkoutReview({ cartId, userId, OrderIds })
    
    // Chuyển thành array các products để kiểm tra và trừ kho
    const products = newOrderIds.flatMap(order => order.orderItems)
    console.log("products", products)
    
    const acquiredProduct = []
    
    // for of dùng cho array, for in dùng cho object, không dùng forEach vì có await bên trong
    for (const product of products) {
      const { productId, quantity } = product
      
      // Lấy khóa cho từng sản phẩm
      const keyLock = await acquireLock(productId, quantity, cartId)
      
      // if (keyLock) {
      //   acquiredLocks.push(keyLock)
      // } else {
      //   // Nếu không lấy được lock hoặc không đủ hàng thì release tất cả locks đã lấy
      //   for (const lock of acquiredLocks) {
      //     await releaseLock(lock)
      //   }
      //   throw new BadRequestError(`Product ${product.product_name || productId} is out of stock or being processed by another order`)
      // }
      acquiredProduct.push(keyLock ? true : false)
      if (keyLock) {
        await releaseLock(keyLock)
      }
    }
    // Nếu có 1 sản phẩm hết hàng
    if (acquiredProduct.includes(false)) {
      throw new BadRequestError(`One or more products are out of stock or being processed by another order`)
    }
    
    //Tạo order trong database
    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: checkoutOrder,
      order_products: newOrderIds,
      order_shipping: userAddress,
      order_payment: userPament
    })
    // tạo thành công thì removeProduct trong giỏ hàng
    if ( newOrder ) {
      //
    }
    return newOrder
  }
}


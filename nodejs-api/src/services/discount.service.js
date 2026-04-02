import { discountModel } from "~/models/discount.model"
import { NotFoundError, BadRequestError } from "~/core/error.response"
import { getAllProducts } from "~/models/repositories/product.repo"
import { findAllDiscountCodes, checkDiscountCodeExists } from "~/models/repositories/discount.repo"

class DiscountService {
  // Tạo mã giảm giá mới
  static async createDiscountCode(payload) {
    const {code, description,
    startDate, endDate,
    isActive, shopId,
    minOrderValue, productIds,
    applyFor, name,
    type, value,
    maxUses, usesCount,
    maxValue, usersUsed,
    maxUsesPerUser} = payload
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestError('Start date must be before end date')
    }
    if (new Date(endDate) < new Date()) {
      throw new BadRequestError('End date must be in the future')
    }
    const foundDiscount = await discountModel.findOne({ discount_code: code, discount_shopId: shopId}).lean()
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount code already exists')
    }
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(startDate),
      discount_end_date: new Date(endDate),
      discount_max_uses: maxUses,
      discount_uses_count: usesCount,
      discount_max_uses_per_user: maxUsesPerUser,
      discount_min_order_value: minOrderValue || 0,
      discount_shopId: shopId,
      discount_users_used: usersUsed,
      discount_max_value: maxValue,
      discount_is_active: isActive,
      discount_applies_to: applyFor,
      discount_product_ids: applyFor === 'specific' ? productIds : [],
    })
    return newDiscount
  }

  // Lấy tất cả sản phẩm áp dụng mã giảm giá
  static async getAllProductsForDiscount({
    limit = 50, page = 1, code, shopId
  }) {
    // console.log("query", {code, shopId})
    const discount = await discountModel.findOne({ discount_code: code, discount_shopId: shopId }).lean()
    if (!discount || !discount.discount_is_active) {
      throw new NotFoundError('Discount not found')
    }

    const { discount_applies_to, discount_product_ids} = discount
    // console.log("discount", discount)
    let products
    // Lấy tất cả sản phẩm của shop nếu áp dụng cho tất cả
    if (discount_applies_to === 'all') {
      products = await getAllProducts({
        filter: {
          product_shop: shopId,
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name', 'product_price', 'product_description']
      })
      // Lấy các sản phẩm cụ thể nếu áp dụng cho sản phẩm cụ thể
    } else if (discount_applies_to === 'specific') {
      products = await getAllProducts({
        filter: {
          product_shop: shopId,
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name', 'product_price', 'product_description']
      })
    }
    // console.log("products", products)
    return products
  }

  // Lấy tất cả mã giảm giá của shop
  static async getAllDiscountCodesForShop({
    limit = 50, page = 1, shopId
  }) {
    const discounts = await findAllDiscountCodes({
      filter: { discount_is_active: true, discount_shopId: shopId },
      limit: +limit,
      page: +page,
      sort: 'ctime',
      unSelect: ["__v", "discount_shopId"]
    })
    return discounts
  }

  static async getDiscountAmount({ code, userId, products, shopId }) {
    const discount = await checkDiscountCodeExists({
      discount_code: code,
      discount_shopId: shopId
    })
    if (!discount) {
      throw new NotFoundError('Discount not found')
    }
    const { discount_is_active, 
      discount_max_uses,
      discount_end_date,
      discount_start_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_max_value,
      discount_type,
      discount_value,
      discount_product_ids
    } = discount
    if (!discount_is_active) {
      throw new BadRequestError('Discount expried')
    }
    if (!discount_max_uses) {
      throw new BadRequestError('Discount code has reached its maximum usage limit')
    }
    if (new Date() > new Date(discount_end_date) || new Date() < new Date(discount_start_date)) {
      throw new BadRequestError('Discount code is not valid at this time')
    }
    
    // Kiểm tra discount áp dụng cho sản phẩm cụ thể
    if (discount.discount_applies_to === 'specific') {
      // Nếu là specific nhưng không có product IDs thì báo lỗi
      if (!discount_product_ids || discount_product_ids.length === 0) {
        throw new BadRequestError('Discount code configuration is invalid')
      }
      // Kiểm tra xem có sản phẩm nào trong đơn hàng được áp dụng discount không
      const isProductEligible = products.some(product => 
        discount_product_ids.some(id => id.toString() === product.productId.toString())
      )
      if (!isProductEligible) {
        throw new BadRequestError('No products in your cart are eligible for this discount code')
      }
    }
    // Nên valid giá trị đầu vào
    //........
    
    // check xem có set giá trị tối thiểu không
    let totalOrderValue = 0
    if (discount.discount_min_order_value > 0) {
      totalOrderValue = products.reduce((total, product) => total + product.price * product.quantity, 0)
      if (totalOrderValue < discount_min_order_value) {
        throw new BadRequestError(`Order total must be at least ${discount_min_order_value} to use this discount`)
      }
    }
    // check xem có giới hạn số lần sử dụng cho mỗi user không
    if (discount_max_uses_per_user > 0) {
      const user = discount_users_used.find(u => u === userId)
      if (user) {
        // 
      }
    }
    const discountAmount = discount_type === 'fixed_amount' ? discount_value : Math.min(discount_max_value, totalOrderValue * (discount_value / 100))

    return {
      totalOrderValue,
      discount: discountAmount,
      totalPrice: totalOrderValue - discountAmount
    }
  }
  static async deleteDiscountCode({ shopId, code }) {
    const deleted = await discountModel.findOneAndDelete(
      { discount_code: code, discount_shopId: shopId })
    return deleted
  }

  static async cancelDiscountCode({ shopId, code, userId }) {
    // const discount = await checkDiscountCodeExists({
    //   discount_code: code,
    //   discount_shopId: shopId,
    // })
    // if (!discount) {
    //   throw new NotFoundError('Discount not found')
    // }
    const updated = await discountModel.findOneAndUpdate(
      { discount_code: code, discount_shopId: shopId },
      {
        $inc: {
          discount_uses_count: -1,
          discount_max_uses: 1
        },
        $pull: { discount_users_used: userId }
      },
      { new: true }
    )
    return updated
  }
}

export default DiscountService
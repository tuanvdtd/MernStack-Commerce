import { SuccessResponse } from "~/core/success.response"
import DiscountService from "~/services/discount.service"

class DiscountController {
  static  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Discount code created successfully',
      metadata: await DiscountService.createDiscountCode({ ...req.body, shopId: req.user.userId })
    }).send(res)
  }
  static  getAllProductsForDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Products for discount retrieved successfully',
      metadata: await DiscountService.getAllProductsForDiscount({ 
        ...req.query
      })
    }).send(res)
  }

  static getAllDiscountCodesForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Discount codes retrieved successfully',
      metadata: await DiscountService.getAllDiscountCodesForShop({
        ...req.query,
      })
    }).send(res)
  }

  static getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Discount amount calculated successfully',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
        userId: req.user?.userId,
      })
    }).send(res)
  }

  // static deleteDiscountCode = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: 'Discount code deleted successfully',
  //     metadata: await DiscountService.deleteDiscountCode({
  //       ...req.params,
  //       shopId: req.user.userId
  //     })
  //   }).send(res)
  // }

  // static cancelDiscountCode = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: 'Discount code cancelled successfully',
  //     metadata: await DiscountService.cancelDiscountCode({
  //       ...req.params,
  //       userId: req.user.userId,
  //       shopId: req.user.userId
  //     })
  //   }).send(res)
  // }

}

export default DiscountController
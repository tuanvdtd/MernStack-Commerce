import { CheckoutService } from "~/services/checkout.service"
import { SuccessResponse } from "~/core/success.response"

export class CheckoutController {
  static async checkoutReview(req, res) {
    const { cartId, userId, OrderIds } = req.body
    console.log({ cartId, userId, OrderIds })
    const checkoutData = await CheckoutService.checkoutReview({ cartId, userId, OrderIds })
    new SuccessResponse({
      message: "Checkout review successful",
      metadata: checkoutData
    }).send(res)
  }
}

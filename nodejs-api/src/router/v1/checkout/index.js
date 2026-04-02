import { CheckoutController } from "~/controllers/checkout.controller"
import asyncHandle from "~/core/errorHandle"

import express from "express"
const router = express.Router()

// Route để review đơn hàng trước khi thanh toán
router.post('/review', asyncHandle(CheckoutController.checkoutReview))

export const checkoutRouter = router
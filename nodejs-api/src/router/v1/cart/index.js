import CartController from "~/controllers/cart.controller"
import asyncHandle from "~/core/errorHandle"
import { authenticationV2 } from "~/auth/authUtils"

import express from "express"
const router = express.Router()
// Route cũng đơn giản để test pótman, chưa đúng hẳn :))
router.post('', asyncHandle(CartController.addToCart))
router.delete('', asyncHandle(CartController.removeFromCart))
router.get('', asyncHandle(CartController.getCart))
router.put('/update', asyncHandle(CartController.updateCart))

// Đấng ra cần authen mới được truy cập, nhưng test postman nên gửi hết dữ liệu vào body và query
//authen
// router.use(authenticationV2)

export const cartRouter = router
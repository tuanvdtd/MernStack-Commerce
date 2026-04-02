import DiscountController from "~/controllers/discount.controller";
import asyncHandle from "~/core/errorHandle"
import { authenticationV2 } from "~/auth/authUtils"

import express from "express"
const router = express.Router()

// Dành cho tất cả người dùng
// Lấy tất cả sản phẩm áp dụng mã giảm giá dành cho [user, shop owner]
router.get('/list_products_for_discount', asyncHandle(DiscountController.getAllProductsForDiscount))
// Lấy tất cả mã giảm giá của shop dành cho [user, shop owner]
router.get('/', asyncHandle(DiscountController.getAllDiscountCodesForShop))

// Phải authen thì mới tạo/xem mã giảm giá của shop
router.use(authenticationV2)
router.post('/', asyncHandle(DiscountController.createDiscountCode))
// Tính toán số tiền được giảm dựa trên mã giảm giá dành cho [user, shop owner]
router.post('/amount', asyncHandle(DiscountController.getDiscountAmount))

export const discountRouter = router
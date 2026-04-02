import { InventoryController } from "~/controllers/inventory.controller"
import asyncHandle from "~/core/errorHandle"
import { authenticationV2 } from "~/auth/authUtils"

import express from "express"
const router = express.Router()

router.use(authenticationV2)
// Route để review đơn hàng trước khi thanh toán
router.post('', asyncHandle(InventoryController.addStockToInventory))

export const inventoryRouter = router
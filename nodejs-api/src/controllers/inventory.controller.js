import { InventoryService } from "~/services/inventory.service"
import { SuccessResponse } from "~/core/success.response"

export class InventoryController {
  static addStockToInventory = async (req, res, next) => {
    const newStock = await InventoryService.addStockToInventory({ ...req.body })
    new SuccessResponse({
      message: "Stock added successfully",
      metadata: newStock
    }).send(res)
  }

}
import inventoryModel from "~/models/inventory.model"
import { getProductById } from "~/models/repositories/product.repo"
import { BadRequestError } from "~/core/error.response"

export class InventoryService {
  static async addStockToInventory({ productId, stock, location = 'Unknow', shopId }) {
    const product = await getProductById({ productId })
    if (!product) {
      throw new BadRequestError(`Product not found`)
    }
    const query = {
      inven_productId: productId,
      inven_shopId: shopId
    },
    update = {
      $inc: { inven_stock: stock },
      $set: { inven_location: location }
    },
     options = { new: true, upsert: true }
    return await inventoryModel.findOneAndUpdate(query, update, options)
  }

}

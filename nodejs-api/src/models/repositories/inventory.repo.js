import { create } from "lodash"
import inventoryModel from "../inventory.model"

export const createInventory = async ({ productId, stock, location = 'Unknow', shopId }) => {
  return await inventoryModel.create({ inven_productId: productId, inven_stock: stock, inven_location: location, inven_shopId: shopId })
}

export const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inven_productId: productId,
    inven_stock: { $gte: quantity }
  }

  const update = {
    $inc: { inven_stock: -quantity },
    $push: { inven_reservations: { cartId, quantity, createdOn: new Date() } }
  }
  const options = { new: true }

  const updatedInventory = await inventoryModel.findOneAndUpdate(query, update, options)
  if (!updatedInventory) {
    throw new Error(`Insufficient stock for product ID: ${productId}`)
  }
  return updatedInventory
}

import { Schema, model } from "mongoose"

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

const inventorySchema = new Schema({
  inven_productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  inven_stock: { type: Number, required: true },
  inven_location: { type: String, default: 'Unknow' },
  inven_reservations: { type: Array, default: []},
  inven_shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

const inventoryModel = model(DOCUMENT_NAME, inventorySchema)

export default inventoryModel
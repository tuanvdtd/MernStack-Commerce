import { model, Schema } from "mongoose"

const DOCUMENT_NAME = "Cart"
const COLLECTION_NAME = "Carts"

const CartSchema = new Schema({
  cart_state: {
    type: String,
    required: true,
    enum: ["active", "completed", "pending", "failed"],
    default: "active"
  },
  cart_products: {
    // type: [
    //   {
    //     productId: {
    //       type: Schema.Types.ObjectId,
    //       ref: "Product",
    //       required: true
    //     },
    //     quantity: {
    //       type: Number,
    //       required: true
    //     }
    //   }
    // ],
    type: Array,
    /*
    {
      productId,
      shopId,
      quantity,
      price,
      name
    }
    */
    required: true,
    default: []

  },
  cart_count_product: {
    type: Number,
    default: 0
  },
  cart_userId: {
    type: Number,
    required: true
  }
  
},{
  timestamps: true,
  collection: COLLECTION_NAME
})

const cartModel = model(DOCUMENT_NAME, CartSchema)
export { cartModel }
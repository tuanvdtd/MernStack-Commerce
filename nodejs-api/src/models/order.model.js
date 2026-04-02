import { model, Schema } from "mongoose"

const  DOCUMENT_NAME = "Order"
const COLLECTION_NAME = "Orders"

const OrderSchema = new Schema({
  order_userId: {
    // fix tạm number
    type: Number,
    required: true,
  },
  order_checkout: {
    type: Object,
    default: {}
  },
  /*
  order_checkout: {
  totalPrice: Number,
  discount: Number,
  finalPrice: Number,
  shippingFee: Number,
  }
  */
  order_shipping: {
    type: Object,
    default: {}
  },
  order_payment: {
    type: Object,
    default: {}
  },
  order_products: {
    type: Array,
    required: true,
  },
  order_trackingNumber: {
    type: String,
    default: '#000118052025' //18052025
  },
  order_status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered']
  }
  
}, { timestamps: true, collection: COLLECTION_NAME })

export const orderModel = model(DOCUMENT_NAME, OrderSchema, COLLECTION_NAME)
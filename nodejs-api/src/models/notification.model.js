import e from "express"
import { model, Schema } from "mongoose"

const DOCUMENT_NAME = "Notification"
const COLLECTION_NAME = "Notifications"

// ORDER-001: ORDER SUCESSFUL
// ORDER-002: ORDER FAILED
// PROMOTIOM-001: NEW PROMOTION
// SHOP-001: NEW PRODUCT CREATED
//....  

const notificationSchema = new Schema({
  noti_type: {
    type: String,
    enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'SHOP-001'],
    required: true
  },
  noti_senderId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  noti_receiverId: {
    type: Number,
    required: true
  },
  noti_content: {
    type: String,
    required: true
  },
  noti_isRead: {
    type: Boolean,
    default: false
  },
  noti_options: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

export const notificationModel = model(DOCUMENT_NAME, notificationSchema)
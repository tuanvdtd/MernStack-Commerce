import { model, Schema } from "mongoose"

const DOCUMENT_NAME = "Shop"
const COLLECTION_NAME = "Shops"

const shopSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 150
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  verify: {
    type: Boolean,
    default: false
  },
  roles: {
    type: [String],
    default: []
  },
  
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

const shopModel = model(DOCUMENT_NAME, shopSchema)

export default shopModel
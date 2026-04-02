import { model, Schema} from "mongoose"

const DISCOUNT_MODEL_NAME = "Discount"
const DiscountSchema = new Schema({
  discount_name:{
    type: String,
    required: true,
  },
  discount_description:{
    type: String,
    required: true,
  },
  discount_type:{
    type: String,
    default: "fixed_amount",
  },
  discount_value:{
    type: Number,
    required: true,
  },
  discount_max_value:{
    type: Number,
    required: true,
  },
  discount_code:{
    type: String,
    required: true,
  },
  discount_start_date:{
    type: Date,
    required: true,
  },
  discount_end_date:{
    type: Date,
    required: true,
  },
  discount_max_uses:{
    type: Number,
    required: true,
  },
  discount_uses_count:{
    type: Number,
    required: true,
  },
  discount_users_used:{
    type: [String],
    default: [],
  },
  discount_max_uses_per_user:{
    type: Number,
    required: true,
  },
  discount_min_order_value:{
    type: Number,
    required: true,
  },
  discount_shopId: {
    type: Schema.Types.ObjectId,
    ref: "Shop"
  },
  discount_is_active:{
    type: Boolean,
    default: true,
  },
  discount_applies_to: {
    type: String,
    enum: ["all", "specific"],
    required: true,
  },
  discount_product_ids: {
    type: [Schema.Types.ObjectId],
    ref: "Product",
    default: []
  }

}, { timestamps: true })

export const discountModel = model(DISCOUNT_MODEL_NAME, DiscountSchema)
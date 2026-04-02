import { model, Schema, Types } from "mongoose"
import slugify from "slugify"

/*
  {
    "product_name": "Áo thun hàn quốc",
    "product_description": "ÁO thun kiểu dáng sang chảnh",
    "product_price": 55000,
    "product_category": [100001, 100003, 100004],
    "product_thumb":"thumb",
    "product_quantity": 200,
    "product_attributes": [
        {
            "attribute_id": 200005, // style: trẻ trung (1), mùa hè (2)
            "attribute_values": [
                {
                    "value_id": 1
                },
                {
                    "value_id": 2
                }
            ]
        }
    ],
    "product_variations": [
        {
            "images": [],
            "name": "color",
            "options": ["red", "green"]
        },
        {
            "images": [],
            "name": "size",
            "options": ["M", "L"]
        }
    ],
}
*/


const SKU_MODEL_NAME = "Sku"

const SkuSchema = new Schema({
  sku_id: { // {spuId}-{123}-{shopId}
    type: String,
    required: true,
    unique: true
  },
  sku_tier_idx: {
    type: Array,
    default: [0] // [0,1], [1,1]
    /*
      color: [red, blue, ...] => 0,1
      size: [M,L,...] => 0,1
      => red-M: [0,0], blue-L: [1,1]
    */
  },
  sku_default: {
    type: Boolean, // true thì nó sẽ là đại diện cho SPU
    default: false
  },
  sku_price: {
    type: Number,
    required: true
  },
  sku_stock: {
    type: Number,
    default: 0
  },

  product_id: {
    type: String,
    required: true // reference to SPU
  },
  sku_slug: {
    type: String,
    default: ''
  },
  sku_sort: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isDraft: {
    type: Boolean,
    default: true,
    index: true,
    select: false
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
    select: false
  },
},{
  timestamps: true,
  collection: "Skus"
})



const SkuModel = model(SKU_MODEL_NAME, SkuSchema)
export { SkuModel }
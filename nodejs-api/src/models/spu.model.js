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
    "sku_list": [
        {
            "sku_tier_idx": [0,0], // red-M
            "sku_price": 1000,
            "sku_stock": 20
        },
         {
            "sku_tier_idx": [0,1], // red-L
            "sku_price": 2000,
            "sku_stock": 26
        },
         {
            "sku_tier_idx": [1,1], // green-L
            "sku_price": 1000,
            "sku_stock": 27
        },
         {
            "sku_tier_idx": [1,0], // green-M
            "sku_price": 1000,
            "sku_stock": 25
        }
    ]
}
*/


const SPU_MODEL_NAME = "Spu"

const SpuSchema = new Schema({
  product_id: {
    type: String,
    default: ''
  },
  product_name: {
    type: String,
    required: true
  },
  product_thumb: {
    type: String,
    required: true
  },
  product_description: {
    type: String,
  },
  product_slug: {
    type: String, // quan-jean-cao-cap
  },
  product_category: {
    type: Array,
    default: [] // [idCategoryLevel1, idCategoryLevel2, ...]
  },
  product_price: {
    type: Number,
    required: true
  },
  product_quantity: {
    type: Number,
    required: true
  },
  product_shop: {
    type: Types.ObjectId,
    required: true,
    ref: "Shop"
  },
  product_attributes: {
    type: Schema.Types.Mixed,
    required: true
    /*
    attribute_id 12345, // style ao [han quoc, the thao, cong so,...]
    attribute_values: [
      {
        value_id: 123
      }
    ]
    */
  },
  product_sort: {
    type: Number,
    default: 0
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
  product_ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: (val) => Math.round(val * 10) / 10
  },
  product_variations: {
    type: Array,
    default: []
    /*
      tier_variation: [
        {
          images: [url1, url2,...],
          name: 'color',
          options: ['red', 'blue',...]
        },
        {
          name: 'size',
          options: ['S', 'M', 'L',...],
          images: [] // optional
        }
      ]
    */
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }

}, { 
  collection: "Spus",
  timestamps: true 
})

// tạo index để tìm kiếm text
SpuSchema.index({ product_name: 'text', product_description: 'text' })

// Trước khi lưu, tạo slug từ product_name
SpuSchema.pre("save", function(next) {
  this.product_slug = slugify(this.product_name, {
    lower: true,
    strict: true
  })
  next()
})

// Trước khi update, tạo slug từ product_name nếu product_name được update
SpuSchema.pre("findOneAndUpdate", function(next) {
  //Lấy object dữ liệu mà người dùng gửi vào để update
  const update = this.getUpdate()
  if (update.product_name || update.$set?.product_name) {
    const productName = update.product_name || update.$set.product_name
    if (!update.$set) {
      update.$set = {}
    }
    update.$set.product_slug = slugify(productName, {
      lower: true,
      strict: true
    })
  }
  next()
})



const SpuModel = model(SPU_MODEL_NAME, SpuSchema)

export { SpuModel }
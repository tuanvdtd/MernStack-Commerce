import { model, Schema, Types } from "mongoose"
import slugify from "slugify"


const PRODUCT_MODEL_NAME = "Product"

const ProductSchema = new Schema({
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
  product_price: {
    type: Number,
    required: true
  },
  product_quantity: {
    type: Number,
    required: true
  },
  product_type: {
    type: String,
    required: true,
    enum: ["Electronic", "Clothing", "Book", "Home", "Beauty", "Sport"]
  },
  product_shop: {
    type: Types.ObjectId,
    required: true,
    ref: "Shop"
  },
  product_attributes: {
    type: Schema.Types.Mixed,
    required: true
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
  slug:{
    type: String,
    unique: true,
  },
  product_ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: (val) => Math.round(val * 10) / 10
  },

}, { 
  collection: "Products",
  timestamps: true 
})

// tạo index để tìm kiếm text
ProductSchema.index({ product_name: 'text', product_description: 'text' })

// Trước khi lưu, tạo slug từ product_name
ProductSchema.pre("save", function(next) {
  this.slug = slugify(this.product_name, {
    lower: true,
    strict: true
  })
  next()
})

// Trước khi update, tạo slug từ product_name nếu product_name được update
ProductSchema.pre("findOneAndUpdate", function(next) {
  //Lấy object dữ liệu mà người dùng gửi vào để update
  const update = this.getUpdate()
  if (update.product_name || update.$set?.product_name) {
    const productName = update.product_name || update.$set.product_name
    if (!update.$set) {
      update.$set = {}
    }
    update.$set.slug = slugify(productName, {
      lower: true,
      strict: true
    })
  }
  next()
})

const clothingSchema = new Schema({
  brand: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  material: {
    type: String,
    required: true
  },
  product_shop: {
    type: Types.ObjectId,
    required: true,
    ref: "Shop"
  }
}, {
  collection: 'Clothes',
  timestamps: true
})

const electronicShchema = new Schema({
  manufacturer: {
    type: String,
    required: true
  },
  model: {
    type: String,
  },
  color: {
    type: String,
  },
  product_shop: {
    type: Types.ObjectId,
    required: true,
    ref: "Shop"
  }
}, {
  collection: 'Electronics',
  timestamps: true
})

const ClothingModel = model('Clothing', clothingSchema)
const ElectronicModel = model('Electronic', electronicShchema)
const ProductModel = model(PRODUCT_MODEL_NAME, ProductSchema)

export { ProductModel, ClothingModel, ElectronicModel }
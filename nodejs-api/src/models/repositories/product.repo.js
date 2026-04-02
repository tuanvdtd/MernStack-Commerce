import { ProductModel } from "../product.model"
import { getSelectData, getUnSelectData } from "~/utils/getSelectData"

export const getProductById = async ({ productId, unselect = ['__v'] }) => {
  return await ProductModel.findOne({ _id: productId, isPublished: true}).select(getUnSelectData(unselect)).lean()
}

export const getAllProducts = async ({ filter, limit, page, sort, select }) => {
  return await ProductModel.find(filter)
    .select(getSelectData(select))
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sort === 'ctime' ? { createdAt: -1 } : { createdAt: 1 })
    .lean()
    .exec()
}

export const getAllDraftsForShop = async ({ query, limit, skip }) => {
  return await ProductModel.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

export const getAllPublishedForShop = async ({ query, limit, skip }) => {
  return await ProductModel.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean()
    .exec()
}

/**
 * Phải tạo index text cho các trường cần tìm kiếm trong ProductModel trước khi sử dụng hàm này
 * Đây là cách sử dụng tính năng Full-Text Search của MongoDB
 * Ví dụ: name: tuan pro 123 thì có thể search với keySearch = 'tuan' hoặc 'pro' hoặc '123', tương tự với product_description
 * @returns 
 */
export const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch, 'i')
  return await ProductModel.find({
    isPublished: true,
    $text: { $search: regexSearch }
  }, {
    score: { $meta: 'textScore' }
  })
    .lean()
    .exec()
}

export const publishProductByShop = async ({ productId, product_shop }) => {
  return await ProductModel.findByIdAndUpdate(
    {_id: productId,
      product_shop: product_shop
    },
    { isDraft: false, isPublished: true },
    { new: true }
  )
}

export const unPublishProductByShop = async  ({ productId, product_shop }) => {
  return await ProductModel.findByIdAndUpdate(
    {_id: productId,
      product_shop: product_shop
    },
    { isDraft: true, isPublished: false },
    { new: true }
  )
}

export const updateProduct = async ({ productId, payload, typeModel }) => {
  return await typeModel.findByIdAndUpdate(
    { _id: productId },
    payload,
    { new: true }
  )
}

export const checkProductByServer = async (products) => {
  const results = await Promise.all(products.map(async product => {
    const foundProduct = await getProductById({ productId: product.productId, unselect: ['product_variations', '__v'] })
    if (foundProduct) {
      return {
        price: foundProduct.product_price,
        productId: foundProduct._id,
        quantity: product.quantity,
        product_shopId: foundProduct.product_shop,
        product_name: foundProduct.product_name
      }
    }
    return null
  }))
  
  // Filter out null values
  return results.filter(item => item !== null)
}
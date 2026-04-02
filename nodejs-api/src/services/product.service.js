import { ProductModel, ClothingModel, ElectronicModel} from "~/models/product.model"

import { BadRequestError, ForbiddenError } from "~/core/error.response"
import { getAllDraftsForShop, getAllProducts,
  getAllPublishedForShop, publishProductByShop,
  unPublishProductByShop, searchProductByUser,
  getProductById, updateProduct 
} from "~/models/repositories/product.repo"

import { notificationService } from "./notification.service"

import { removeUndefinedFields, formatDataForUpdate } from "~/utils"
import { createInventory } from "~/models/repositories/inventory.repo"
// Design Pattern Factory
class ProductFactory {
  static productRegistry = {}

  static registerProductType(type, classRef) {
    this.productRegistry[type] = classRef
  }

  static createProduct = async (type, payload) => {
    // switch (type) {
    //   case 'Clothing':
    //     return new ClothingService(payload).createProduct()
    //   case 'Electronic':
    //     return new ElectronicService(payload).createProduct()
    //   default:
    //     throw new BadRequestError(`Invalid product type: ${type}`)
    // }
    const ProductClass = this.productRegistry[type]
    if (!ProductClass) {
      throw new BadRequestError(`Invalid product type: ${type}`)
    }
    return new ProductClass(payload).createProduct()
  }

  static updateProduct = async ( {type, productId, payload } ) => {
    const ProductClass = this.productRegistry[type]
    if (!ProductClass) {
      throw new BadRequestError(`Invalid product type: ${type}`)
    }
    return await new ProductClass(payload).updateProduct(productId)
  }

  async publishProduct({ productId, product_shop }) {
    return await publishProductByShop({ productId, product_shop })
  }

  async unPublishProduct({ productId, product_shop }) {
    return await unPublishProductByShop({ productId, product_shop })
  }

  static async getAllDraftsForShop({ product_shop, limit = 50, skip = 0}) {
    const query = {
      product_shop: product_shop,
      isDraft: true,
    }
    return await getAllDraftsForShop({ query, limit, skip })
  }

  static async getAllPublishedForShop({ product_shop, limit, skip }) {
    const query = {
      product_shop: product_shop,
      isPublished: true,
    }
    return await getAllPublishedForShop({ query, limit, skip })
  }

  static async searchProductByUser({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }
   
  static async getAllProducts({ filter = {isPublished: true} , limit = 50, page = 1, sort = 'ctime' }) {
    const select = ['product_name', 'product_thumb', 'product_price', 'product_ratingAverage'] 
    return await getAllProducts({ filter, limit, page, sort, select })
  }
  static async getProductById({ productId }) {
    const unselect = ['__v']
    return await getProductById({ productId, unselect })
  }

}


class ProductService {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  async createProduct(productId) {
    const newProduct = await ProductModel.create({...this, _id: productId })
    if (newProduct) {
      // Create inventory record
      await createInventory({
        productId: productId,
        stock: this.product_quantity,
        shopId: this.product_shop
      })
      // tạo notification cho các user đã follow shop khi có sản phẩm mới
      notificationService.createNotification({
        shopId: this.product_shop,
        senderId: this.product_shop,
        receiverId: 1, // test tạm là 1
        type: 'SHOP-001',
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop // để tạm shopId, sửa lại lấy tên shop sau :))
        }
       
      }).then((rs) => {
        console.log('Notification created successfully:', rs)
      }).catch((error) => {
        console.error('Error creating notification:', error)
      })
    }
    return newProduct
  }

  async updateProduct(productId, payload) {
    return await updateProduct({ productId, payload, typeModel: ProductModel })
  }

}

// type: clothing, electronic, book, ...

class ClothingService extends ProductService {

  async createProduct() {
    const newClothing = await ClothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newClothing) throw new BadRequestError('Create clothing error')
    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) {
      // rollback
      await ClothingModel.findByIdAndDelete(newClothing._id)
      throw new BadRequestError('Create product error')
    }
    return newProduct
  }

  async updateProduct(productId) {
    const updateData = removeUndefinedFields(this)
    if(updateData.product_attributes) {
      await updateProduct({ productId,
        payload: formatDataForUpdate(updateData.product_attributes), typeModel: ClothingModel })
    }
    const updatedProduct = await super.updateProduct(productId, formatDataForUpdate(updateData))
    if(!updatedProduct) {
      // rollback
      await ClothingModel.findByIdAndDelete(productId)
      throw new BadRequestError('Update product error')
    }
    return updatedProduct
  }
}


class ElectronicService extends ProductService {

  async createProduct() {
    const newElectronic = await ElectronicModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newElectronic) throw new BadRequestError('Create electronic error')
    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) {
      // rollback
      await ElectronicModel.findByIdAndDelete(newElectronic._id)
      throw new BadRequestError('Create product error')
    }
    return newProduct
  }

  async updateProduct(productId) {
    const updateData = this
    if(updateData.product_attributes) {
      await updateProduct({
        productId,
        payload: formatDataForUpdate(updateData.product_attributes),
        typeModel: ElectronicModel })
    }
    // console.log("format", formatDataForUpdate(updateData))
    const updatedProduct = await super.updateProduct(productId, formatDataForUpdate(updateData))
    if(!updatedProduct) {
      // rollback
      await ElectronicModel.findByIdAndDelete(productId)
      throw new BadRequestError('Update product error')
    }
    return updatedProduct
  }
}

// Register product types
ProductFactory.registerProductType('Clothing', ClothingService)
ProductFactory.registerProductType('Electronic', ElectronicService)

export default ProductFactory
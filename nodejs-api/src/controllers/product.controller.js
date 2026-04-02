import { StatusCodes } from 'http-status-codes'
import ProductFactory from '~/services/product.service';
import { OK, Created, SuccessResponse } from '~/core/success.response.js';
import { SpuService } from '~/services/spu.service.js';
import { SkuService } from '~/services/sku.service.js';


class ProductController {


  //----------- SPU, SKU --------------

  static createSpu = async (req, res, next) => {
    const shopId = req.user.userId
    try {
      new SuccessResponse({
        message: 'Spu created successfully',
        metadata: await SpuService.newSpu({
          ...req.body,
          product_shop: shopId
        })
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  static getOneSku = async (req, res, next) => {
    try {
      const {sku_id, product_id} = req.query
      new SuccessResponse({
        message: 'Find one sku successfully',
        metadata: await SkuService.findOneSku({ sku_id, product_id })
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  static getOneSpu  = async (req, res, next) => {
    try {
      const { spu_id } = req.query
      new SuccessResponse({
        message: 'Find one spu successfully',
        metadata: await SpuService.findSpuById({ spu_id })
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
  //-----------------------------------
  // --------- Cấu trúc cơ bản product controller với factory pattern, nếu dùng spu sku thì k hcaanf dùng model product nữa ---------
  static createProduct = async (req, res, next) => {
    const { userId } = req.user
    const result = await ProductFactory.createProduct(req.body.product_type, {
      ...req.body,
      product_shop: userId
    });
    new SuccessResponse({
      message: 'Product created successfully',
      metadata: result
    }).send(res)
  }

  static publishProductByShop = async (req, res, next) => {
    const result = await ProductFactory.prototype.publishProduct({
      productId: req.params.id,
      product_shop: req.user.userId
    })
    new SuccessResponse({
      message: 'Product published successfully',
      metadata: result
    }).send(res)
  }

  static unPublishProductByShop = async (req, res, next) => {
    const result = await ProductFactory.prototype.unPublishProduct({
      productId: req.params.id,
      product_shop: req.user.userId
    })
    new SuccessResponse({
      message: 'Product unpublished successfully',
      metadata: result
    }).send(res)
  }
  static getAllDraftsForShop = async (req, res, next) => {
    const userId = req.user.userId
    const result = await ProductFactory.getAllDraftsForShop({ product_shop: userId })
    new SuccessResponse({
      message: 'Get all drafts for shop successfully',
      metadata: result
    }).send(res)
  }

  static getAllPublishedForShop = async (req, res, next) => {
    const userId = req.user.userId
    const result = await ProductFactory.getAllPublishedForShop({ product_shop: userId })
    new SuccessResponse({
      message: 'Get all published products for shop successfully',
      metadata: result
    }).send(res)
  }
  static searchProductByUser = async (req, res, next) => {
    const { keySearch } = req.params
    const result = await ProductFactory.searchProductByUser({ keySearch })
    new SuccessResponse({
      message: 'Search products successfully',
      metadata: result
    }).send(res)
  }
  static getAllProducts = async (req, res, next) => {
    const result = await ProductFactory.getAllProducts({})
    new SuccessResponse({
      message: 'Get all products successfully',
      metadata: result
    }).send(res)
  }
  static getProductById = async (req, res, next) => {
    const result = await ProductFactory.getProductById({ productId: req.params.id })
    new SuccessResponse({
      message: 'Get product by id successfully',
      metadata: result
    }).send(res)
  }

  static updateProduct = async (req, res, next) => {
    const productId = req.params.id
    const result = await ProductFactory.updateProduct({
      type: req.body.product_type,
      productId,
      payload: { ...req.body }
    })
    new SuccessResponse({
      message: 'Update product successfully',
      metadata: result
    }).send(res)
  }

}

export default ProductController
import { NotFoundError } from "~/core/error.response"
import { SpuModel } from "~/models/spu.model"
import { ShopRepo } from "~/models/repositories/shop.repo"
import { randomProductId } from "~/utils"
import { SkuService } from "./sku.service"
import _ from "lodash"

const newSpu = async ({
  product_id,
  product_name,
  product_thumb,
  product_price,
  product_category,
  product_shop,
  product_attributes,
  product_quantity,
  product_variations,
  sku_list=[]
}) => {
  try {
    // 1 check shop tồn tại
    const foundShop = await ShopRepo.findShopById({ shopId: product_shop });
    if (!foundShop) {
      throw new NotFoundError("Shop not found");
    }
    // 2 tao spu
    const spu = await SpuModel.create({
      product_id: `${randomProductId()}`,
      product_name,
      product_thumb,
      product_price,
      product_category,
      product_shop,
      product_attributes,
      product_quantity,
      product_variations,
    })

    // 3 tao sku
    if (sku_list.length > 0 && spu) {
      // tao skus
      const skus = await SkuService.newSkus({
        spu_id: spu.product_id,
        sku_list
      })
    }
    // 4 dong bo data voi elasticsearch
    return !!spu;
  } catch (error) {
    throw error;
  }
}

const findSpuById = async ({ spu_id }) => {
  try {
    // thật ra cần check cả isPublished với isDeleted nữa
    const spu = await SpuModel.findOne({ product_id: spu_id }).lean();

    if (!spu) throw new NotFoundError('Spu not found');
    const skus = await SkuService.findAllSkuBySpuId({ product_id: spu.product_id });

    return {
      spu_info: _.omit(spu, ['__v', 'createdAt', 'updatedAt', 'isDeleted']),
      sku_list: skus.map(sku => _.omit(sku, ['__v', 'createdAt', 'updatedAt', 'isDeleted'])) || [],
    }
  } catch (error) {
    return null
  }
}



export const SpuService = {
  newSpu,
  findSpuById
}
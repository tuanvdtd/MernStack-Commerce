import { SkuModel } from "~/models/sku.model";
import { randomProductId } from "~/utils";
import _ from "lodash";

const newSkus = async ({
  spu_id, sku_list
}) => {
  try {
    const convert_skus = sku_list.map(sku => ({
      ...sku,
      sku_id: `${spu_id}.${randomProductId()}`,
      product_id: spu_id
    }))
    const skus = await SkuModel.create(convert_skus);
    return skus;
  } catch (error) {
    return []
  }
}

const findOneSku = async ({ sku_id, product_id }) => {
  try {
    // 1 read cache o redis

    // 2 if no data in redis -> read mongodb
    const sku = await SkuModel.findOne({ sku_id, product_id }).lean();

    //3 write to redis
    if (sku) {
      // await RedisDB.getRedis().instanceConnect.set(
      //   `sku:${sku_id}`,
      //   JSON.stringify(sku),
      //   {
      //     EX: 3600 // expire in 1 hour
      //   }
      // )
      // vi du vay
    }

    return _.omit(sku, ['__v', 'createdAt', 'updatedAt', 'isDeleted']);
  } catch (error) {
    return null
  }
}

const findAllSkuBySpuId = async ({ product_id }) => {
  try {
    const skus = await SkuModel.find({ product_id }).lean();
    return skus;
  } catch (error) {
    return null
  }
}

export const SkuService = {
  newSkus,
  findOneSku,
  findAllSkuBySpuId
}


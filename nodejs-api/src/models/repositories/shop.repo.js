import shopModel from "../shop.model";

const selectFields = { name: 1, status: 1, roles: 1, email: 1 }

const findShopById = async ({
  shopId,
  select = selectFields
}) => {
  return await shopModel.findById(shopId).select(select).lean();
}

export const ShopRepo = {
  findShopById
}
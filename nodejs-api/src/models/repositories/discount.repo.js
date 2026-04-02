import { discountModel } from "../discount.model"
import { getUnSelectData } from "~/utils/getSelectData"

const findAllDiscountCodes = async ({ filter, limit , page, sort , unSelect}) => {
  const skip = (page - 1) * limit
  const discounts = await discountModel.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort === 'ctime' ? { createdAt: -1 } : { createdAt: 1 })
    .select(getUnSelectData(unSelect))
    .lean()
    .exec()
  return discounts
}

const checkDiscountCodeExists = async (filter) => {
  return await discountModel.findOne(filter).lean()
}

export {
  findAllDiscountCodes,
  checkDiscountCodeExists
}
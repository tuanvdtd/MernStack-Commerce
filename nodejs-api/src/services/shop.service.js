import shopModel from '../models/shop.model.js';
class ShopService {
  static findByEmail = async (email) => {
    return await shopModel.findOne({ email }).lean()
  }
  static findById = async (id) => {
    return await shopModel.findById(id).lean()
  }

}

export default ShopService
import keyModel from "../models/keytoken.model.js";

class KeyTokenService {

  static createKeyToken = async ({ userId, accessTokenKey, refreshTokenKey, refreshToken }) => {
    try {
      // const keyToken = await keyModel.create({
      //   user: userId,
      //   accessTokenKey,
      //   refreshTokenKey
      // });
      // return keyToken;

      const filter = { user: userId };
      const update = { accessTokenKey, refreshTokenKey, refreshToken, refreshTokenUsed: [] };
      const options = { new: true, upsert: true };

      const tokens = await keyModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens : null;
    } catch (error) {
      throw error;
    }
  }

  static findByUserId = async (userId) => {
    return await keyModel.findOne({ user: userId }).lean();
  }

  static removeKeyById = async (id) => {
    return await keyModel.deleteOne({ _id: id });
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyModel.findOne({ refreshTokenUsed: refreshToken })
  }

  static findByRefreshToken = async (refreshToken) => {
    return await keyModel.findOne({ refreshToken })
  }
}

export default KeyTokenService;
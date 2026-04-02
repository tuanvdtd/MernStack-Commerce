import bcrypt from 'bcrypt'
import crypto from "crypto";
import shopModel from '../models/shop.model.js';
import KeyTokenService from './keyToken.service.js';
import { createTokenPair, verifyJWT }from '../auth/authUtils.js';
import getInfoData from '../utils/getInfoData.js';
import { ConflictRequestError, BadRequestError, AuthFailureError, NotFoundError, ForbiddenError } from '../core/error.response.js';
import { StatusCodes } from 'http-status-codes';
import ShopService from './shop.service.js';
import keyModel from '../models/keytoken.model.js';

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {

  static signIn = async ({email, password, refreshToken = null}) => {
      const shop = await shopModel.findOne({ email }).lean()
      if (!shop) {
        throw new BadRequestError('Shop not found');
      }
      const isMatch = await bcrypt.compare(password, shop.password)
      if (!isMatch) {
        throw new AuthFailureError('Invalid password');
      }

      // create access token
      const accessTokenKey = crypto.randomBytes(64).toString("hex")
      const refreshTokenKey = crypto.randomBytes(64).toString("hex")
      const tokens = await createTokenPair({
        payload: { userId: shop._id, email },
        accessTokenKey,
        refreshTokenKey
      })
      // save key token to db
      await KeyTokenService.createKeyToken({
        userId: shop._id,
        accessTokenKey,
        refreshTokenKey,
        refreshToken: tokens.refreshToken
      })

      return {
        shop: getInfoData({object: shop, keys: ['_id', 'name', 'email', 'role']}),
        tokens
      }
  }

  static signUp = async ({name, email, password}) => {
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        throw new BadRequestError('Shop already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name,
        email,
        password: hashedPassword,
        roles: [RoleShop.SHOP]
      })

      if (newShop) {
        const accessTokenKey = crypto.randomBytes(64).toString("hex")
        const refreshTokenKey = crypto.randomBytes(64).toString("hex")
        const keyTokens = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          accessTokenKey,
          refreshTokenKey
        })
        if (!keyTokens) {
          throw new ConflictRequestError('Key token error')
        }

        const { accessToken, refreshToken } = await createTokenPair({
          payload: { userId: newShop._id, email },
          accessTokenKey,
          refreshTokenKey
        })
        console.log('tokens', { accessToken, refreshToken })
        
        return {
          shop: getInfoData({object: newShop, keys: ['_id', 'name', 'email', 'role']}),
          token: { accessToken, refreshToken }
        }
      }
      return {
        code: 'SIGNUP_ERROR',
        message: 'Cannot create shop',
        status: 'error'
      }
  }
  static signOut = async ({ keyStore }) => {
    return await KeyTokenService.removeKeyById(keyStore._id)
  }

  static refreshToken = async ({ keyStore, refreshToken, user }) => {
    const { userId, email } = user

    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.removeKeyById(keyStore._id)
      throw new ForbiddenError('Something wrong happened. Please sign in again.')
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError('Shop not registered')
    }
    // check refresh token
    const foundShop = await ShopService.findByEmail(email)
    if (!foundShop) {
      throw new AuthFailureError('Shop not registered 2')
    }

    // create new access token và refreshToken
    const { accessToken, refreshToken: newRefreshToken } = await createTokenPair({
      payload: { userId, email },
      accessTokenKey: keyStore.accessTokenKey,
      refreshTokenKey: keyStore.refreshTokenKey
    })

    // lưu refreshToken đã dùng vào db
    await keyModel.updateOne(
      { _id: keyStore._id },
      {
        $push: { refreshTokenUsed: refreshToken },
        $set: { refreshToken: newRefreshToken }
      }
    )
    return {
      shop: {
        userId: foundShop._id,
        email
      },
      accessToken,
      refreshToken: newRefreshToken
    }
  }

}

export default AccessService;
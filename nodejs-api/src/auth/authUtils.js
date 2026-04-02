import jwt from 'jsonwebtoken'
import asyncHandler from '~/core/errorHandle'
import { BadRequestError, AuthFailureError, NotFoundError } from '~/core/error.response.js'
import { StatusCodes } from 'http-status-codes'
import { HEADER } from '~/constants/header'
import KeyTokenService from '~/services/keyToken.service.js'

const createTokenPair = async ({ payload, accessTokenKey, refreshTokenKey }) => {
  try {
    const accessToken = await jwt.sign(payload, accessTokenKey, {
      expiresIn: '2 days'
    })
    const refreshToken = await jwt.sign(payload, refreshTokenKey, {
      expiresIn: '7 days'
    })

    return { accessToken, refreshToken }
    
  } catch (error) {
    throw error
  }
}

const authentication = asyncHandler(async (req, res, next) => {
  // check user từ header
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) {
    throw new AuthFailureError('Invalid request')
  }
  // find key store để lấy accessTokenKey giải mã access token
  const keyStore = await KeyTokenService.findByUserId(userId)
  if (!keyStore) {
    throw new NotFoundError('Key not found')
  }
  // Lấy access token từ header, có thể lấy từ cookie, hoặc header bearner sẽ xử lí khác
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) {
    throw new AuthFailureError('Invalid request')
  }
  try {
    const decodedUser = await jwt.verify(accessToken, keyStore.accessTokenKey)
    // Nếu userId từ client khác với userId giải mã từ token thì m cook
    if (userId !== decodedUser.userId) {
      throw new AuthFailureError('Invalid user')
    }
    req.keyStore = keyStore
    req.user = decodedUser
    return next()
  } catch (error) {
      throw error
  }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
  // check user từ header
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) {
    throw new AuthFailureError('Invalid request')
  }
  // find key store để lấy accessTokenKey giải mã access token
  const keyStore = await KeyTokenService.findByUserId(userId)
  if (!keyStore) {
    throw new NotFoundError('Key not found')
  }
  // Lấy refresh token từ header trong trường hợp refresh token
  if (req.headers[HEADER.REFRESH_TOKEN]) { 
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
      const decodedUser = await jwt.verify(refreshToken, keyStore.refreshTokenKey)
      // Nếu userId từ client khác với userId giải mã từ token thì m cook
      if (userId !== decodedUser.userId) {
        throw new AuthFailureError('Invalid user')
      }
      req.keyStore = keyStore
      req.user = decodedUser
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }

  // Nếu không phải refresh token thì xử lí access token bình thường 
  // Lấy access token từ header, có thể lấy từ cookie, hoặc header bearner sẽ xử lí khác
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) {
    throw new AuthFailureError('Invalid request')
  }
  try {
    const decodedUser = await jwt.verify(accessToken, keyStore.accessTokenKey)
    // Nếu userId từ client khác với userId giải mã từ token thì m cook
    if (userId !== decodedUser.userId) {
      throw new AuthFailureError('Invalid user')
    }
    req.keyStore = keyStore
    req.user = decodedUser
    return next()
  } catch (error) {
      throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await jwt.verify(token, keySecret)
}
    

export { createTokenPair, authentication, verifyJWT, authenticationV2 };
import jwt from 'jsonwebtoken';

import { ApiError } from '../http/ApiError';

import { env } from "~/config/env"

type Payload = {
  role: string[]
  id: number
}

export const TokenService = {
  generateTokens(payload: Payload) {
    const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
    const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: '15d' })
    return { accessToken, refreshToken }
  },

  verifyAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as Payload
      return decoded
    } catch (err) {
      throw new ApiError(401, 'Invalid token')
    }
  },

  verifyRefreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as Payload
      return decoded
    } catch (err) {
      throw new ApiError(401, 'Invalid token')
    }
  }
}
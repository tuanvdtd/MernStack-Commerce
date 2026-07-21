import { Request, Response, NextFunction } from 'express'

import { TokenService } from '~/core/auth/token'
import { ApiError } from '~/core/http/ApiError'

export type AuthRequest = Request & {
  user?: {
    id: string
    role: string
  }
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.Unauthorized('Missing or invalid authorization header')
  }

  const token = authHeader.slice(7)
  const decoded = TokenService.verifyAccessToken(token)

  req.user = {
    id: decoded.id,
    role: decoded.role,
  }

  next()
}

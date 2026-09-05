import { Request, Response, NextFunction } from 'express'

import { ApiError } from '~/core/http/ApiError'

export type IdempotentRequest = Request & { idempotencyKey?: string }

export function requireIdempotencyKey(
  req: IdempotentRequest,
  _res: Response,
  next: NextFunction,
) {
  const key = req.header('Idempotency-Key')
  if (!key || !key.trim()) {
    throw ApiError.BadRequest(
      'Missing required header: Idempotency-Key',
      undefined,
      'IDEMPOTENCY_KEY_REQUIRED',
    )
  }
  req.idempotencyKey = key.trim()
  next()
}

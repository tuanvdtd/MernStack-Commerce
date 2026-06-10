import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import multer from 'multer'

import { env } from '~/config/env'
import { ApiError } from '~/core/http/ApiError'

/**
 * Quan Trọng: Nơi xử lý lỗi tập trung cho toàn bộ express app, gọi: app.use(errorHandler)
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Log chi tiết khi dev
  if (env.NODE_ENV === 'development') {
    console.error('[Unhandled Error]', err)
  }
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(StatusCodes.REQUEST_TOO_LONG)
        .json({ message: 'Maximum file size exceeded. (10MB)' })
    }
    return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
  }

  if (err instanceof ApiError) {
    console.log(err.message);
    return res.status(err.statusCode).json({ message: err.message, details: err.details })
  }
  // Trả lỗi chung nếu chưa handle
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' })
}

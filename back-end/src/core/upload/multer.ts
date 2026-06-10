import multer from 'multer'
import { StatusCodes } from 'http-status-codes'

import { ApiError } from '~/core/http/ApiError'

export const LIMIT_COMMON_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const ALLOW_COMMON_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
] as const

const productImageFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype as (typeof ALLOW_COMMON_FILE_TYPES)[number])) {
    const err = ApiError.UnsupportedMediaType(
      'File type is invalid. Only accept jpg, jpeg and png',
    )
    ;(callback as (error: Error | null, accept: boolean) => void)(err, false)
    return
  }
  callback(null, true)
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: productImageFilter,
})

export const multerUploadMiddleware = {
  upload,
}

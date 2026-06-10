import { NextFunction, Request, Response } from 'express'

import { ApiError } from '~/core/http/ApiError'
import { multerUploadMiddleware } from '~/core/upload/multer'
import {
  assertSpuImageProvided,
  resolveProductImageUrls,
} from '~/modules/products/product.image'
import type { CreateProductInput } from '~/modules/products/product.types'

export type ProductImageUploads = {
  spu?: Express.Multer.File
  skus: Map<number, Express.Multer.File>
}

declare global {
  namespace Express {
    interface Request {
      productImageUploads?: ProductImageUploads
    }
  }
}

function extractProductImageUploads(
  files: Express.Multer.File[] | undefined,
): ProductImageUploads {
  const uploads: ProductImageUploads = { skus: new Map() }

  for (const file of files ?? []) {
    if (file.fieldname === 'spuImage') {
      uploads.spu = file
      continue
    }

    const skuMatch = file.fieldname.match(/^skuImage_(\d+)$/)
    if (skuMatch) {
      uploads.skus.set(Number(skuMatch[1]), file)
    }
  }

  return uploads
}

export const productMultipartUpload = multerUploadMiddleware.upload.any()

export function parseProductFormData(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const rawData = req.body?.data

  if (typeof rawData !== 'string' || !rawData.trim()) {
    throw ApiError.BadRequest('Thiếu dữ liệu sản phẩm (field "data")')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawData)
  } catch {
    throw ApiError.BadRequest('Dữ liệu sản phẩm không hợp lệ (JSON)')
  }

  req.body = parsed
  req.productImageUploads = extractProductImageUploads(
    req.files as Express.Multer.File[] | undefined,
  )
  next()
}

export function assertProductImages(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  assertSpuImageProvided(
    req.body as CreateProductInput,
    req.productImageUploads ?? { skus: new Map() },
  )
  next()
}

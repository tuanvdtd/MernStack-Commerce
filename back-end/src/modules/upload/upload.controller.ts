import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { ApiError } from '~/core/http/ApiError'
import { UploadService } from '~/modules/upload/upload.service'

export const UploadController = {
  uploadProductImage: async (req: AuthRequest, res: Response) => {
    const file = req.file
    if (!file?.buffer) {
      throw ApiError.BadRequest('File cannot be blank.')
    }

    const result = await UploadService.uploadProductImage(file.buffer)
    return res.status(201).json(result)
  },

  deleteProductImage: async (req: AuthRequest, res: Response) => {
    const { publicId } = req.body as { publicId: string }
    const result = await UploadService.deleteProductImage(publicId)
    return res.json(result)
  },
}

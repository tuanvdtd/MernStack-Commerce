import { ApiError } from '~/core/http/ApiError'
import { PRODUCT_IMAGE_FOLDER } from '~/modules/upload/upload.constants'
import { cloudinaryProvider } from '~/providers/cloudinary.provider'

const assertProductImagePublicId = (publicId: string) => {
  if (!publicId.startsWith(`${PRODUCT_IMAGE_FOLDER}/`)) {
    throw ApiError.Forbidden('Invalid image reference')
  }
}

export const UploadService = {
  uploadProductImage: async (fileBuffer: Buffer) => {
    const result = await cloudinaryProvider.streamUpload(
      fileBuffer,
      PRODUCT_IMAGE_FOLDER,
    )
    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    }
  },

  deleteProductImage: async (publicId: string) => {
    assertProductImagePublicId(publicId)
    await cloudinaryProvider.destroy(publicId)
    return { publicId }
  },
}

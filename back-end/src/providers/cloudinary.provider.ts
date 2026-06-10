import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

import { env } from '~/config/env'
import { ApiError } from '~/core/http/ApiError'

type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
  version: number
}

let isConfigured = false

const ensureConfigured = () => {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw ApiError.Internal(
      'Cloudinary chưa được cấu hình. Thêm CLOUDINARY_* vào file .env',
    )
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    })
    isConfigured = true
  }
}

const streamUpload = (fileBuffer: Buffer, folderName: string) => {
  ensureConfigured()

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: 'image' },
      (error, result) => {
        if (result) resolve(result)
        else reject(error)
      },
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

const streamUploadWithOverwrite = (
  fileBuffer: Buffer,
  folderName: string,
  publicId: string,
) => {
  ensureConfigured()

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (result) resolve(result)
        else reject(error)
      },
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

const destroy = async (publicId: string) => {
  ensureConfigured()
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

export const cloudinaryProvider = {
  streamUpload,
  streamUploadWithOverwrite,
  destroy,
}

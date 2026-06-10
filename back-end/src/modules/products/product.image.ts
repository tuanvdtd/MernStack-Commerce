import { ApiError } from '~/core/http/ApiError'
import { PRODUCT_IMAGE_FOLDER } from '~/modules/upload/upload.constants'
import type { CreateProductInput } from '~/modules/products/product.types'
import type { ProductImageUploads } from '~/modules/products/product.middleware'
import type { ProductWithRelations } from '~/modules/products/product.repo'
import { cloudinaryProvider } from '~/providers/cloudinary.provider'
import {
  buildSkuPublicId,
  buildSpuPublicId,
} from '~/utils/productImagePublicId'

const isRemoteImageUrl = (url: string | null | undefined): url is string =>
  Boolean(url?.trim() && /^https?:\/\//i.test(url.trim()))

export function assertSpuImageProvided(
  input: CreateProductInput,
  files: ProductImageUploads,
) {
  if (files.spu || isRemoteImageUrl(input.imgUrl)) return
  throw ApiError.BadRequest('Ảnh đại diện SPU là bắt buộc')
}

async function uploadSpuImage(productId: string, file: Express.Multer.File) {
  const result = await cloudinaryProvider.streamUploadWithOverwrite(
    file.buffer,
    PRODUCT_IMAGE_FOLDER,
    buildSpuPublicId(productId),
  )
  return result.secure_url
}

async function uploadSkuImage(
  productId: string,
  sku: string,
  file: Express.Multer.File,
) {
  const result = await cloudinaryProvider.streamUploadWithOverwrite(
    file.buffer,
    PRODUCT_IMAGE_FOLDER,
    buildSkuPublicId(productId, sku),
  )
  return result.secure_url
}

async function destroySkuImage(productId: string, sku: string) {
  const publicId = `${PRODUCT_IMAGE_FOLDER}/${buildSkuPublicId(productId, sku)}`
  try {
    await cloudinaryProvider.destroy(publicId)
  } catch {
    // Best-effort — ảnh có thể đã bị xóa trước đó
  }
}

export async function resolveProductImageUrls(
  productId: string,
  input: CreateProductInput,
  files: ProductImageUploads,
): Promise<CreateProductInput> {
  let imgUrl = input.imgUrl?.trim() ?? ''

  if (files.spu) {
    imgUrl = await uploadSpuImage(productId, files.spu)
  } else if (!isRemoteImageUrl(imgUrl)) {
    imgUrl = ''
  }

  const variants = await Promise.all(
    input.variants.map(async (variant, index) => {
      const skuFile = files.skus.get(index)
      if (skuFile) {
        return {
          ...variant,
          imgUrl: await uploadSkuImage(productId, variant.sku, skuFile),
        }
      }

      const existingUrl = variant.imgUrl?.trim()
      return {
        ...variant,
        ...(isRemoteImageUrl(existingUrl) ? { imgUrl: existingUrl } : {}),
      }
    }),
  )

  return { ...input, imgUrl, variants }
}

export async function cleanupRemovedProductImages(
  productId: string,
  existing: NonNullable<ProductWithRelations>,
  input: CreateProductInput,
  files: ProductImageUploads,
) {
  const incomingSkus = new Set(input.variants.map((variant) => variant.sku))

  for (const variant of existing.variants) {
    if (!incomingSkus.has(variant.sku) && isRemoteImageUrl(variant.imgUrl)) {
      await destroySkuImage(productId, variant.sku)
      continue
    }

    const index = input.variants.findIndex((item) => item.sku === variant.sku)
    if (index === -1) continue

    const incoming = input.variants[index]
    const hasNewFile = files.skus.has(index)
    const keepsRemoteUrl = isRemoteImageUrl(incoming.imgUrl)

    if (
      isRemoteImageUrl(variant.imgUrl) &&
      !hasNewFile &&
      !keepsRemoteUrl
    ) {
      await destroySkuImage(productId, variant.sku)
    }
  }
}

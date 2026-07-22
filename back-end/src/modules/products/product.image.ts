import { ApiError } from '~/core/http/ApiError'
import { PRODUCT_IMAGE_FOLDER } from '~/modules/upload/upload.constants'
import type { ProductImageInput } from '~/modules/products/product.types'
import { cloudinaryProvider } from '~/providers/cloudinary.provider'
import { newId } from '~/utils/id'

type ExistingProductImage = {
  id: string
  url: string
  publicId: string | null
  sortOrder: number
  alt: string | null
}

type Tx = {
  productImage: {
    deleteMany: (args: {
      where: { productId: string; id?: { in: string[] } }
    }) => Promise<unknown>
    createMany: (args: {
      data: Array<{
        id: string
        productId: string
        url: string
        publicId: string | null
        sortOrder: number
        alt: string | null
      }>
    }) => Promise<unknown>
  }
}

const isManagedPublicId = (publicId: string | null | undefined) =>
  Boolean(publicId?.startsWith(`${PRODUCT_IMAGE_FOLDER}/`))

/**
 * Kiểm tra gallery SPU có ít nhất một ảnh hợp lệ (upload-first qua Cloudinary).
 */
export function assertProductGalleryProvided(images: ProductImageInput[] | undefined) {
  if (images?.length && images.every((img) => img.url.trim())) return
  throw ApiError.BadRequest('Sản phẩm cần ít nhất một ảnh trong gallery')
}

/**
 * Lấy URL ảnh đầu gallery (sortOrder nhỏ nhất) để sync vào Product.thumbnail.
 */
export function resolvePrimaryImageUrl(images: ProductImageInput[]): string {
  if (!images.length) return ''
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  return sorted[0]?.url.trim() ?? ''
}

/**
 * Xóa ảnh Cloudinary không còn tham chiếu trong gallery (best-effort).
 */
export async function destroyManagedImages(publicIds: string[]) {
  await Promise.allSettled(
    publicIds.filter(isManagedPublicId).map(async (publicId) => {
      try {
        await cloudinaryProvider.destroy(publicId!)
      } catch {
        // Ảnh có thể đã bị xóa trước đó
      }
    }),
  )
}

/**
 * Thay thế toàn bộ gallery của product: xóa record cũ, dọn Cloudinary orphan, tạo record mới.
 */
export async function replaceProductImages(
  tx: Tx,
  productId: string,
  incoming: ProductImageInput[],
  existing: ExistingProductImage[],
): Promise<string> {
  const incomingPublicIds = new Set(incoming.map((img) => img.publicId))
  const removedPublicIds = existing
    .map((img) => img.publicId)
    .filter((publicId): publicId is string => {
      if (!publicId) return false
      return !incomingPublicIds.has(publicId)
    })

  await tx.productImage.deleteMany({ where: { productId } })

  if (incoming.length > 0) {
    await tx.productImage.createMany({
      data: incoming.map((img) => ({
        id: newId(),
        productId,
        url: img.url.trim(),
        publicId: img.publicId.trim() || null,
        sortOrder: img.sortOrder,
        alt: img.alt?.trim() || null,
      })),
    })
  }

  if (removedPublicIds.length > 0) {
    await destroyManagedImages(removedPublicIds)
  }

  return resolvePrimaryImageUrl(incoming)
}

/**
 * Dọn toàn bộ ảnh Cloudinary của product khi xóa SPU.
 */
export async function cleanupProductGalleryImages(
  images: Array<{ publicId: string | null }>,
) {
  const publicIds = images
    .map((img) => img.publicId)
    .filter((publicId): publicId is string => Boolean(publicId))
  await destroyManagedImages(publicIds)
}

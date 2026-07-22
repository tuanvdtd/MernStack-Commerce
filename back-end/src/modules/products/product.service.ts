import { logger } from '~/config/logger'
import { ApiError } from '~/core/http/ApiError'
import {
  publishProductEvent,
  type ProductEventAction,
} from '~/lib/rabbitmq'
import { CategoryRepo } from '~/modules/categories/category.repo'
import {
  assertProductGalleryProvided,
  cleanupProductGalleryImages,
} from '~/modules/products/product.image'
import { toAdminProduct } from '~/modules/products/product.mapper'
import { ProductRepo } from '~/modules/products/product.repo'
import type {
  CreateProductInput,
  PatchProductSpuInput,
  UpdateProductVariantsInput,
} from '~/modules/products/product.types'
import { AttributeDictionaryService } from '~/modules/search/attribute-dictionary.service'
import { SyncService } from '~/modules/search/sync.service'
import { generateProductSlug } from '~/utils/productSlug'

/**
 * Điều phối đồng bộ search sau mỗi thao tác ghi product (create/patch/update/delete).
 *
 * @param spuId  id của Product (SPU) vừa thay đổi.
 * @param action 'upsert' | 'delete' — dùng chung contract với publisher & worker.
 */
async function dispatchProductSync(spuId: string, action: ProductEventAction) {
  await AttributeDictionaryService.invalidate().catch((err) => {
    logger.error({ err, spuId }, 'Failed to invalidate attribute dictionary cache')
  })

  const published = await publishProductEvent({ productId: spuId, action })
  if (published) {
    logger.info({ spuId, action }, 'Product sync event published to RabbitMQ')
    return
  }

  logger.warn(
    { spuId, action },
    'RabbitMQ unavailable — falling back to in-process ES sync',
  )
  if (action === 'delete') {
    await SyncService.deleteSpu(spuId)
  } else {
    await SyncService.syncSpu(spuId)
  }
}

/** Fire-and-forget wrapper — không chặn/đánh fail luồng CRUD chính. */
function syncSearchIndex(spuId: string, action: ProductEventAction) {
  void dispatchProductSync(spuId, action).catch((err) => {
    logger.error({ err, spuId, action }, 'Search index sync failed')
  })
}

export const ProductService = {
  async list() {
    const products = await ProductRepo.list()
    return products.map(toAdminProduct)
  },

  async getById(id: string) {
    const product = await ProductRepo.findById(id)
    if (!product) throw ApiError.NotFound('Product not found')
    return toAdminProduct(product)
  },

  async create(input: CreateProductInput) {
    assertProductGalleryProvided(input.images)

    const category = await CategoryRepo.findById(input.categoryId)
    if (!category) throw ApiError.NotFound('Category not found')

    const slug = generateProductSlug(input.name)
    const product = await ProductRepo.create(input, slug)
    if (!product) throw ApiError.Internal('Failed to create product')

    syncSearchIndex(product.id, 'upsert')
    return toAdminProduct(product)
  },

  /** Bước 1 edit — partial SPU, gallery gửi kèm JSON (upload-first). */
  async patchSpu(id: string, input: PatchProductSpuInput) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    if (input.categoryId) {
      const category = await CategoryRepo.findById(input.categoryId)
      if (!category) throw ApiError.NotFound('Category not found')
    }

    const product = await ProductRepo.patchSpu(id, input)
    if (!product) throw ApiError.Internal('Failed to update product')

    syncSearchIndex(product.id, 'upsert')
    return toAdminProduct(product)
  },

  /** Bước 2 edit — replace toàn bộ variant (ảnh SKU là URL đã upload trước). */
  async updateVariants(id: string, input: UpdateProductVariantsInput) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    const existingIds = new Set(existing.variants.map((v) => v.id))
    for (const variant of input.variants) {
      if (variant.id && !existingIds.has(variant.id)) {
        throw ApiError.BadRequest(`Variant id "${variant.id}" not found on product`)
      }
    }

    try {
      const product = await ProductRepo.replaceVariants(id, input)
      if (!product) throw ApiError.Internal('Failed to update variants')
      syncSearchIndex(product.id, 'upsert')
      return toAdminProduct(product)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.includes('Foreign key constraint')) {
        throw ApiError.Conflict(
          'Cannot remove variant that is referenced by cart or orders',
        )
      }
      throw error
    }
  },

  async remove(id: string) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    await cleanupProductGalleryImages(existing.images)

    try {
      await ProductRepo.delete(id)
      syncSearchIndex(id, 'delete')
      return { id }
    } catch {
      throw ApiError.Conflict('Cannot delete product with active references')
    }
  },
}

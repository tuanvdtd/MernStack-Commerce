import { logger } from '~/config/logger'
import { ApiError } from '~/core/http/ApiError'
import {
  publishProductEvent,
  type ProductEventAction,
} from '~/lib/rabbitmq'
import { CategoryRepo } from '~/modules/categories/category.repo'
import {
  cleanupRemovedVariantImages,
  resolveProductImageUrls,
  resolveSpuImageForPatch,
  resolveVariantsImageUrls,
} from '~/modules/products/product.image'
import { toAdminProduct } from '~/modules/products/product.mapper'
import type { ProductImageUploads } from '~/modules/products/product.middleware'
import { ProductRepo } from '~/modules/products/product.repo'
import type {
  CreateProductInput,
  PatchProductSpuInput,
  UpdateProductVariantsInput,
} from '~/modules/products/product.types'
import { AttributeDictionaryService } from '~/modules/search/attribute-dictionary.service'
import { SyncService } from '~/modules/search/sync.service'
import { generateProductSlug } from '~/utils/productSlug'

const emptyUploads = (): ProductImageUploads => ({ skus: new Map() })

/**
 * Điều phối đồng bộ search sau mỗi thao tác ghi product (create/patch/update/delete).
 *
 * @param spuId  id của Product (SPU) vừa thay đổi.
 * @param action 'upsert' | 'delete' — dùng chung contract với publisher & worker.
 *
 * Luồng 3 bước:
 *
 * 1. INVALIDATE DICTIONARY CACHE
 *    - Query parser (scenario 3) cache map `Option -> values + synonyms` ở Redis (TTL 300s).
 *    - Tạo/sửa product có thể sinh Option/OptionValue mới → phải xóa cache để parser
 *      nhận diện giá trị mới ngay, không phải đợi hết TTL.
 *    - Đặt ở API (không phải worker) vì cache phục vụ luồng đọc chạy trong API process
 *      (giống kiến trúc bản NestJS gốc).
 *    - `.catch` nuốt lỗi: xóa cache thất bại không được làm hỏng cả luồng; tệ nhất parser
 *      dùng dữ liệu cũ thêm vài phút.
 *
 * 2. PUBLISH EVENT LÊN RABBITMQ (happy path)
 *    - Bắn message { productId, action } vào exchange `product.events`
 *      (key product.upsert | product.delete, persistent).
 *    - Publish OK → return ngay; việc index ES do Worker xử lý bất đồng bộ.
 *
 * 3. FALLBACK SYNC IN-PROCESS
 *    - Khi publish trả về false (RABBITMQ_URI chưa cấu hình HOẶC broker lỗi),
 *      API tự gọi thẳng SyncService để ES vẫn được cập nhật → không mất dữ liệu,
 *      đồng thời cho phép dev chạy mà không cần dựng RabbitMQ.
 *    - upsert -> syncSpu (xóa SKU cũ rồi bulk index lại); delete -> deleteSpu.
 *
 * Lưu ý:
 *  - Hàm được gọi qua wrapper `syncSearchIndex` theo kiểu fire-and-forget nên không
 *    chặn/đánh fail response của admin.
 *  - syncSpu/deleteSpu là idempotent (delete-then-reindex theo spuId), nên nếu hiếm khi
 *    vừa publish được vừa rơi vào fallback thì kết quả cuối vẫn đúng, không sinh rác.
 */
async function dispatchProductSync(spuId: string, action: ProductEventAction) {
  // Bước 1: xóa cache dictionary (best-effort, không chặn luồng nếu Redis lỗi).
  await AttributeDictionaryService.invalidate().catch((err) => {
    logger.error({ err, spuId }, 'Failed to invalidate attribute dictionary cache')
  })

  // Bước 2: publish event để Worker index ES bất đồng bộ.
  const published = await publishProductEvent({ productId: spuId, action })
  if (published) {
    logger.info({ spuId, action }, 'Product sync event published to RabbitMQ')
    return
  }

  // Bước 3: RabbitMQ không khả dụng → fallback sync trực tiếp trong API process.
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

async function assertSkusUnique(
  variants: CreateProductInput['variants'],
  excludeProductId?: string,
) {
  for (const variant of variants) {
    const existing = await ProductRepo.findBySku(variant.sku, excludeProductId)
    if (existing) {
      throw ApiError.Conflict(`SKU code "${variant.sku}" already exists`)
    }
  }
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

  async create(input: CreateProductInput, files: ProductImageUploads = emptyUploads()) {
    const category = await CategoryRepo.findById(input.categoryId)
    if (!category) throw ApiError.NotFound('Category not found')

    await assertSkusUnique(input.variants)

    const slug = generateProductSlug(input.name)
    const draftInput: CreateProductInput = {
      ...input,
      imgUrl: '',
      variants: input.variants.map((variant) => ({
        ...variant,
        imgUrl: undefined,
      })),
    }

    const created = await ProductRepo.create(draftInput, slug)
    if (!created) throw ApiError.Internal('Failed to create product')

    const resolved = await resolveProductImageUrls(created.id, input, files)

    // Tạo mới: lưu ảnh SPU rồi ghi đè variants kèm ảnh SKU (2 phase sau create draft)
    await ProductRepo.patchSpu(created.id, { imgUrl: resolved.imgUrl })

    const product = await ProductRepo.replaceVariants(created.id, {
      optionAxes: resolved.optionAxes,
      variants: resolved.variants,
    })
    if (!product) throw ApiError.Internal('Failed to save product')

    syncSearchIndex(product.id, 'upsert')
    return toAdminProduct(product)
  },

  /** Bước 1 edit — partial SPU, upload ảnh nếu có file multipart. */
  async patchSpu(
    id: string,
    input: PatchProductSpuInput,
    files: ProductImageUploads = emptyUploads(),
  ) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    if (input.categoryId) {
      const category = await CategoryRepo.findById(input.categoryId)
      if (!category) throw ApiError.NotFound('Category not found')
    }

    const resolved = await resolveSpuImageForPatch(
      id,
      existing.imgUrl,
      input,
      files,
    )

    const product = await ProductRepo.patchSpu(id, resolved)
    if (!product) throw ApiError.Internal('Failed to update product')

    syncSearchIndex(product.id, 'upsert')
    return toAdminProduct(product)
  },

  /** Bước 2 edit — replace toàn bộ SKU, dọn ảnh Cloudinary của SKU bị xóa/đổi. */
  async updateVariants(
    id: string,
    input: UpdateProductVariantsInput,
    files: ProductImageUploads = emptyUploads(),
  ) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    const existingSkus = new Set(existing.variants.map((v) => v.sku))
    const newVariants = input.variants.filter((v) => !existingSkus.has(v.sku))
    await assertSkusUnique(newVariants, id)

    await cleanupRemovedVariantImages(id, existing, input, files)

    const resolved = await resolveVariantsImageUrls(id, input, files)

    try {
      const product = await ProductRepo.replaceVariants(id, resolved)
      if (!product) throw ApiError.Internal('Failed to update variants')
      syncSearchIndex(product.id, 'upsert')
      return toAdminProduct(product)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.includes('Foreign key constraint')) {
        throw ApiError.Conflict(
          'Cannot remove SKU that is referenced by cart or orders',
        )
      }
      throw error
    }
  },

  async remove(id: string) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    try {
      await ProductRepo.delete(id)
      syncSearchIndex(id, 'delete')
      return { id }
    } catch {
      throw ApiError.Conflict('Cannot delete product with active references')
    }
  },
}
